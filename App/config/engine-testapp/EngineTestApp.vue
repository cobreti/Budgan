<template>
    <div>
        <div class="nav-bar-header">
            <navigation-bar></navigation-bar>
        </div>
        <div class="main-content">
            <h1>Engine Test App</h1>
        </div>
    </div>
</template>

<style scoped>
    .nav-bar-header {
        position: sticky;
        top: 0;
        left: 0;
        width: 100%;
        padding: 1em;
        background-color: lightblue;
    }

    .main-content {
        margin: 1em;
    }
</style>

<script setup lang="ts">
    import NavigationBar from '@/components/navigation-bar/navigation-bar.vue'
</script>
