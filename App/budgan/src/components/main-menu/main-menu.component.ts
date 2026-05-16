import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { MainMenuButtonComponent } from './main-menu-button/main-menu-button.component';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss'],
  imports: [MainMenuButtonComponent, TranslatePipe],
})
export class MainMenuComponent { }
