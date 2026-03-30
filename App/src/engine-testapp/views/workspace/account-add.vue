<template>
  <section class="account-add">
    <h3 class="account-add__title">{{ t('workspace.menu.addAccount') }}</h3>
    <p class="account-add__description">This is a placeholder for adding an account to the workspace.</p>
  </section>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()
</script>

<style scoped>
  .account-add {
    display: grid;
    gap: 1.5rem;
  }

  .account-add__title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .account-add__description {
    margin: 0;
    color: rgb(var(--v-theme-on-surface-variant));
  }
</style>
