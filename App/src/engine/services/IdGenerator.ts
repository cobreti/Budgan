import {injectable} from "inversify";
import {InversifyUtils} from "@inversify/inversify-utils.ts";

export abstract class IdGenerator {
    static readonly bindingTypeId: string = InversifyUtils.createBindingId('IdGenerator');

    abstract generateId(): string;
}

@injectable()
export class IdGeneratorImpl extends IdGenerator {
    generateId(): string {
        return crypto.randomUUID();
    }
}
