import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { JOURNAL_SERVICE, JournalService } from '../../../services/journal.service';
import { ActivatedRoute } from '@angular/router';
import { JournalModel } from '../../../Models/journalModel';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-journal',
  templateUrl: './journal.component.html',
  styleUrl: './journal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
})
export class JournalComponent implements OnInit {
  private readonly _route = inject(ActivatedRoute);
  private readonly _journalService = inject<JournalService>(JOURNAL_SERVICE);

  readonly journal: WritableSignal<JournalModel | undefined> = signal(undefined);

  async ngOnInit(): Promise<void> {
    const id = this._route.snapshot.params['journalId'] ?? undefined;
    const entry = await this._journalService.getById(id);
    if (!entry) {
      console.error('Failed to load journal with ID:', id);
      return;
    }
    this.journal.set(entry);
  }
}
