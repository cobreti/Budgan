import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HeaderComponent } from '../header/header.component';
import { MainComponent } from '../main/main.component';
import { MatSidenav, MatSidenavContainer } from '@angular/material/sidenav';
import { MainMenuService } from '../../services/main-menu.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeaderComponent,
    MainComponent,
    MatSidenavContainer,
    MatSidenav
  ],
  encapsulation: ViewEncapsulation.None
})
export class App {
  constructor(public mainMenuService: MainMenuService) {
    inject(TranslateService).use('en');
  }
}
