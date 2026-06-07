import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { ID_GENERATOR_SERVICE, IdGeneratorServiceImpl } from '@services/id-generator.service';
import { LOCALE_SERVICE, LocaleServiceImpl } from '@services/locale.service';
import { JOURNAL_SERVICE, JournalServiceImpl } from '@services/journal.service';
import { COLUMNS_MAPPING_SERVICE, ColumnsMappingServiceImpl } from '@services/columns-mapping.service';
import { CSV_CONTENT_EXTRACTOR_SERVICE, CsvContentExtractorServiceImpl } from '@services/csv-content-extractor.service';
import { THEME_SERVICE, ThemeServiceImpl } from '@services/theme.service';
import { ACCOUNT_SERVICE, AccountServiceImpl } from '@services/account.service';
import { FILE_SERVICE, FileServiceImpl } from '@services/file.service';
import { ACCOUNT_TRANSACTION_SERVICE, AccountTransactionServiceImpl } from '@services/account-transaction.service';
import { BUDGAN_EXPORT_SERVICE, BudganExportServiceImpl } from '@services/budgan-export.service';
import { provideServiceWorker } from '@angular/service-worker';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    provideNativeDateAdapter(),
    provideTranslateService({
      defaultLanguage: 'en',
    }),
    provideTranslateHttpLoader({
      prefix: '/assets/i18n/',
      suffix: '.json',
    }),
    { provide: ID_GENERATOR_SERVICE, useClass: IdGeneratorServiceImpl },
    { provide: LOCALE_SERVICE, useClass: LocaleServiceImpl },
    { provide: JOURNAL_SERVICE, useClass: JournalServiceImpl },
    { provide: COLUMNS_MAPPING_SERVICE, useClass: ColumnsMappingServiceImpl },
    { provide: CSV_CONTENT_EXTRACTOR_SERVICE, useClass: CsvContentExtractorServiceImpl },
    { provide: THEME_SERVICE, useClass: ThemeServiceImpl },
    { provide: ACCOUNT_SERVICE, useClass: AccountServiceImpl },
    { provide: FILE_SERVICE, useClass: FileServiceImpl },
    { provide: ACCOUNT_TRANSACTION_SERVICE, useClass: AccountTransactionServiceImpl },
    { provide: BUDGAN_EXPORT_SERVICE, useClass: BudganExportServiceImpl },
    provideCharts(withDefaultRegisterables()),
    provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }),
  ]
};
