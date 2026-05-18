import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LOCALE_SERVICE, LocaleService } from '../../services/locale.service';
import { WORKSPACE_SERVICE, WorkspaceService } from '../../services/workspace.service';
import { WorkspaceModel } from '../../Models/workspace.model';

@Component({
  selector: 'app-workspace-list',
  templateUrl: './workspace-list.component.html',
  styleUrl: './workspace-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
})
export class WorkspaceListComponent {
  private readonly _workspaceService = inject<WorkspaceService>(WORKSPACE_SERVICE);
  private readonly _router = inject(Router);
  private readonly _locale = inject<LocaleService>(LOCALE_SERVICE);

  readonly workspaces = signal<WorkspaceModel[]>([]);

  constructor() {
    this._load();
  }

  private async _load(): Promise<void> {
    this.workspaces.set(await this._workspaceService.getWorkspaces());
  }

  openWorkspace(id: string): void {
    this._router.navigate([this._locale.currentLocale(), 'journal', id]);
  }
}
