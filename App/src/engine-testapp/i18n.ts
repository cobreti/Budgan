import { createI18n } from 'vue-i18n'
import { router } from '@engineTestApp/router'

const messages = {
    en: {},
    fr: {}
}

export const i18n = createI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages
})

const supportedLocales = ['en', 'fr']

router.beforeEach((to, from, next) => {
    const locale = to.params.locale as string;

    // fallback if invalid
    if (!supportedLocales.includes(locale)) {
        return next('/en')
    }

    // 🔑 set locale in vue-i18n
    i18n.global.locale = locale as 'en' | 'fr';

    next()
})
