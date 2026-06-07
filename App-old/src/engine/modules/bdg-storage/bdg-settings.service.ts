import type { BdgColumnMapping } from '@engine/modules/bdg-settings/bdg-column-mapping.ts'

export interface BdgSettingsService {
  save(workspaceId: string, columnMapping: BdgColumnMapping): Promise<void>;
  update(workspaceId: string, columnMapping: BdgColumnMapping): Promise<void>;
  remove(workspaceId: string, columnMappingId: string): Promise<void>;
  get(workspaceId: string): Promise<BdgColumnMapping[]>;
}
