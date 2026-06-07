import { ref, computed } from 'vue'
import type { ComputedRef, Ref } from 'vue'

export type ExampleCsvFile = {
  group: string
  label: string
  path: string
}

const _files = ref<ExampleCsvFile[]>([])
const _isLoading = ref(false)
const _error = ref<string | null>(null)
let _loaded = false

export function useExampleCsvFiles(): {
  files: ComputedRef<ExampleCsvFile[]>
  isLoading: Ref<boolean>
  error: Ref<string | null>
  load: () => Promise<void>
} {
  async function load(): Promise<void> {
    if (_loaded || _isLoading.value) return
    _isLoading.value = true
    _error.value = null
    try {
      const response = await fetch('/examples/manifest.json')
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      _files.value = await response.json()
      _loaded = true
    } catch {
      _error.value = 'Could not load examples'
    } finally {
      _isLoading.value = false
    }
  }

  return {
    files: computed(() => _files.value),
    isLoading: _isLoading,
    error: _error,
    load,
  }
}
