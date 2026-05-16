import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { TranslatePipe } from '@ngx-translate/core';
import { MainMenuService } from '../../services/main-menu.service';
import { LOCALE_SERVICE } from '../../services/locale.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatToolbar, MatIconButton, MatIcon, MatMenu, MatMenuItem, MatMenuTrigger, TranslatePipe],
})
export class HeaderComponent {
  private readonly _mainMenuService = inject(MainMenuService);
  private readonly _localeService = inject(LOCALE_SERVICE);
  private readonly _router = inject(Router);

  readonly currentLocale = this._localeService.currentLocale;

  onMenuBtnClick(): void {
    this._mainMenuService.toggleMenu();
  }

  switchLocale(locale: string): void {
    this._router.navigate([locale]);
  }
}
