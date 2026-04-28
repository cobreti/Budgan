<template>
  <AccountSegmentList
    v-if="account"
    :segments="account.segments"
    :account-id="account.id"
    data-testid="account-statements-view"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useWorkspaceStore } from '@budgan/stores/workspace-store.ts'
import AccountSegmentList from '@budgan/components/account/account-segment-list.vue'

const route = useRoute()
const workspaceStore = useWorkspaceStore()

const account = computed(() => {
  const id = route.params.accountId
  const accountId = typeof id === 'string' ? id : null
  return workspaceStore.workspace?.accounts.find((a) => a.id === accountId) ?? null
})
</script>

