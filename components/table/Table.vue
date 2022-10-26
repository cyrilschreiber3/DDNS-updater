<script setup>

</script>

<template>
    <div class="flex flex-col">
        <div class="-m-1.5 overflow-x-auto">
            <div class="p-1.5 min-w-full inline-block align-middle">
                <div class="border rounded-lg overflow-hidden dark:border-gray-700 dark:bg-gray-800">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">

                        <thead>
                            <slot name="header" />
                        </thead>
                        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                            <slot name="content" />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>