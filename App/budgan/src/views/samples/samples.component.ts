import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LOCALE_SERVICE, LocaleService } from '@services/locale.service';
import { PageComponent } from '@components/page/page.component';
import { PageMenuComponent } from '@components/page-menu/page-menu.component';
import { PageMenuButtonComponent } from '@components/page-menu/page-menu-button/page-menu-button.component';

@Component({
  selector: 'app-samples',
  templateUrl: './samples.component.html',
  styleUrl: './samples.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, PageComponent, PageMenuComponent, PageMenuButtonComponent],
})
export class SamplesComponent {
  private readonly _router = inject(Router);
  private readonly _locale = inject<LocaleService>(LOCALE_SERVICE);

  async onBack(): Promise<void> {
    await this._router.navigate([this._locale.currentLocale()]);
  }
}
