<script setup>
defineProps({
    value: String,
    disabled: Boolean,
});
</script>

<template>
    <button v-if="value"
        class="py-[.688rem] px-4 inline-flex justify-center items-center gap-2 rounded-md border-2 border-gray-200 font-semibold text-blue-500 hover:text-white hover:bg-blue-500 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm dark:border-gray-700 dark:hover:border-blue-500 disabled:bg-red-600"
        :disabled="disabled">
        {{ value }}
    </button>
    <button v-else
        class="py-[.688rem] px-4 inline-flex justify-center items-center gap-2 rounded-md border-2 border-gray-200 font-semibold text-blue-500 hover:text-white hover:bg-blue-500 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm dark:border-gray-700 dark:hover:border-blue-500 disabled:bg-red-600"
        :disabled="disabled">
        <slot />
    </button>
</template>