<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
    domains: {
        type: Array,
        default: []
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
    <select ref="input"
        class="py-3 px-4 pr-9 block w-full border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
        :value="modelValue" @input="$emit('update:modelValue', $event.target.value)">
        <option selected disabled>Select the domain</option>
        <option v-for="domain in domains" :value="domain">{{ domain }}</option>
    </select>
</template>