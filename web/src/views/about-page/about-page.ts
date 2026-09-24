import { LOCALE_SERVICE } from '@/services/locale.service';
import { Component, effect, inject, signal } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { PwaEnAboutComponent } from './pwa-en-about/pwa-en-about';
import { PwaFrAboutComponent } from './pwa-fr-about/pwa-fr-about';
import { isPWABuild, isServerBuild } from '@/utils/build-type';
import { ServerEnAboutComponent } from './server-en-about/server-en-about';
import { ServerFrAboutComponent } from './server-fr-about/server-fr-about';

@Component({
  selector: 'app-about-page',
  templateUrl: './about-page.html',
  styleUrl: './about-page.scss',
  imports: [
    MatIcon,
    MatIconButton,
    TranslatePipe,
    PwaEnAboutComponent,
    PwaFrAboutComponent,
    ServerEnAboutComponent,
    ServerFrAboutComponent,
  ],
})
export class AboutPageComponent {
  private readonly _localeService = inject(LOCALE_SERVICE);
  private readonly _router = inject(Router);

  readonly isPWABuild = isPWABuild();
  readonly isServerBuild = isServerBuild();
  readonly currentLocale = signal<string>(this._localeService.currentLocale());

  constructor() {
    effect(() => {
      const currentLocale = this._localeService.currentLocale();
      this.currentLocale.set(currentLocale);
    });
  }

  async onClose(): Promise<void> {
    await this._router.navigate([this._localeService.currentLocale()]);
  }
}
