import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HeaderComponent } from '../header/header.component';
import { MainComponent } from '../main/main.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeaderComponent,
    MainComponent
  ],
  encapsulation: ViewEncapsulation.None
})
export class App {
  constructor() {
    inject(TranslateService).use('en');
  }
}
