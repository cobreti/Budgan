import { Component, Input, OnInit } from '@angular/core';
import { PageService } from '@services/page.service';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrl: './page.component.scss',
})
export class PageComponent implements OnInit {
  @Input() title : string = '';

  constructor(private pageService: PageService) { }

  ngOnInit(): void {
    this.pageService.setTitle(this.title);
  }
}
