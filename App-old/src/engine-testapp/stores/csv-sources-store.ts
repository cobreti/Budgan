import { defineStore } from 'pinia'
import { ref } from 'vue'

type CsvSource = { filename: string; content: string }

export const useCsvSourcesStore = defineStore(
  'csv-sources',
  () => {
    const csvSourcesMap = ref<Record<string, CsvSource>>({})

    function setCsvSource(segmentId: string, source: CsvSource): void {
      csvSourcesMap.value[segmentId] = source
    }

    function getCsvSource(segmentId: string): CsvSource | undefined {
      return csvSourcesMap.value[segmentId]
    }

    function removeCsvSource(segmentId: string): void {
      delete csvSourcesMap.value[segmentId]
    }

    function clear(): void {
      csvSourcesMap.value = {}
    }

    return { csvSourcesMap, setCsvSource, getCsvSource, removeCsvSource, clear }
  },
  {
    persist: {
      key: 'engine-testapp-csv-sources',
      storage: localStorage,
      pick: ['csvSourcesMap'],
    },
  },
)
