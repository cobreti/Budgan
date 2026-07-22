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
import { MatSelect, MatSelectChange, MatSelectTrigger } from '@angular/material/select';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { TranslatePipe } from '@ngx-translate/core';
import {
  ACCOUNT_ANALYSIS_SERVICE,
  AccountAnalysisService,
} from '@services/account-analysis.service';
import {
  ACCOUNT_TRANSACTION_SERVICE,
  AccountTransactionService,
} from '@services/account-transaction.service';
import { LOCALE_SERVICE, LocaleService } from '@services/locale.service';
import { MonthRange, ViewType, monthsBetween, toMonthKey } from '@/utils/recurring-month';
import { BalanceTrendGraphComponent } from '@views/accounts/account-graphs/balance-trend-graph/balance-trend-graph.component';
import { RecurringPieChartComponent } from '@views/accounts/account-graphs/recurring-pie-chart/recurring-pie-chart.component';

@Component({
  selector: 'app-account-graphs',
  templateUrl: './account-graphs.component.html',
  styleUrl: './account-graphs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BalanceTrendGraphComponent,
    RecurringPieChartComponent,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatFormField,
    MatLabel,
    MatSelect,
    MatSelectTrigger,
    MatOption,
    TranslatePipe,
  ],
})
export class AccountGraphsComponent {
  private readonly _analysisService = inject<AccountAnalysisService>(ACCOUNT_ANALYSIS_SERVICE);
  private readonly _transactionService = inject<AccountTransactionService>(
    ACCOUNT_TRANSACTION_SERVICE,
  );
  private readonly _locale = inject<LocaleService>(LOCALE_SERVICE);
  private readonly _cdr = inject(ChangeDetectorRef);

  readonly accountId = input.required<string>();

  protected readonly viewTypes: ViewType[] = ['all', 'expense', 'income'];
  protected readonly viewType = signal<ViewType>('all');
  protected readonly startMonth = signal<string | null>(null);
  protected readonly endMonth = signal<string | null>(null);
  private readonly _recurringRange = signal<MonthRange | null>(null);
  private _recurringMonthsRequestId = 0;

  // Ascending, so a start/end pair of dropdowns reads naturally left to right.
  readonly availableMonths = computed(() => {
    const range = this._recurringRange();
    if (!range) return [];
    return monthsBetween(range);
  });

  constructor() {
    // Discovers which months are selectable (from the recognized recurring
    // patterns' first/last occurrence matching the selected view type) and
    // picks a default month.
    effect(() => {
      const id = this.accountId();
      const viewType = this.viewType();
      this._transactionService.transactionsVersion();
      this._loadRecurringMonths(id, viewType);
    });
  }

  monthLabel(month: string): string {
    return moment(month, 'YYYY-MM').locale(this._locale.currentLocale()).format('MMMM YYYY');
  }

  viewTypeLabelKey(viewType: ViewType): string {
    if (viewType === 'expense') return 'recurringPieChart.expenses';
    if (viewType === 'income') return 'recurringPieChart.incomes';
    return 'recurringPieChart.all';
  }

  onViewTypeChange(change: MatSelectChange): void {
    this.viewType.set(change.value as ViewType);
  }

  onStartMonthChange(change: MatSelectChange): void {
    const value = change.value as string;
    this.startMonth.set(value);
    const end = this.endMonth();
    if (end && value > end) {
      this.endMonth.set(value);
    }
  }

  onEndMonthChange(change: MatSelectChange): void {
    const value = change.value as string;
    this.endMonth.set(value);
    const start = this.startMonth();
    if (start && value < start) {
      this.startMonth.set(value);
    }
  }

  private async _loadRecurringMonths(accountId: string, viewType: ViewType): Promise<void> {
    // Guards against out-of-order async resolution: if accountId/viewType
    // changes again before this call resolves, a later call's request id
    // will have moved on, so this (now stale) result is discarded instead of
    // overwriting the dropdowns with another account's months.
    const requestId = ++this._recurringMonthsRequestId;
    const recurring = await this._analysisService.getRecurringTransactions(accountId);
    if (requestId !== this._recurringMonthsRequestId) return;

    // averageAmount carries the sign of every occurrence in the group (recurringId
    // buckets amounts into a narrow range, so it never mixes expenses and income).
    // 'all' keeps both signs.
    const matchingRecurring = recurring.filter((r) => {
      if (viewType === 'expense') return r.averageAmount < 0;
      if (viewType === 'income') return r.averageAmount > 0;
      return true;
    });

    if (matchingRecurring.length === 0) {
      this._recurringRange.set(null);
      this.startMonth.set(null);
      this.endMonth.set(null);
      this._cdr.markForCheck();
      return;
    }

    const startDate = matchingRecurring
      .map((r) => r.firstOccurrenceDate)
      .reduce((min, d) => (d < min ? d : min));
    const endDate = matchingRecurring
      .map((r) => r.lastOccurrenceDate)
      .reduce((max, d) => (d > max ? d : max));

    const startMonthKey = toMonthKey(startDate);
    const endMonthKey = toMonthKey(endDate);
    const range: MonthRange | null =
      startMonthKey && endMonthKey ? { start: startMonthKey, end: endMonthKey } : null;
    this._recurringRange.set(range);

    const months = range ? monthsBetween(range) : [];

    // Default to the full available span; keep an existing selection if it's
    // still valid within the (possibly changed) range, otherwise reset it.
    const currentStart = this.startMonth();
    const currentEnd = this.endMonth();
    const validStart =
      currentStart && months.includes(currentStart) ? currentStart : (months[0] ?? null);
    const validEnd =
      currentEnd && months.includes(currentEnd) ? currentEnd : (months[months.length - 1] ?? null);

    this.startMonth.set(validStart);
    this.endMonth.set(validStart && validEnd && validEnd < validStart ? validStart : validEnd);

    this._cdr.markForCheck();
  }
}
