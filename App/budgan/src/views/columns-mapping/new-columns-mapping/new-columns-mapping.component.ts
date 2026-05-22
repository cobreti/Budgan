import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LOCALE_SERVICE, LocaleService } from '../../../services/locale.service';
import { COLUMNS_MAPPING_SERVICE, ColumnsMappingService } from '../../../services/columns-mapping.service';
import { CSV_CONTENT_EXTRACTOR_SERVICE, CsvContentExtractorService } from '../../../services/csv-content-extractor.service';

@Component({
  selector: 'app-new-columns-mapping',
  templateUrl: './new-columns-mapping.component.html',
  styleUrl: './new-columns-mapping.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatFormField, MatLabel, MatError, MatInput, MatSelect, MatOption, MatButton, TranslatePipe],
})
export class NewColumnsMappingComponent {
  private readonly _columnsMappingService = inject<ColumnsMappingService>(COLUMNS_MAPPING_SERVICE);
  private readonly _csvExtractor = inject<CsvContentExtractorService>(CSV_CONTENT_EXTRACTOR_SERVICE);
  private readonly _router = inject(Router);
  private readonly _locale = inject<LocaleService>(LOCALE_SERVICE);

  readonly csvHeaders = signal<string[]>([]);
  readonly selectedFileName = signal<string>('');
  readonly csvParseError = signal<string>('');

  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    cardNumberColumn: new FormControl<number | null>(null, [Validators.required]),
    dateInscriptionColumn: new FormControl<number | null>(null, [Validators.required]),
    amountColumn: new FormControl<number | null>(null, [Validators.required]),
    descriptionColumn: new FormControl<number | null>(null, [Validators.required]),
  });

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const text = await file.text();
    const result = this._csvExtractor.extract(text);

    if (!result.success) {
      this.csvParseError.set(result.error);
      this.csvHeaders.set([]);
      this.selectedFileName.set('');
      return;
    }

    this.csvHeaders.set(result.value.header);
    this.selectedFileName.set(file.name);
    this.csvParseError.set('');
    this.form.controls.cardNumberColumn.reset();
    this.form.controls.dateInscriptionColumn.reset();
    this.form.controls.amountColumn.reset();
    this.form.controls.descriptionColumn.reset();
  }

  async onCreate(): Promise<void> {
    if (this.form.invalid) return;
    const { name, cardNumberColumn, dateInscriptionColumn, amountColumn, descriptionColumn } = this.form.getRawValue();
    const result = await this._columnsMappingService.save({
      name,
      cardNumberColumn: cardNumberColumn!,
      dateInscriptionColumn: dateInscriptionColumn!,
      amountColumn: amountColumn!,
      descriptionColumn: descriptionColumn!,
    });
    if (!result.success) {
      this.form.controls.name.setErrors({ nameExists: true });
      return;
    }
    await this._router.navigate([this._locale.currentLocale(), 'columns-mapping', result.value.id]);
  }

  onCancel(): void {
    this._router.navigate([this._locale.currentLocale()]);
  }
}
