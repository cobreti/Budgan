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

type DataPoint = { date: string; balance: number; isSnapshot?: boolean };

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

  readonly chartData = computed<ChartData<'line'>>(() => {
    const pts = this._points();
    return {
      labels: pts.map((p) => p.date), // MM-DD
      datasets: [
        {
          data: pts.map((p) => p.balance),
          fill: true,
          tension: 0.1,
          // Per-point styling: snapshot gets a larger amber dot.
          // Scriptable functions are evaluated independently per point — unlike arrays,
          // they have no carry-forward behaviour for undefined values.
          pointRadius: (ctx) => (pts[ctx.dataIndex]?.isSnapshot ? 3 : 3),
          pointBackgroundColor: (ctx) =>
            pts[ctx.dataIndex]?.isSnapshot ? 'rgba(255, 152, 0, 1)' : 'rgba(100, 100, 200, 1)',
          pointBorderColor: (ctx) =>
            pts[ctx.dataIndex]?.isSnapshot ? 'rgba(255, 152, 0, 1)' : 'rgba(100, 100, 200, 1)',
          pointBorderWidth: (ctx) => (pts[ctx.dataIndex]?.isSnapshot ? 1 : 1),
        },
      ],
    };
  });

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

    // Build remaining points: normal transactions + the snapshot itself (if present).
    // The snapshot has balanceDateOffset === 0, so it sorts between pre-snapshot
    // transactions (negative offset) and on-or-after-snapshot transactions (positive offset).
    const snapshotTx = txs.find(t => t.recordType === AccountTransactionRecordType.snapshot);
    const allPoints: DataPoint[] = normal.map(t => ({
      date: t.dateInscriptionAsString,
      balance: t.balance!,
    }));

    if (snapshotTx) {
      allPoints.push({
        date: snapshotTx.dateInscriptionAsString,
        balance: snapshotTx.amount,
        isSnapshot: true,
      });
      allPoints.sort((a, b) => {
        const d = a.date.localeCompare(b.date);
        if (d !== 0) return d;
        // On the same date: snapshot (isSnapshot) sits between negative-offset
        // and positive-offset normal rows — sort it to offset 0 position.
        if (a.isSnapshot) return -1;
        if (b.isSnapshot) return 1;
        return 0;
      });
    }

    this._points.set([opening, ...allPoints]);
    this._cdr.markForCheck();
  }
}
