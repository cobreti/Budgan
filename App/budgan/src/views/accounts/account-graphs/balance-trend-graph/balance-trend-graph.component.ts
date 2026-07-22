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
import { formatIsoDate, previousIsoDay } from '@/utils/date';
import { monthBounds, ViewType } from '@/utils/recurring-month';

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
  readonly viewType = input.required<ViewType>();
  readonly selectedMonth = input.required<string | null>();

  protected readonly _allPoints = signal<DataPoint[]>([]);

  // Windows the full balance history to the selected month. The point carried
  // in from just before the month start anchors the line so it doesn't start
  // from a visual discontinuity — it reflects the real balance entering the
  // month, not a reset to zero.
  protected readonly _points = computed<DataPoint[]>(() => {
    const all = this._allPoints();
    const month = this.selectedMonth();
    if (!month) return all;

    const { start, end } = monthBounds(month);
    const startIso = formatIsoDate(start).replaceAll('-', '');
    const endIso = formatIsoDate(end).replaceAll('-', '');

    const withinMonth = all.filter((p) => p.date >= startIso && p.date <= endIso);
    const before = all.filter((p) => p.date < startIso);
    const carryIn = before.length > 0 ? before[before.length - 1] : null;

    if (!carryIn || withinMonth[0]?.date === startIso) return withinMonth;

    return [{ date: startIso, balance: carryIn.balance }, ...withinMonth];
  });

  // A full, unscoped history needs 2+ points to read as a "trend" at all.
  // Once zoomed to a single month, though, even one point is real data (just
  // a quiet month) rather than an absence of data — so the bar to display
  // something is lower.
  readonly hasData = computed<boolean>(() => {
    const pts = this._points();
    return this.selectedMonth() ? pts.length >= 1 : pts.length >= 2;
  });

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
        (t) => t.recordType === AccountTransactionRecordType.normal && t.balance !== undefined,
      )
      .sort((a, b) => {
        const d = a.dateInscriptionAsString.localeCompare(b.dateInscriptionAsString);
        if (d !== 0) return d;
        return (a.balanceDateOffset ?? 0) - (b.balanceDateOffset ?? 0);
      });

    if (normal.length === 0) {
      this._allPoints.set([]);
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
    const snapshotTx = txs.find((t) => t.recordType === AccountTransactionRecordType.snapshot);
    const allPoints: DataPoint[] = normal.map((t) => ({
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

    this._allPoints.set([opening, ...allPoints]);
    this._cdr.markForCheck();
  }
}
