import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-account-details',
  templateUrl: './account-details.component.html',
  styleUrl: './account-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class AccountDetailsComponent {}
