import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { ACCOUNT_SERVICE, AccountService } from '@services/account.service';
import { LOCALE_SERVICE, LocaleService } from '@services/locale.service';
import { AccountModel } from '@models/accountModel';
import { PageMenuComponent } from '@components/page-menu/page-menu.component';
import { PageMenuButtonComponent } from '@components/page-menu/page-menu-button/page-menu-button.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '@components/confirm-dialog/confirm-dialog.component';
import { AccountDetailsComponent } from '@views/accounts/account-details/account-details.component';
import { AccountTransactionsComponent } from '@views/accounts/account-transactions/account-transactions.component';

@Component({
  selector: 'app-account-home',
  templateUrl: './account-home.component.html',
  styleUrl: './account-home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    MatTabGroup,
    MatTab,
    PageMenuComponent,
    PageMenuButtonComponent,
    AccountDetailsComponent,
    AccountTransactionsComponent,
  ],
})
export class AccountHomeComponent implements OnInit {
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _locale = inject<LocaleService>(LOCALE_SERVICE);
  private readonly _accountService = inject<AccountService>(ACCOUNT_SERVICE);
  private readonly _dialog = inject(MatDialog);

  readonly account: WritableSignal<AccountModel | undefined> = signal(undefined);

  onSave(): void {
    const account = this.account();
    if (!account) return;
    this._router.navigate([this._locale.currentLocale(), 'account', account.id, 'save']);
  }

  onImportFile(): void {
    const account = this.account();
    if (!account) return;
    this._router.navigate([this._locale.currentLocale(), 'account', account.id, 'import-file']);
  }

  async onDelete(): Promise<void> {
    const account = this.account();
    if (!account) throw new Error('Account is undefined');

    const ref = this._dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
      ConfirmDialogComponent,
      {
        data: {
          title: 'account.confirmDeleteTitle',
          message: 'account.confirmDeleteMessage',
          confirmLabel: 'account.confirmDeleteAccept',
          cancelLabel: 'account.confirmDeleteCancel',
          danger: true,
        },
      },
    );

    const confirmed = await ref.afterClosed().toPromise();
    if (!confirmed) return;

    await this._accountService.delete(account.id);
    await this._router.navigate([this._locale.currentLocale()]);
  }

  async ngOnInit(): Promise<void> {
    const id = this._route.snapshot.params['accountId'] ?? undefined;
    const entry = await this._accountService.getById(id);
    if (!entry) {
      console.error('Failed to load account with ID:', id);
      return;
    }
    this.account.set(entry);
  }
}
