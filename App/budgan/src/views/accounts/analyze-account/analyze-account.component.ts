import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { LOCALE_SERVICE, LocaleService } from '@services/locale.service';
import { ACCOUNT_ANALYSIS_SERVICE, AccountAnalysisService } from '@services/account-analysis.service';
import { AccountRecurringTransactionModel } from '@models/accountRecurringTransactionModel';
import { PageMenuComponent } from '@components/page-menu/page-menu.component';
import { PageMenuButtonComponent } from '@components/page-menu/page-menu-button/page-menu-button.component';
import { PageComponent } from '@components/page/page.component';
import { PageBodyComponent } from '@components/page-body/page-body.component';

@Component({
  selector: 'app-analyze-account',
  templateUrl: './analyze-account.component.html',
  styleUrl: './analyze-account.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    DecimalPipe,
    PageComponent,
    PageBodyComponent,
    PageMenuComponent,
    PageMenuButtonComponent,
    MatButton,
    MatIcon,
    MatProgressSpinner,
  ],
})
export class AnalyzeAccountComponent {
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _locale = inject<LocaleService>(LOCALE_SERVICE);
  private readonly _analysisService = inject<AccountAnalysisService>(ACCOUNT_ANALYSIS_SERVICE);

  readonly accountId = this._route.snapshot.params['accountId'] as string;

  readonly isAnalyzing = signal(false);
  readonly errorKey = signal<string | null>(null);
  readonly recurringTransactions = signal<AccountRecurringTransactionModel[]>([]);

  constructor() {
    this._loadExisting();
  }

  private async _loadExisting(): Promise<void> {
    const results = await this._analysisService.getRecurringTransactions(this.accountId);
    this.recurringTransactions.set(results);
  }

  async onAnalyze(): Promise<void> {
    this.isAnalyzing.set(true);
    this.errorKey.set(null);
    const result = await this._analysisService.analyzeAccount(this.accountId);
    if (result.success) {
      const results = await this._analysisService.getRecurringTransactions(this.accountId);
      this.recurringTransactions.set(results);
    } else {
      this.errorKey.set('analyzeAccount.error');
    }
    this.isAnalyzing.set(false);
  }

  onBack(): void {
    this._router.navigate([this._locale.currentLocale(), 'account', this.accountId]);
  }
}
