<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
    placeholder: {
        type: String,
        default: 'Enter text'
    },
    modelValue: String,
})

defineEmits(['update:modelValue']);
const input = ref(null);
onMounted(() => {
    if (input.value.hasAttribute('autofocus')) {
        input.value.focus();
    }
});
defineExpose({ focus: () => input.value.focus() });

</script>

<template>
    <select ref="input" type="text"
        class="py-2 px-3 block w-full border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 placeholder:dark:text-gray-400 "
        :value="modelValue" @input="$emit('update:modelValue', $event.target.value)">
        <slot />
    </select>
</template>