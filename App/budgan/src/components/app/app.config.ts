import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { ID_GENERATOR_SERVICE, IdGeneratorServiceImpl } from '../../services/id-generator.service';
import { WORKSPACE_STORE_SERVICE, WorkspaceStoreServiceImpl } from '../../services/workspace-store.service';

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
    { provide: WORKSPACE_STORE_SERVICE, useClass: WorkspaceStoreServiceImpl },
  ]
};
