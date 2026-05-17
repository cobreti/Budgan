import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-page-menu-button',
  templateUrl: './page-menu-button.component.html',
  styleUrl: './page-menu-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon],
})
export class PageMenuButtonComponent {
  icon = input.required<string>();
  label = input.required<string>();
  clicked = output<void>();
}
