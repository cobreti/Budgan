import { Component } from '@angular/core';
import { FrAboutComponent } from '../fr-about/fr-about';

@Component({
  selector: 'app-server-fr-about',
  templateUrl: './server-fr-about.html',
  styleUrl: './server-fr-about.scss',
  imports: [FrAboutComponent],
})
export class ServerFrAboutComponent {}
