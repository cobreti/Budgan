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
import {
    InversifyIdentifierBase,
    type InversifyIdentifierBaseConstructor
} from "@/inversify/inversify-identifier-base";




// Augment the Inversify 'Container' interface to include our class-based lookup overload.
// This provides compile-time type safety when passing abstract class constructors.

declare module "inversify" {
    interface Container {
        get<T extends InversifyIdentifierBase>(serviceIdentifier: string | symbol | InversifyIdentifierBaseConstructor<T>): T;
    }
}

const originalGet = Container.prototype.get;

Container.prototype.get = function <T extends InversifyIdentifierBase>(
    serviceIdentifier: string | symbol | InversifyIdentifierBaseConstructor<T>
): T {
    const identifier = (typeof serviceIdentifier === "function" && "bindingId" in serviceIdentifier)
        ? (serviceIdentifier as InversifyIdentifierBaseConstructor<T>).bindingId
        : serviceIdentifier as string | symbol;

    const v = originalGet.call(this, identifier);
    return v as T;
};



// Create and export the singleton container instance.
// The container is pre-loaded with the engine module's bindings.

export const container = new Container();

container.loadSync(engineModule);
