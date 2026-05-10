import { createI18n } from 'vue-i18n'
import router from '@budgan/router/index.ts'

export type SupportedLocales = 'en' | 'fr'
const supportedLocales: SupportedLocales[] = ['en', 'fr']

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
})

async function loadLocaleMessages(locale: SupportedLocales): Promise<void> {
  const messages = i18n.global.getLocaleMessage(locale)
  if (!messages || Object.keys(messages).length === 0) {
    const loaded = await import(`./locales/${locale}.json`)
    i18n.global.setLocaleMessage(locale, loaded.default)
  }
}

router.beforeEach(async (to, from, next) => {
  const locale = to.params.locale as SupportedLocales

  if (!supportedLocales.includes(locale)) {
    return next('/en')
  }

  await loadLocaleMessages(locale)
  i18n.global.locale.value = locale

  next()
})

