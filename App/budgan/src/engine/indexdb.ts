import Dexie from 'dexie';
import { Injectable } from '@angular/core';

export interface WorkspaceEntry {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class IndexDB extends Dexie {
  constructor() {
    super('budgan');
    this.version(1)
    .stores({
      workspaces: '&id'
    });
  }
}
