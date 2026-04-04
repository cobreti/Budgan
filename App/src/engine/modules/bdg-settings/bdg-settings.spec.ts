import { describe, it, expect } from 'vitest'
import { BdgSettingsImpl } from './bdg-settings'
import type { BdgColumnMapping } from './bdg-column-mapping'

describe('BdgSettingsImpl', () => {
  const mapping1: BdgColumnMapping = {
    id: '1',
    name: 'Mapping 1',
    columnMapping: { columns: [] }
  }

  it('should throw an error when updating a mapping that does not exist', () => {
    const settings = new BdgSettingsImpl()
    expect(() => settings.updateColumnMapping(mapping1)).toThrow()
  })

  it('should throw an error when adding a mapping that already exists', () => {
    const settings = new BdgSettingsImpl()
    settings.addColumnMapping(mapping1)
    expect(() => settings.addColumnMapping(mapping1)).toThrow()
  })

  it('should correctly add a mapping when it does not exist', () => {
    const settings = new BdgSettingsImpl()
    settings.addColumnMapping(mapping1)
    expect(settings.columnMappings).toContain(mapping1)
  })

  it('should correctly update a mapping when it exists', () => {
    const settings = new BdgSettingsImpl()
    settings.addColumnMapping(mapping1)
    const updatedMapping = { ...mapping1, name: 'Updated' }
    settings.updateColumnMapping(updatedMapping)
    expect(settings.columnMappings.find(m => m.id === '1')?.name).toBe('Updated')
  })
})
