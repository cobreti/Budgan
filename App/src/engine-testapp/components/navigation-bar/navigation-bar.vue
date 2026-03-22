<template>
    <div class="menu">
        <a :href="`/${locale}/`" >Home</a>
        <a :href="`/${locale}/zip-file`" >Zip File</a>
    </div>
</template>

<script setup lang="ts">
    import { useRoute } from 'vue-router'
    import type { NavigationBarProps } from './types.ts'
    import { useI18n } from 'vue-i18n'

    const { locale } = useI18n();
    const props = defineProps<NavigationBarProps>()

</script>

<style scoped>
    @use 'colors-def';

    .menu {
        display: flex;
        flex-direction: row;
        gap: 20px;
        background-color: var(--app-nav-background);
        color: var(--app-nav-active-menu-item);
        font-family: 'Inter', sans-serif;
        font-size: 14px;

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