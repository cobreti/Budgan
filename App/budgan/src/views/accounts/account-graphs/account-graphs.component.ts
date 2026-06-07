import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BalanceTrendGraphComponent } from '@views/accounts/account-graphs/balance-trend-graph/balance-trend-graph.component';

@Component({
  selector: 'app-account-graphs',
  templateUrl: './account-graphs.component.html',
  styleUrl: './account-graphs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BalanceTrendGraphComponent],
})
export class AccountGraphsComponent {
  readonly accountId = input.required<string>();
}
