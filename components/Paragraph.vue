<script setup>
defineProps({
    value: String,
});
</script>
    
<template>
    <p v-if="value" class="block text-sm font-normal text-gray-200">{{ value }}</p>
    <p v-else class="block text-sm font-normal text-gray-200">
        <slot />
    </p>
</template>