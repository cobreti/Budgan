/**
 * This file configures the Inversify Dependency Injection container.
 * It augments the standard Inversify 'Container' class to support class-based lookups.
 * Instead of using string or symbol identifiers manually, you can pass an abstract class 
 * (inheriting from InversifyIdentifierBase) directly to 'container.get()'.
 * The implementation automatically extracts the static 'bindingId' from the class at runtime.
 */

import "reflect-metadata";
import {Container} from "inversify";
import {engineModule} from "@engine/setup-inversify.module";


export const container = new Container();

container.loadSync(engineModule);
