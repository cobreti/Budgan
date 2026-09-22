import { Component } from '@angular/core';
import { EnAboutComponent } from '../en-about/en-about';

@Component({
  selector: 'app-pwa-en-about',
  styleUrl: './pwa-en-about.scss',
  templateUrl: './pwa-en-about.html',
  imports: [EnAboutComponent],
})
export class PwaEnAboutComponent {}
