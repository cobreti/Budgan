import { environment } from '@/environments/environment';

export function ServerOnly<T extends new (...args: unknown[]) => object>(target: T): T {
  for (const key of Object.getOwnPropertyNames(target.prototype)) {
    if (key === 'constructor') continue;
    const descriptor = Object.getOwnPropertyDescriptor(target.prototype, key);
    if (!descriptor || typeof descriptor.value !== 'function') continue;
    const original = descriptor.value as (...args: unknown[]) => unknown;
    descriptor.value = function (...args: unknown[]) {
      if (environment.buildType !== 'server') {
        throw new Error(`${target.name}.${key}() requires server mode (current: ${environment.buildType})`);
      }
      return original.apply(this, args);
    };
    Object.defineProperty(target.prototype, key, descriptor);
  }
  return target;
}
