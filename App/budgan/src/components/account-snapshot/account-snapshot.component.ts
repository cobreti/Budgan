import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import {
  ACCOUNT_TRANSACTION_SERVICE,
  AccountTransactionService,
} from '@services/account-transaction.service';

@Component({
  selector: 'app-account-snapshot',
  templateUrl: './account-snapshot.component.html',
  styleUrl: './account-snapshot.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    TranslatePipe,
  ],
})
export class AccountSnapshotComponent {
  private readonly _transactionService = inject<AccountTransactionService>(
    ACCOUNT_TRANSACTION_SERVICE,
  );

  readonly accountId = input.required<string>();

  readonly form = new FormGroup({
    dateAsString: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    amount: new FormControl<number | null>(null, [Validators.required]),
  });

  readonly hasSnapshot = signal(false);

  constructor() {
    effect(() => {
      const id = this.accountId();
      this._loadSnapshot(id);
    });
  }

  private async _loadSnapshot(accountId: string): Promise<void> {
    const snapshot = await this._transactionService.getSnapshot(accountId);
    if (snapshot) {
      this.form.patchValue({
        dateAsString: snapshot.dateInscriptionAsString,
        amount: snapshot.amount,
      });
      this.hasSnapshot.set(true);
    } else {
      this.form.reset();
      this.hasSnapshot.set(false);
    }
  }

  async onSave(): Promise<void> {
    if (this.form.invalid) return;
    const { dateAsString, amount } = this.form.getRawValue();
    if (amount === null) return;
    const result = await this._transactionService.setSnapshot(
      this.accountId(),
      dateAsString,
      amount,
    );
    if (result.success) {
      this.hasSnapshot.set(true);
    }
  }
}
