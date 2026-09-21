import { LOCALE_SERVICE } from '@/services/locale.service';
import { Component, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-about-page',
  templateUrl: './about-page.html',
  styleUrl: './about-page.scss',
  imports: [MatIcon, MatIconButton, TranslatePipe],
})
export class AboutPageComponent {
  private readonly _localeService = inject(LOCALE_SERVICE);
  private readonly _router = inject(Router);

  async onClose(): Promise<void> {
    await this._router.navigate([this._localeService.currentLocale()]);
  }
}
