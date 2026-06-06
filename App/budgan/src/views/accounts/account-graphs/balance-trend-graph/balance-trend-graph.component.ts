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
import { ACCOUNT_SERVICE, AccountService } from '@services/account.service';
import {
  AccountTransactionModel,
  AccountTransactionRecordType,
} from '@models/accountTransactionModel';
import { previousIsoDay } from '@/utils/date';

type DataPoint = { date: string; balance: number };

@Component({
  selector: 'app-balance-trend-graph',
  templateUrl: './balance-trend-graph.component.html',
  styleUrl: './balance-trend-graph.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, BaseChartDirective],
})
export class BalanceTrendGraphComponent {
  private readonly _transactionService = inject<AccountTransactionService>(
    ACCOUNT_TRANSACTION_SERVICE,
  );
  private readonly _accountService = inject<AccountService>(ACCOUNT_SERVICE);
  private readonly _cdr = inject(ChangeDetectorRef);

  readonly accountId = input.required<string>();

  protected readonly _points = signal<DataPoint[]>([]);

  readonly chartData = computed<ChartData<'line'>>(() => ({
    labels: this._points().map(p => p.date.slice(5)), // MM-DD
    datasets: [
      {
        data: this._points().map(p => p.balance),
        fill: false,
        tension: 0.1,
        pointRadius: 3,
      },
    ],
  }));

  readonly chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        ticks: { maxTicksLimit: 5, maxRotation: 0 },
      },
      y: {
        ticks: { maxTicksLimit: 5 },
      },
    },
  };

  constructor() {
    effect(() => {
      const id = this.accountId();
      // Track transactionsVersion so this effect re-runs when balances are recalculated
      this._transactionService.transactionsVersion();
      this._loadPoints(id);
    });
  }

  private async _loadPoints(accountId: string): Promise<void> {
    const [account, txs] = await Promise.all([
      this._accountService.getById(accountId),
      this._transactionService.getListByAccount(accountId),
    ]);

    // Keep only normal transactions that have a computed balance, sorted chronologically
    const normal: AccountTransactionModel[] = txs
      .filter(
        t => t.recordType === AccountTransactionRecordType.normal && t.balance !== undefined,
      )
      .sort((a, b) => {
        const d = a.dateInscriptionAsString.localeCompare(b.dateInscriptionAsString);
        if (d !== 0) return d;
        return (a.balanceDateOffset ?? 0) - (b.balanceDateOffset ?? 0);
      });

    if (normal.length === 0) {
      this._points.set([]);
      this._cdr.markForCheck();
      return;
    }

    // Opening point: the known balance one day before the earliest transaction.
    // Falls back to 0 when no reference balance is set (no snapshot).
    const opening: DataPoint = account.referenceBalance
      ? { date: account.referenceBalance.date, balance: account.referenceBalance.balance }
      : { date: previousIsoDay(normal[0].dateInscriptionAsString), balance: 0 };

    this._points.set([
      opening,
      ...normal.map(t => ({ date: t.dateInscriptionAsString, balance: t.balance! })),
    ]);
    this._cdr.markForCheck();
  }
}
