export abstract class BdgAccount {}

export class BdgAccountImpl extends BdgAccount {
  private _id: string

  constructor(id: string) {
    super()
    this._id = id
  }
}
