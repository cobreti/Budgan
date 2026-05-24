import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { LOCALE_SERVICE, LocaleService } from '@services/locale.service';
import { FILE_SERVICE, FileService } from '@services/file.service';
import { PageMenuComponent } from '@components/page-menu/page-menu.component';
import { PageMenuButtonComponent } from '@components/page-menu/page-menu-button/page-menu-button.component';

@Component({
  selector: 'app-import-file',
  templateUrl: './import-file.component.html',
  styleUrl: './import-file.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton, TranslatePipe, PageMenuComponent, PageMenuButtonComponent],
})
export class ImportFileComponent {
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _locale = inject<LocaleService>(LOCALE_SERVICE);
  private readonly _fileService = inject<FileService>(FILE_SERVICE);

  private readonly _accountId = this._route.snapshot.params['accountId'] as string;

  readonly selectedFileName = signal<string>('');

  private _selectedFile: File | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this._selectedFile = file;
    this.selectedFileName.set(file.name);
  }

  async onImport(): Promise<void> {
    if (!this._selectedFile) return;
    const content = await this._selectedFile.text();
    await this._fileService.create(this._accountId, this._selectedFile.name, content, new Date());
    await this._router.navigate([this._locale.currentLocale(), 'account', this._accountId]);
  }

  onCancel(): void {
    this._router.navigate([this._locale.currentLocale(), 'account', this._accountId]);
  }
}
