<script setup>
const props = defineProps({
    title: String,
});

let classes = ""
if (props.title) {
    classes = "";
} else {
    classes = "hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-150 ease-in-out";
}

</script>

<template>
    <tr :class="classes">
        <slot />
    </tr>
</template>