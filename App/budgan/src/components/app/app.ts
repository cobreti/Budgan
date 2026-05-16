import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { MainComponent } from '../main/main.component';
import { MatSidenav, MatSidenavContainer } from '@angular/material/sidenav';
import { MainMenuService } from '../../services/main-menu.service';
import { MainMenuComponent } from '../main-menu/main-menu.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeaderComponent,
    MainComponent,
    MatSidenavContainer,
    MatSidenav,
    MainMenuComponent
  ],
  encapsulation: ViewEncapsulation.None
})
export class App {
  constructor(public mainMenuService: MainMenuService) {}
}
