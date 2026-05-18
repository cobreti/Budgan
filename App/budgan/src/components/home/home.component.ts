import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageMenuComponent } from '../page-menu/page-menu.component';
import { MatCard } from '@angular/material/card';
import { Router } from '@angular/router';
import { LOCALE_SERVICE, LocaleService } from '../../services/locale.service';
import { PageMenuButtonComponent } from '../page-menu/page-menu-button/page-menu-button.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageMenuComponent, PageMenuButtonComponent, TranslatePipe, MatCard],
})
export class HomeComponent {
  private readonly _router = inject(Router);
  private readonly _locale = inject<LocaleService>(LOCALE_SERVICE);

  onNewJournal(): void {
    this._router.navigate([this._locale.currentLocale(), 'journal', 'new']);
  }
}
