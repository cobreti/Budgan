import { ChangeDetectionStrategy, Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { ACCOUNT_SERVICE, AccountService } from '@services/account.service';
import { ActivatedRoute, Router } from '@angular/router';
import { accountModel } from '@models/accountModel';
import { TranslatePipe } from '@ngx-translate/core';
import { PageMenuComponent } from '@components/page-menu/page-menu.component';
import { PageMenuButtonComponent } from '@components/page-menu/page-menu-button/page-menu-button.component';
import { LOCALE_SERVICE, LocaleService } from '@services/locale.service';

@Component({
  selector: 'app-account-details',
  templateUrl: './account-details.component.html',
  styleUrl: './account-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, PageMenuComponent, PageMenuButtonComponent],
})
export class AccountDetailsComponent implements OnInit {
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _locale = inject<LocaleService>(LOCALE_SERVICE);
  private readonly _accountService = inject<AccountService>(ACCOUNT_SERVICE);

  readonly account: WritableSignal<accountModel | undefined> = signal(undefined);

  async onDelete(): Promise<void> {
    const account = this.account();
    if (!account) throw new Error('Account is undefined');
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
