import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LOCALE_SERVICE, LocaleService } from '../../services/locale.service';
import { MainMenuButtonComponent } from '../main-menu/main-menu-button/main-menu-button.component';

@Component({
  selector: 'home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MainMenuButtonComponent, TranslatePipe],
})
export class HomeComponent {
  private readonly _router = inject(Router);
  private readonly _locale = inject<LocaleService>(LOCALE_SERVICE);

  onNewJournal(): void {
    this._router.navigate([this._locale.currentLocale(), 'journal', 'new']);
  }
}
