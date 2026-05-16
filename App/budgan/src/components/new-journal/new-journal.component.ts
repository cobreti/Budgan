import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import { LOCALE_SERVICE, LocaleService } from '../../services/locale.service';
import { WORKSPACE_STORE_SERVICE, WorkspaceStoreService } from '../../services/workspace-store.service';

@Component({
  selector: 'app-new-journal',
  templateUrl: './new-journal.component.html',
  styleUrl: './new-journal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatButton, TranslatePipe],
})
export class NewJournalComponent {
  private readonly _store = inject<WorkspaceStoreService>(WORKSPACE_STORE_SERVICE);
  private readonly _router = inject(Router);
  private readonly _locale = inject<LocaleService>(LOCALE_SERVICE);

  readonly nameControl = new FormControl('', { nonNullable: true, validators: [Validators.required] });

  onCreate(): void {
    if (this.nameControl.invalid) return;
    this._store.createWorkspace(this.nameControl.value);
    this._router.navigate([this._locale.currentLocale()]);
  }

  onCancel(): void {
    this._router.navigate([this._locale.currentLocale()]);
  }
}
