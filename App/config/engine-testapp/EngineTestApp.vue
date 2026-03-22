<template>
    <v-app>
        <div class="nav-bar-header">
            <navigation-bar></navigation-bar>
        </div>
        <div class="main-content">
            <h1>Engine Test App</h1>
            <router-view></router-view>
        </div>
    </v-app>
</template>

<style scoped>
    .nav-bar-header {
        position: sticky;
        top: 0;
        left: 0;
        width: 100%;
        padding: 1em;
        background-color: var(--app-nav-background);
        color: var(--app-nav-active-menu-item);
    }

    .main-content {
        margin: 1em;
    }
</style>

<script setup lang="ts">
    import NavigationBar from '@/engine-testapp/components/navigation-bar/navigation-bar.vue'
</script>
