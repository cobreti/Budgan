<template>
  <v-card
    class="add-account-card"
    variant="outlined"
    data-testid="add-account-card"
    @click="showDialog = true"
  >
    <v-card-text class="add-account-card__trigger">
      <v-icon icon="mdi-plus" class="add-account-card__icon" />
      <span>{{ t('accounts.addAccount') }}</span>
    </v-card-text>
  </v-card>

  <AddAccount v-model="showDialog" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AddAccount from './add-account.vue'

const { t } = useI18n()
const showDialog = ref(false)
</script>

<style scoped>
@use '@budgan/assets/colors-def.scss';

.add-account-card {
  border-style: dashed !important;
  border-color: var(--bdg-secondary) !important;
  cursor: pointer;
  transition: box-shadow 0.15s ease;
}

.add-account-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.add-account-card__trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--bdg-secondary);
  font-size: 0.95rem;
}

.add-account-card__icon {
  color: var(--bdg-secondary);
}
</style>

