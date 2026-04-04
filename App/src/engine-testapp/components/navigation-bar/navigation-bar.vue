<template>
  <div class="menu">
    <div class="menu__links">
      <a :href="`/${locale}/`">{{ t('navbar.home') }}</a>
      <a :href="`/${locale}/zip-file`">{{ t('navbar.zipfile') }}</a>
      <a :href="`/${locale}/workspace`">{{ t('navbar.workspace') }}</a>
    </div>

    <div class="menu__language-switcher">
      <span class="menu__language-label">{{ t('navbar.language') }}:</span>
      <a
        href="#"
        :class="{ 'menu__language-link--active': locale === 'en' }"
        @click.prevent="switchLanguage('en')"
      >
        {{ t('navbar.en') }}
      </a>
      <span class="menu__language-separator">|</span>
      <a
        href="#"
        :class="{ 'menu__language-link--active': locale === 'fr' }"
        @click.prevent="switchLanguage('fr')"
      >
        {{ t('navbar.fr') }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { NavigationBarProps } from './types.ts'
  import { useI18n } from 'vue-i18n'
  import { useRoute, useRouter } from 'vue-router'

  const { locale, t } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const props = defineProps<NavigationBarProps>()

  const switchLanguage = (newLocale: string) => {
    const currentPath = route.fullPath
    const newPath = currentPath.replace(/^\/(en|fr)/, `/${newLocale}`)
    router.push(newPath)
  }
</script>

<style scoped>
  @use 'colors-def';

  .menu {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    background-color: var(--app-nav-background);
    color: var(--app-nav-active-menu-item);
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    padding: 0 1rem;
    min-height: 48px;

    .menu__links {
      display: flex;
      gap: 20px;
    }

    .menu__language-switcher {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .menu__language-label {
      opacity: 0.8;
    }

    .menu__language-separator {
      opacity: 0.5;
    }

    .menu__language-link--active {
      font-weight: bold;
      text-decoration: underline;
    }

    a {
      color: var(--app-nav-active-menu-item);
      text-decoration: none;
      cursor: pointer;
    }

    a:hover {
      color: var(--app-nav-active-menu-item-selected);
      text-decoration: underline;
    }
  }
</style>
