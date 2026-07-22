import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { TranslatePipe } from '@ngx-translate/core';
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
    TranslatePipe,
  ],
})
export class AccountGraphsComponent {
  readonly accountId = input.required<string>();
}
