<template>
  <ul
    v-if="segments.length > 0"
    class="account-segment-list"
    data-testid="account-segment-list"
  >
    <li
      v-for="segment in segments"
      :key="segment.id"
      class="account-segment-list__item"
      :data-testid="`account-view-segment-${segment.id}`"
    >
      <div class="account-segment-list__info">
        <span class="account-segment-list__name">{{ segment.name }}</span>
        <span class="account-segment-list__meta">
          {{ segment.dateStartAsString }} – {{ segment.dateEndAsString }}
        </span>
        <span class="account-segment-list__meta">
          {{ t('account.segmentRows', segment.rows.length) }}
          <span
            v-if="uniqueRowCount(segment) !== segment.rows.length"
            class="account-segment-list__unique-count"
          >({{ t('account.statementUniqueRows', uniqueRowCount(segment)) }})</span>
        </span>
      </div>
      <button
        class="account-segment-list__remove-btn"
        :data-testid="`account-view-remove-segment-${segment.id}`"
        :title="t('account.removeSegment')"
        @click="onRemoveSegment(segment.id)"
      >
        <v-icon icon="mdi-delete-outline" size="18" />
      </button>
    </li>
  </ul>
  <p
    v-else
    class="account-segment-list__no-segments"
    data-testid="account-view-no-segments"
  >
    {{ t('account.noSegments') }}
  </p>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { BdgAccountSegment } from '@engine/modules/bdg-workspace/bdg-account-segment'
import { useWorkspaceStore } from '@budgan/stores/workspace-store.ts'

const props = defineProps<{
  segments: BdgAccountSegment[]
  accountId: string
}>()

const { t } = useI18n()
const workspaceStore = useWorkspaceStore()

function onRemoveSegment(segmentId: string): void {
  workspaceStore.removeSegment(props.accountId, segmentId)
}

function uniqueRowCount(segment: BdgAccountSegment): number {
  return segment.rows.filter((r) => !r.duplicateOf).length
}
</script>

<style scoped>
@use '@budgan/assets/colors-def.scss';

.account-segment-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.account-segment-list__item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--bdg-secondary);
  border-radius: 8px;
  background-color: var(--bdg-surface);
}

.account-segment-list__info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  flex: 1;
  min-width: 0;
}

.account-segment-list__name {
  font-weight: 600;
  font-size: 0.875rem;
}

.account-segment-list__meta {
  font-size: 0.75rem;
  opacity: 0.6;
}

.account-segment-list__unique-count {
  opacity: 0.6;
  font-size: 0.7rem;
}

.account-segment-list__no-segments {
  margin: 0;
  opacity: 0.6;
  font-size: 0.9rem;
}

.account-segment-list__remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--bdg-on-surface);
  opacity: 0.4;
  cursor: pointer;
  transition: opacity 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.account-segment-list__remove-btn:hover {
  opacity: 1;
  color: var(--bdg-error);
  border-color: var(--bdg-error);
}
</style>

