import { Routes } from '@angular/router';
import { HomeComponent } from '../home/home.component';
import { NewJournalComponent } from '../new-journal/new-journal.component';
import { defaultLocaleGuard, localeGuard } from './locale.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [defaultLocaleGuard],
    component: HomeComponent,
  },
  {
    path: ':locale',
    canActivate: [localeGuard],
    children: [
      { path: '', component: HomeComponent },
      { path: 'journal/new', component: NewJournalComponent },
    ],
  },
  { path: '**', redirectTo: 'en' },
];
