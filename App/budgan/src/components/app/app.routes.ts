import { Routes } from '@angular/router';
import { JournalsComponent } from '../../views/journals/journals.component';
import { NewJournalComponent } from '../../views/journals/new-journal/new-journal.component';
import { JournalComponent } from '../../views/journals/journal/journal.component';
import { defaultLocaleGuard, localeGuard } from './locale.guard';
import { journalGuard } from './journal.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [defaultLocaleGuard],
    component: JournalsComponent,
  },
  {
    path: ':locale',
    canActivate: [localeGuard],
    children: [
      { path: '', redirectTo: 'journals', pathMatch: 'full' },
      { path: 'journals', component: JournalsComponent },
      { path: 'journal/new', component: NewJournalComponent },
      { path: 'journal/:journalId', component: JournalComponent, canActivate: [journalGuard] },
    ],
  },
  { path: '**', redirectTo: 'en' },
];
