import {injectable} from "inversify";
import {InversifyIdentifierBase} from "@/inversify/inversify-identifier-base";

export abstract class IdGenerator extends InversifyIdentifierBase {
    static readonly bindingId: string = 'IdGenerator';

    abstract generateId(): string;
}

@injectable()
export class IdGeneratorImpl extends IdGenerator {
    generateId(): string {
        return crypto.randomUUID();
    }
}
