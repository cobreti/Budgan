import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { ACCOUNT_TRANSACTION_SERVICE, AccountTransactionService } from '@services/account-transaction.service';
import { AccountTransactionModel } from '@models/accountTransactionModel';

@Component({
  selector: 'app-account-transactions-table',
  templateUrl: './account-transactions-table.component.html',
  styleUrl: './account-transactions-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatTableModule, MatIconButton, MatIcon, TranslatePipe],
})
export class AccountTransactionsTableComponent {
  private readonly _transactionService = inject<AccountTransactionService>(ACCOUNT_TRANSACTION_SERVICE);

  readonly accountId = input.required<string>();

  private readonly _currentPage = signal(0);
  readonly transactions = signal<AccountTransactionModel[]>([]);
  readonly totalPages = signal(0);
  readonly displayPage = computed(() => this._currentPage() + 1);
  readonly isFirstPage = computed(() => this._currentPage() === 0);
  readonly isLastPage = computed(() => this._currentPage() >= this.totalPages() - 1);

  readonly pageSize = 25;
  readonly displayedColumns = ['cardNumber', 'dateInscription', 'description', 'amount'];

  constructor() {
    effect(() => {
      const accountId = this.accountId();
      const page = this._currentPage();
      this._loadPage(accountId, page);
    });
  }

  private async _loadPage(accountId: string, page: number): Promise<void> {
    const result = await this._transactionService.getPageByAccount(accountId, page, this.pageSize);
    this.transactions.set(result.transactions);
    this.totalPages.set(result.totalPages);
  }

  onPreviousPage(): void {
    this._currentPage.update(p => p - 1);
  }

  onNextPage(): void {
    this._currentPage.update(p => p + 1);
  }

  onGoToPage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const page = parseInt(input.value, 10);
    if (isNaN(page)) return;
    const clamped = Math.max(1, Math.min(page, this.totalPages())) - 1;
    this._currentPage.set(clamped);
  }
}
