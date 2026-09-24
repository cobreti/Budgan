import { Component } from '@angular/core';
import { EnAboutComponent } from '../en-about/en-about';

@Component({
  selector: 'app-server-en-about',
  templateUrl: './server-en-about.html',
  styleUrl: './server-en-about.scss',
  imports: [EnAboutComponent],
})
export class ServerEnAboutComponent {}
