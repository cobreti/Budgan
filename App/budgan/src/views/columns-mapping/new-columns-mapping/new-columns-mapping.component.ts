import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import { LOCALE_SERVICE, LocaleService } from '../../../services/locale.service';
import { COLUMNS_MAPPING_SERVICE, ColumnsMappingService } from '../../../services/columns-mapping.service';

@Component({
  selector: 'app-new-columns-mapping',
  templateUrl: './new-columns-mapping.component.html',
  styleUrl: './new-columns-mapping.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatFormField, MatLabel, MatError, MatInput, MatButton, TranslatePipe],
})
export class NewColumnsMappingComponent {
  private readonly _columnsMappingService = inject<ColumnsMappingService>(COLUMNS_MAPPING_SERVICE);
  private readonly _router = inject(Router);
  private readonly _locale = inject<LocaleService>(LOCALE_SERVICE);

  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    cardNumberColumn: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    dateInscriptionColumn: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    amountColumn: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    descriptionColumn: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
  });

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
