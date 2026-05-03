<template>
  <div class="menu">
    <div class="menu__top-row">
      <div class="menu__links">
        <a :href="`/${locale}/`">{{ t('navbar.home') }}</a>
        <a :href="`/${locale}/zip-file`">{{ t('navbar.zipfile') }}</a>
        <a :href="`/${locale}/workspace`">{{ t('navbar.workspace') }}</a>
        <a :href="`/${locale}/settings`">{{ t('navbar.settings') }}</a>
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

    <div v-if="!isStandalone" class="menu__install-row">
      <button
        class="menu__install-button"
        :class="{ 'menu__install-button--disabled': !installPrompt }"
        :disabled="!installPrompt"
        data-testid="navbar-install-button"
        @click="promptInstall"
      >
        {{ t('navbar.addToHomeScreen') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { NavigationBarProps } from './types.ts'
  import { ref, onMounted, onUnmounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute, useRouter } from 'vue-router'

  const { locale, t } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const props = defineProps<NavigationBarProps>()

  const installPrompt = ref<Event | null>(null)

  const onBeforeInstallPrompt = (e: Event) => {
    e.preventDefault()
    installPrompt.value = e
  }

  onMounted(() => window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt))
  onUnmounted(() => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt))

  const promptInstall = async () => {
    const prompt = installPrompt.value as (Event & { prompt(): Promise<void> }) | null
    if (!prompt) return
    await prompt.prompt()
    installPrompt.value = null
  }

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
    flex-direction: column;
    background-color: var(--app-nav-background);
    color: var(--app-nav-active-menu-item);
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    padding: 0 1rem;

    .menu__top-row {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      min-height: 48px;
    }

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

    .menu__install-row {
      display: flex;
      justify-content: center;
      padding: 0.4rem 0;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
    }

    .menu__install-button {
      background: none;
      border: 1px solid var(--app-nav-active-menu-item);
      border-radius: 0.375rem;
      color: var(--app-nav-active-menu-item);
      cursor: pointer;
      font-family: inherit;
      font-size: inherit;
      padding: 0.25rem 0.875rem;
    }

    .menu__install-button:hover {
      color: var(--app-nav-active-menu-item-selected);
      border-color: var(--app-nav-active-menu-item-selected);
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
