import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LOCALE_SERVICE, LocaleService } from '../../services/locale.service';
import { MainMenuService } from '../../services/main-menu.service';
import { MainMenuButtonComponent } from './main-menu-button/main-menu-button.component';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MainMenuButtonComponent, TranslatePipe],
})
export class MainMenuComponent {
  private readonly _mainMenuService = inject(MainMenuService);
  private readonly _router = inject(Router);
  private readonly _locale = inject<LocaleService>(LOCALE_SERVICE);

  onNewJournal(): void {
    this._mainMenuService.close();
    this._router.navigate([this._locale.currentLocale(), 'journal', 'new']);
  }
}
