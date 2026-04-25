<template>
  <v-app-bar color="primary">
    <template #prepend>
      <v-app-bar-nav-icon
        class="app-header__menu-btn"
        data-testid="app-header-menu-btn"
        aria-label="Open menu"
      />
    </template>
    <template #title>
      <span class="app-header__title">Budgan</span>
    </template>
  </v-app-bar>
</template>

<style scoped>
@use '@/assets/colors-def.scss';

.app-header__title {
  cursor: default;
  user-select: none;
}

.app-header__menu-btn {
  cursor: pointer;
}
</style>

