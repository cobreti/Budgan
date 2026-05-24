import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
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

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
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
  ]
};
