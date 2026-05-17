import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { WORKSPACE_STORE_SERVICE } from '../../services/workspace-store.service';

@Component({
  selector: 'app-journal',
  templateUrl: './journal.component.html',
  styleUrl: './journal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class JournalComponent {
  private readonly _store = inject(WORKSPACE_STORE_SERVICE);
  readonly workspace = this._store.workspace;
}
