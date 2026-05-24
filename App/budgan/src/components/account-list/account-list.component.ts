import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ACCOUNT_SERVICE, AccountService } from '@services/account.service';
import { accountModel } from '@models/accountModel';

@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
  styleUrl: './account-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
})
export class AccountListComponent {
  private readonly _accountService = inject<AccountService>(ACCOUNT_SERVICE);

  readonly accounts = signal<accountModel[]>([]);

  constructor() {
    this._load();
  }

  private async _load(): Promise<void> {
    this.accounts.set(await this._accountService.getList());
  }
}
