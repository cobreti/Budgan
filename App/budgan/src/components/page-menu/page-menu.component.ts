import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-page-menu',
  templateUrl: './page-menu.component.html',
  styleUrl: './page-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class PageMenuComponent {}
