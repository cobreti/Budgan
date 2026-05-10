<template>
  <div class="home-view">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<style scoped>
@use '@budgan/assets/colors-def.scss';

.home-view {
  height: 100%;
  background-color: var(--bdg-background);
}
</style>

