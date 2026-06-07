import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AccountSnapshotComponent } from '@components/account-snapshot/account-snapshot.component';

@Component({
  selector: 'app-account-details',
  templateUrl: './account-details.component.html',
  styleUrl: './account-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AccountSnapshotComponent],
})
export class AccountDetailsComponent {
  readonly accountId = input.required<string>();
}
