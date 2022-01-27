<template>
  <div class="flex justify-between items-center cursor-pointer">
    <div class="w-11 h-6 flex items-center bg-gray-300 rounded p-1 duration-300 ease-in-out" :class="{ 'bg-green-500': checked }">
      <div class="bg-white w-5 h-4 rounded shadow-md transform duration-300 ease-in-out" :class="{ 'translate-x-4': checked }"></div>
    </div>
    <div class="ml-2 text-lg">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { defineProps, toRefs } from 'vue'

const props = defineProps({
  checked: Boolean,
})

const { checked } = toRefs(props)
</script>
