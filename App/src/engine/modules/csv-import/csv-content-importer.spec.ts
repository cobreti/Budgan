import { describe, expect, test } from 'vitest'
import { CsvContentImporterImpl } from './csv-content-importer'
import { ReaderFactory } from '@engine/services/FileReaderFactory'
import { IdGenerator } from '@engine/services/IdGenerator'
import type { CsvColumnMapping } from './csv-column-content'
import { CsvColumns } from './csv-column-content'

const csvContent = [
  'CardNumber,Description,Date,Amount',
  '1234,Coffee,2024-03-15,-4.20',
  '1234,Salary,2024-03-01,1200.00',
].join('\n')

function makeFakeReader(content: string): FileReader {
  const reader = {
    onload: null as ((event: ProgressEvent<FileReader>) => void) | null,
    onerror: null as (() => void) | null,
    readAsText(_file: File) {
      if (this.onload) {
        this.onload({ target: { result: content } } as ProgressEvent<FileReader>)
      }
    },
  }
  return reader as unknown as FileReader
}

function makeReaderFactory(content: string): ReaderFactory {
  return {
    createReader: () => makeFakeReader(content),
  } as unknown as ReaderFactory
}

function makeIdGenerator(id: string): IdGenerator {
  return {
    generateId: () => id,
  } as unknown as IdGenerator
}

const columnMapping: CsvColumnMapping = {
  [CsvColumns.cardNumber]: 0,
  [CsvColumns.description]: 1,
  [CsvColumns.dateTransaction]: 2,
  [CsvColumns.amount]: 3,
}

describe('CsvContentImporterImpl', () => {
  test('returns a segment with the id from IdGenerator', async () => {
    const importer = new CsvContentImporterImpl(
      makeReaderFactory(csvContent),
      makeIdGenerator('generated-id-123'),
    )
    const file = new File([csvContent], 'march.csv', { type: 'text/csv' })
    const result = await importer.import(file, columnMapping)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.value.id).toBe('generated-id-123')
    }
  })

  test('uses the filename (without extension) as segment name', async () => {
    const importer = new CsvContentImporterImpl(
      makeReaderFactory(csvContent),
      makeIdGenerator('any-id'),
    )
    const file = new File([csvContent], 'march-2024.csv', { type: 'text/csv' })
    const result = await importer.import(file, columnMapping)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.value.name).toBe('march-2024')
    }
  })

  test('returns an error when the reader fires onerror', async () => {
    const reader = {
      onload: null,
      onerror: null as (() => void) | null,
      readAsText() {
        if (this.onerror) this.onerror()
      },
    } as unknown as FileReader
    const readerFactory = { createReader: () => reader } as unknown as ReaderFactory

    const importer = new CsvContentImporterImpl(readerFactory, makeIdGenerator('any-id'))
    const file = new File([], 'bad.csv', { type: 'text/csv' })
    const result = await importer.import(file, columnMapping)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Failed to read the file')
    }
  })
})
