import type { BdgColumnMapping } from '@engine/modules/bdg-settings/bdg-column-mapping.ts'

export interface BdgSettingsService {
  saveColumnMapping(columnMapping: BdgColumnMapping): Promise<void>;
}
