import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import moment from 'moment';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartData, ChartOptions } from 'chart.js';
import {
  ACCOUNT_TRANSACTION_SERVICE,
  AccountTransactionService,
} from '@services/account-transaction.service';
import {
  ACCOUNT_ANALYSIS_SERVICE,
  AccountAnalysisService,
} from '@services/account-analysis.service';
import { LOCALE_SERVICE, LocaleService } from '@services/locale.service';

type RecurringSlice = { description: string; amount: number };
type MonthRange = { start: string; end: string };

// Normalizes any parseable date string to a canonical 'YYYY-MM' key. Using
// moment (rather than a raw string slice) means transaction dates that
// aren't already zero-padded ISO (e.g. '2026-7-5') still produce the same
// key as the moment-formatted keys used for the month dropdown, so the two
// never silently fail to match.
function toMonthKey(dateAsString: string): string | null {
  const parsed = moment(dateAsString);
  return parsed.isValid() ? parsed.format('YYYY-MM') : null;
}

function monthsBetween(range: MonthRange): string[] {
  const months: string[] = [];
  const cursor = moment(range.start, 'YYYY-MM');
  const last = moment(range.end, 'YYYY-MM');
  while (cursor.isSameOrBefore(last, 'month')) {
    months.push(cursor.format('YYYY-MM'));
    cursor.add(1, 'month');
  }
  return months;
}

function monthBounds(month: string): { start: Date; end: Date } {
  return {
    start: moment(month, 'YYYY-MM').startOf('month').toDate(),
    end: moment(month, 'YYYY-MM').endOf('month').toDate(),
  };
}

@Component({
  selector: 'app-recurring-pie-chart',
  templateUrl: './recurring-pie-chart.component.html',
  styleUrl: './recurring-pie-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, BaseChartDirective, MatFormField, MatLabel, MatSelect, MatOption],
})
export class RecurringPieChartComponent {
  private readonly _transactionService = inject<AccountTransactionService>(
    ACCOUNT_TRANSACTION_SERVICE,
  );
  private readonly _analysisService = inject<AccountAnalysisService>(ACCOUNT_ANALYSIS_SERVICE);
  private readonly _locale = inject<LocaleService>(LOCALE_SERVICE);
  private readonly _cdr = inject(ChangeDetectorRef);

  readonly accountId = input.required<string>();

  protected readonly _recurringRange = signal<MonthRange | null>(null);
  protected readonly selectedMonth = signal<string | null>(null);
  protected readonly slices = signal<RecurringSlice[]>([]);

  readonly availableMonths = computed(() => {
    const range = this._recurringRange();
    if (!range) return [];
    return monthsBetween(range).reverse();
  });

  readonly chartData = computed<ChartData<'pie'>>(() => {
    const slices = this.slices();
    return {
      labels: slices.map((s) => s.description),
      datasets: [{ data: slices.map((s) => s.amount) }],
    };
  });

  readonly chartOptions: ChartOptions<'pie'> = {
    responsive: true,
    // The chart fills whatever box its container is given (see
    // .recurring-pie-chart__chart-container) instead of deriving its own
    // height from an aspect ratio, so it never grows past the card's bounds.
    maintainAspectRatio: false,
    plugins: {
      // 'right' stacks the legend as a vertical list beside the chart. Items
      // follow the dataset's own order, which `slices` already sorts by
      // amount descending, so the legend reads highest-to-lowest top to bottom.
      legend: { position: 'right', align: 'start' },
    },
  };

  constructor() {
    // Discovers which months are selectable (from the recognized recurring
    // expense patterns' first/last occurrence) and picks a default month.
    effect(() => {
      const id = this.accountId();
      this._transactionService.transactionsVersion();
      this._loadRecurringMonths(id);
    });

    // Recomputed on every dropdown change: only the selected month's
    // transactions are fetched, not the whole recurring date range.
    effect(() => {
      const id = this.accountId();
      const month = this.selectedMonth();
      this._transactionService.transactionsVersion();
      this._loadSlicesForMonth(id, month);
    });
  }

  monthLabel(month: string): string {
    return moment(month, 'YYYY-MM').locale(this._locale.currentLocale()).format('MMMM YYYY');
  }

  onMonthChange(change: MatSelectChange): void {
    this.selectedMonth.set(change.value as string);
  }

  private async _loadRecurringMonths(accountId: string): Promise<void> {
    const recurring = await this._analysisService.getRecurringTransactions(accountId);

    // averageAmount carries the sign of every occurrence in the group (recurringId
    // buckets amounts into a narrow range, so it never mixes expenses and income).
    const expenseRecurring = recurring.filter((r) => r.averageAmount < 0);

    if (expenseRecurring.length === 0) {
      this._recurringRange.set(null);
      this.selectedMonth.set(null);
      this._cdr.markForCheck();
      return;
    }

    const startDate = expenseRecurring
      .map((r) => r.firstOccurrenceDate)
      .reduce((min, d) => (d < min ? d : min));
    const endDate = expenseRecurring
      .map((r) => r.lastOccurrenceDate)
      .reduce((max, d) => (d > max ? d : max));

    const startMonth = toMonthKey(startDate);
    const endMonth = toMonthKey(endDate);
    const range: MonthRange | null =
      startMonth && endMonth ? { start: startMonth, end: endMonth } : null;
    this._recurringRange.set(range);

    const months = range ? monthsBetween(range).reverse() : [];
    const current = this.selectedMonth();
    if (!current || !months.includes(current)) {
      this.selectedMonth.set(months[0] ?? null);
    }

    this._cdr.markForCheck();
  }

  private async _loadSlicesForMonth(accountId: string, month: string | null): Promise<void> {
    if (!month) {
      this.slices.set([]);
      this._cdr.markForCheck();
      return;
    }

    const { start, end } = monthBounds(month);
    const txs = await this._transactionService.getRecurringTransactionsByAccount(
      accountId,
      start,
      end,
    );

    const totals = new Map<string, number>();
    for (const t of txs) {
      // if (!recurringIds.has(t.recurringId)) continue;
      totals.set(t.description, (totals.get(t.description) ?? 0) + Math.abs(t.amount));
    }

    const slices = [...totals.entries()]
      .map(([description, amount]) => ({ description, amount }))
      .sort((a, b) => b.amount - a.amount);

    this.slices.set(slices);
    this._cdr.markForCheck();
  }
}
