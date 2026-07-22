import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BalanceTrendGraphComponent } from '@views/accounts/account-graphs/balance-trend-graph/balance-trend-graph.component';
import { RecurringPieChartComponent } from '@views/accounts/account-graphs/recurring-pie-chart/recurring-pie-chart.component';

@Component({
  selector: 'app-account-graphs',
  templateUrl: './account-graphs.component.html',
  styleUrl: './account-graphs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BalanceTrendGraphComponent, RecurringPieChartComponent],
})
export class AccountGraphsComponent {
  readonly accountId = input.required<string>();
}
