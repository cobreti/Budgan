import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MainMenuService } from '../../services/main-menu.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatToolbar, TranslatePipe, MatIcon, MatIconButton],
})
export class HeaderComponent {

  constructor(private mainMenuService: MainMenuService) {
  }

  onMenuBtnClick() {
    this.mainMenuService.toggleMenu();
  }
}
