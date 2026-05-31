import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { LOCALE_SERVICE, LocaleService } from '@services/locale.service';
import { FILE_SERVICE, FileService } from '@services/file.service';
import { ACCOUNT_SERVICE, AccountService } from '@services/account.service';
import { COLUMNS_MAPPING_SERVICE, ColumnsMappingService } from '@services/columns-mapping.service';
import { CSV_CONTENT_EXTRACTOR_SERVICE, CsvContentExtractorService } from '@services/csv-content-extractor.service';
import { ACCOUNT_TRANSACTION_SERVICE, AccountTransactionService } from '@services/account-transaction.service';
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
  private readonly _accountService = inject<AccountService>(ACCOUNT_SERVICE);
  private readonly _columnsMappingService = inject<ColumnsMappingService>(COLUMNS_MAPPING_SERVICE);
  private readonly _csvExtractor = inject<CsvContentExtractorService>(CSV_CONTENT_EXTRACTOR_SERVICE);
  private readonly _transactionService = inject<AccountTransactionService>(ACCOUNT_TRANSACTION_SERVICE);

  private readonly _accountId = this._route.snapshot.params['accountId'] as string;

  readonly selectedFileName = signal<string>('');
  readonly importError = signal<string>('');

  private _selectedFile: File | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this._selectedFile = file;
    this.selectedFileName.set(file.name);
    this.importError.set('');
  }

  async onImport(): Promise<void> {
    if (!this._selectedFile) return;

    const content = await this._selectedFile.text();

    const extractionResult = this._csvExtractor.extract(content);
    if (!extractionResult.success) {
      this.importError.set('importFile.csvParseError');
      return;
    }

    const { header, rows } = extractionResult.value;

    const account = await this._accountService.getById(this._accountId);
    const mapping = await this._columnsMappingService.getById(account.columnsMappingId);

    const fileResult = await this._fileService.create(this._accountId, this._selectedFile.name, content, new Date());
    if (!fileResult.success) return;
    const fileId = fileResult.value;

    for (const row of rows) {
      const cardNumber = row[header[mapping.cardNumberColumnIndex]] ?? '';
      const dateInscriptionAsString = row[header[mapping.dateInscriptionColumnIndex]] ?? '';
      const amountStr = (row[header[mapping.amountColumnIndex]] ?? '').replace(',', '.');
      const amount = parseFloat(amountStr);
      if (isNaN(amount)) continue;
      const description = row[header[mapping.descriptionColumnIndex]] ?? '';
      await this._transactionService.create(fileId, this._accountId, cardNumber, dateInscriptionAsString, amount, description);
    }

    await this._transactionService.recalculateBalances(this._accountId);

    await this._router.navigate([this._locale.currentLocale(), 'account', this._accountId]);
  }

  onCancel(): void {
    this._router.navigate([this._locale.currentLocale(), 'account', this._accountId]);
  }
}
