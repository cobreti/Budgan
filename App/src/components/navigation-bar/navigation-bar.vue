<template>
    <div>
        Content
    </div>
</template>

<style scoped>
    .test {
        color: red;
    }
</style>

<script setup lang="ts">
    import type { NavigationBarProps } from '@/components/navigation-bar/types.ts'

    const props = defineProps<NavigationBarProps>()
</script>
