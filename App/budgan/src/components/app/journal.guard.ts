import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LOCALE_SERVICE } from '../../services/locale.service';
import { WORKSPACE_STORE_SERVICE } from '../../services/workspace-store.service';

export const journalGuard: CanActivateFn = async (route) => {
  const id = route.paramMap.get('journalId') ?? '';
  const store = inject(WORKSPACE_STORE_SERVICE);
  const found = await store.loadWorkspaceById(id);
  if (found) return true;
  const locale = inject(LOCALE_SERVICE).currentLocale();
  return inject(Router).createUrlTree([locale]);
};
