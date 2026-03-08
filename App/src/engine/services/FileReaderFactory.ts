import 'reflect-metadata';
import {InversifyIdentifierBase} from "@/inversify/inversify-identifier-base";
import { injectable } from 'inversify'

export abstract class ReaderFactory extends InversifyIdentifierBase {
    static readonly bindingId: string = 'FileReaderFactory';

    abstract createReader(): FileReader;
}

@injectable()
export class FileReaderFactoryImpl extends ReaderFactory {
    createReader(): FileReader {
        return new FileReader();
    }
}

