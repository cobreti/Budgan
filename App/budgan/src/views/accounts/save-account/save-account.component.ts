import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { LOCALE_SERVICE, LocaleService } from '@services/locale.service';
import { PageMenuComponent } from '@components/page-menu/page-menu.component';
import { PageMenuButtonComponent } from '@components/page-menu/page-menu-button/page-menu-button.component';

@Component({
  selector: 'app-save-account',
  templateUrl: './save-account.component.html',
  styleUrl: './save-account.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton, TranslatePipe, PageMenuComponent, PageMenuButtonComponent],
})
export class SaveAccountComponent {
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _locale = inject<LocaleService>(LOCALE_SERVICE);

  private readonly _accountId = this._route.snapshot.params['accountId'] as string;

  readonly selectedFileName = signal<string>('');

  private _fileHandle: FileSystemFileHandle | null = null;

  async onSelectFile(): Promise<void> {
    const showSaveFilePicker = (window as unknown as { showSaveFilePicker: (opts: unknown) => Promise<FileSystemFileHandle> }).showSaveFilePicker;
    try {
      const handle = await showSaveFilePicker({
        suggestedName: 'account.bdg',
        types: [{ description: 'Budgan files', accept: { 'application/octet-stream': ['.bdg'] } }],
      });
      this._fileHandle = handle;
      this.selectedFileName.set(handle.name);
    } catch {
      // User cancelled the dialog
    }
  }

  onSave(): void {
    // Save operation — to be implemented
  }

  onCancel(): void {
    this._router.navigate([this._locale.currentLocale(), 'account', this._accountId]);
  }
}
