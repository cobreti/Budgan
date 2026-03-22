import { createI18n } from 'vue-i18n'
import { router } from '@engineTestApp/router'

export const i18n = createI18n({
    locale: 'en',
    fallbackLocale: 'en'
})

export type SupportedLocales = 'en' | 'fr'
const supportedLocales: SupportedLocales[] = ['en', 'fr']

async function loadLocaleMessages(locale: SupportedLocales) {
    const messages = i18n.global.getLocaleMessage(locale);

    if (!messages || Object.keys(messages).length === 0) {
        const messages = await import(`./locales/${locale}.json`)
        i18n.global.setLocaleMessage(locale, messages.default)
    }
}

router.beforeEach(async (to, from, next) => {
    const locale = to.params.locale as SupportedLocales

    // fallback if invalid
    if (!supportedLocales.includes(locale)) {
        return next('/en')
    }

    await loadLocaleMessages(locale);

    // 🔑 set locale in vue-i18n
    i18n.global.locale = locale

    next()
})
