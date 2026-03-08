import {ContainerModule, type ContainerModuleLoadOptions} from "inversify";
import {
    FileReaderFactoryImpl,
    ReaderFactory
} from "@/engine/services/FileReaderFactory";
import {IdGenerator, IdGeneratorImpl} from "@/engine/services/IdGenerator";



export const engineModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
    options.bind<ReaderFactory>(ReaderFactory.bindingId).to(FileReaderFactoryImpl);
    options.bind<IdGenerator>(IdGenerator.bindingId).to(IdGeneratorImpl);
})
