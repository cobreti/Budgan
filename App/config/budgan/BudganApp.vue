<template>
  <div>
    <v-app :full-height="true">
      <v-app-bar color="teal-darken-4" image="https://picsum.photos/1920/1080?random" title="Budgan">
        <template v-slot:image>
          <v-img
              gradient="to top right, rgba(19,84,122,.8), rgba(128,208,199,.8)"
          ></v-img>
        </template>
        <template v-slot:prepend>
          <v-app-bar-nav-icon></v-app-bar-nav-icon>
        </template>
        <template v-slot:append>
          v{{version}}
        </template>
      </v-app-bar>
      <v-main :scrollable="false">
        <RouterView>
        </RouterView>
      </v-main>
    </v-app>
  </div>
</template>

<style scoped>

</style>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAppSettingsStore } from '@/stores/appSettings-store.ts'
import settings from '@/assets/settings.json';
import { computed } from 'vue'

const appSettingsStore = useAppSettingsStore();

appSettingsStore.setVersion(settings.version);

const version = computed(() => appSettingsStore.appSettings.version);

</script>
