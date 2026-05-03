<template>
  <div class="account-graphs" data-testid="account-graphs">
    <AccountProgressionGraph
      v-if="account"
      :segments="account.segments"
      :reference-balance="account.referenceBalance"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useWorkspaceStore } from '@budgan/stores/workspace-store.ts'
import AccountProgressionGraph from '@budgan/components/account/graphs/account-progression-graph.vue'

const route = useRoute()
const workspaceStore = useWorkspaceStore()

const account = computed(() => {
  const id = route.params.accountId
  const accountId = typeof id === 'string' ? id : null
  return workspaceStore.workspace?.accounts.find((a: { id: string }) => a.id === accountId) ?? null
})
</script>

<style scoped>
@use '@budgan/assets/colors-def.scss';

.account-graphs {
  padding: 1rem 0;
  color: var(--bdg-on-surface);
}
</style>
