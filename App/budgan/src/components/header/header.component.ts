import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { TranslatePipe } from '@ngx-translate/core';
import { MainMenuService } from '@services/main-menu.service';
import { LOCALE_SERVICE } from '@services/locale.service';
import { THEME_SERVICE } from '@services/theme.service';
import { HeaderPageTitleComponent } from '@components/header/header-page-title/header-page-title.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatToolbar, HeaderPageTitleComponent, MatIconButton, MatIcon, MatMenu, MatMenuItem, MatMenuTrigger, TranslatePipe],
})
export class HeaderComponent {
  private readonly _mainMenuService = inject(MainMenuService);
  private readonly _localeService = inject(LOCALE_SERVICE);
  private readonly _router = inject(Router);
  private readonly _themeService = inject(THEME_SERVICE);
  protected readonly isDark = this._themeService.isDark;

  onMenuBtnClick(): void {
    this._mainMenuService.toggleMenu();
  }

  switchLocale(locale: string): void {
    this._router.navigate([locale]);
  }

  async onHome(): Promise<void> {
    await this._router.navigate([this._localeService.currentLocale()]);
  }

  toggleTheme(): void {
    this._themeService.toggle();
  }
}
