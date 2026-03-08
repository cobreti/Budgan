export namespace InversifyUtils {
    export function createBindingId(name: string): string {
        return Symbol.for(name).toString();
    }
}

