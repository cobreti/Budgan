import { Component, inject } from '@angular/core';
import { PageMenuComponent } from '@components/page-menu/page-menu.component';
import { PageMenuButtonComponent } from '@components/page-menu/page-menu-button/page-menu-button.component';
import { TranslatePipe } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { LOCALE_SERVICE, LocaleService } from '@services/locale.service';
import { PageComponent } from '@components/page/page.component';
import { MatCard } from '@angular/material/card';
import { ColumnsMappingListComponent } from '@components/columns-mapping-list/columns-mapping-list.component';
import { AccountListComponent } from '@components/account-list/account-list.component';

@Component({
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss'],
  selector: 'app-home',
  imports: [
    PageMenuComponent,
    PageMenuButtonComponent,
    TranslatePipe,
    PageComponent,
    ColumnsMappingListComponent,
    AccountListComponent,
    MatCard,
  ],
})
export class HomeComponent {
  private readonly _router = inject(Router);
  private readonly _locale = inject<LocaleService>(LOCALE_SERVICE);

  async onNewColumnsMapping(): Promise<void> {
    await this._router.navigate([this._locale.currentLocale(), 'columns-mapping', 'new']);
  }

  async onNewAccount(): Promise<void> {
    await this._router.navigate([this._locale.currentLocale(), 'account', 'new']);
  }
}
