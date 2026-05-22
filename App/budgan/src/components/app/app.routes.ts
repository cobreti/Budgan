import { Routes } from '@angular/router';
import { JournalsComponent } from '../../views/journals/journals.component';
import { NewJournalComponent } from '../../views/journals/new-journal/new-journal.component';
import { defaultLocaleGuard, localeGuard } from './locale.guard';
import { JournalDetailsComponent } from '../../views/journals/journal-details/journal-details.component';
import { HomeComponent } from '../../views/Home/home.component';
import { ColumnsMappingDetailsComponent } from '../../views/columns-mapping/columns-mapping-details.component';

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
      { path: '', component: HomeComponent },
      { path: 'journals', component: JournalsComponent },
      { path: 'journal/new', component: NewJournalComponent },
      { path: 'journal/:journalId', component: JournalDetailsComponent },
      { path: 'columns-mapping/:columnsMappingId', component: ColumnsMappingDetailsComponent },
    ],
  },
  { path: '**', redirectTo: 'en' },
];
