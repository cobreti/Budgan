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
import { TranslatePipe } from '@ngx-translate/core';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartData, ChartOptions } from 'chart.js';
import {
  ACCOUNT_TRANSACTION_SERVICE,
  AccountTransactionService,
} from '@services/account-transaction.service';
import { monthBounds, ViewType } from '@/utils/recurring-month';

type RecurringSlice = { description: string; amount: number };

@Component({
  selector: 'app-recurring-pie-chart',
  templateUrl: './recurring-pie-chart.component.html',
  styleUrl: './recurring-pie-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, BaseChartDirective],
})
export class RecurringPieChartComponent {
  private readonly _transactionService = inject<AccountTransactionService>(
    ACCOUNT_TRANSACTION_SERVICE,
  );
  private readonly _cdr = inject(ChangeDetectorRef);

  readonly accountId = input.required<string>();
  readonly viewType = input.required<ViewType>();
  readonly startMonth = input.required<string | null>();
  readonly endMonth = input.required<string | null>();

  protected readonly slices = signal<RecurringSlice[]>([]);

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
    // Recomputed whenever the account, view type, or selected range changes.
    effect(() => {
      const id = this.accountId();
      const startMonth = this.startMonth();
      const endMonth = this.endMonth();
      const viewType = this.viewType();
      this._transactionService.transactionsVersion();
      this._loadSlicesForRange(id, startMonth, endMonth, viewType);
    });
  }

  private async _loadSlicesForRange(
    accountId: string,
    startMonth: string | null,
    endMonth: string | null,
    viewType: ViewType,
  ): Promise<void> {
    if (!startMonth || !endMonth) {
      this.slices.set([]);
      this._cdr.markForCheck();
      return;
    }

    const start = monthBounds(startMonth).start;
    const end = monthBounds(endMonth).end;
    const txs = await this._transactionService.getRecurringTransactionsByAccount(
      accountId,
      start,
      end,
    );

    // getRecurringTransactionsByAccount returns both signs; keep only the
    // ones matching the selected view type.
    const matchingTxs = txs.filter((t) => (viewType === 'expense' ? t.amount < 0 : t.amount > 0));

    const totals = new Map<string, number>();
    for (const t of matchingTxs) {
      totals.set(t.description, (totals.get(t.description) ?? 0) + Math.abs(t.amount));
    }

    const slices = [...totals.entries()]
      .map(([description, amount]) => ({ description, amount }))
      .sort((a, b) => b.amount - a.amount);

    this.slices.set(slices);
    this._cdr.markForCheck();
  }
}
