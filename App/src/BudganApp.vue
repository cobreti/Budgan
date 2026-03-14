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
import { useAppSettingsStore } from '@/stores/appSettings-store'
import settings from './assets/settings.json';
import { computed } from 'vue'
import {container} from "@/inversify/setup-inversify";
import {IdGenerator} from "@engine/services/IdGenerator";
import {ReaderFactory} from "@engine/services/FileReaderFactory.ts";
import {CsvToBankAccount} from "@engine/services/CsvToBankAccount.ts";

const IdGen = container.get<IdGenerator>(IdGenerator.bindingTypeId);
const reader = container.get<ReaderFactory>(ReaderFactory.bindingTypeId);
const csvToBankAccount = container.get<CsvToBankAccount>(CsvToBankAccount.bindingTypeId);

const appSettingsStore = useAppSettingsStore();

appSettingsStore.setVersion(settings.version);

const version = computed(() => appSettingsStore.appSettings.version);

</script>
