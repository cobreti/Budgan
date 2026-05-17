import { IndexDB } from './indexdb';

export class Workspace {
  private _id: string;
  private _name: string;
  private _indexDb: IndexDB;

  constructor(IndexDb: IndexDB, id: string, name: string) {
    this._id = id;
    this._name = name;
    this._indexDb = IndexDb;
  }

  async create(): Promise<void> {
    await this._indexDb.workspaceTable.add({ id: this._id, name: this._name });
  }

  get indexDb(): IndexDB { return this._indexDb; }
  get id(): string { return this._id; }
  get name(): string { return this._name; }
}
