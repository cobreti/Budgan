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

  protected readonly viewTypes: ViewType[] = ['expense', 'income'];
  protected readonly viewType = signal<ViewType>('expense');
  protected readonly selectedMonth = signal<string | null>(null);
  private readonly _recurringRange = signal<MonthRange | null>(null);

  readonly availableMonths = computed(() => {
    const range = this._recurringRange();
    if (!range) return [];
    return monthsBetween(range).reverse();
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
    return viewType === 'expense' ? 'recurringPieChart.expenses' : 'recurringPieChart.incomes';
  }

  onViewTypeChange(change: MatSelectChange): void {
    this.viewType.set(change.value as ViewType);
  }

  onMonthChange(change: MatSelectChange): void {
    this.selectedMonth.set(change.value as string);
  }

  private async _loadRecurringMonths(accountId: string, viewType: ViewType): Promise<void> {
    const recurring = await this._analysisService.getRecurringTransactions(accountId);

    // averageAmount carries the sign of every occurrence in the group (recurringId
    // buckets amounts into a narrow range, so it never mixes expenses and income).
    const matchingRecurring = recurring.filter((r) =>
      viewType === 'expense' ? r.averageAmount < 0 : r.averageAmount > 0,
    );

    if (matchingRecurring.length === 0) {
      this._recurringRange.set(null);
      this.selectedMonth.set(null);
      this._cdr.markForCheck();
      return;
    }

    const startDate = matchingRecurring
      .map((r) => r.firstOccurrenceDate)
      .reduce((min, d) => (d < min ? d : min));
    const endDate = matchingRecurring
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
}
