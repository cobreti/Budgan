import { get, set } from 'idb-keyval'
import type { StorageLike } from 'pinia-plugin-persistedstate'

const cache = new Map<string, string>()

export async function preloadIdbCache(keys: string[]): Promise<void> {
  await Promise.all(
    keys.map(async (key) => {
      const value = await get<string>(key)
      if (value != null) cache.set(key, value)
    }),
  )
}

export const idbStorage: StorageLike = {
  getItem: (key: string) => {
    console.log('[idb-storage] getItem', key, 'hit:', cache.has(key))
    return cache.get(key) ?? null
  },
  setItem: (key: string, value: string) => {
    console.log('[idb-storage] setItem', key, value.length, 'bytes')
    cache.set(key, value)
    set(key, value).catch((err) => console.error('[idb-storage] write failed:', key, err))
  },
}
