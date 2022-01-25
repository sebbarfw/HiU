<template>
  <div
    ref="domRoot"
    class="w-full border-1 rounded p-3"
    :class="{
      'bg-gray-400': dragging,
      'cursor-copy': true,
    }"
  >
    <label
      for="files"
      class="block border-2 border-dashed rounded p-4 overflow-hidden text-center"
    >
      <span class="block" v-if="!userFiles.length">
        Dra- och släpp filer för att ladda upp, eller <span class="underline underline-offset-2 cursor-pointer">klicka här</span>

        <input
            type="file"
            id="files"
            ref="domInput"
            class="w-0 h-0 opacity-0 overflow-hidden"
            @change="handleDrop"
        />
      </span>
      <template v-else-if="userFiles.length > 0">
        <div v-for="(file, index) in userFiles" :key="`${file.name}-${index}`">
          {{ file.name }} ({{ toKb(file.size) }} kb) - <strong>senast ändrad:</strong> {{ toDateTime(file.lastModifiedDate) }}
          <button @click.prevent="handleRemove(userFiles.indexOf(file))" title="Remove file">x</button>
        </div>
      </template>
    </label>
  </div>
</template>

<script setup>
import { ref, computed, defineEmits } from 'vue'
import dayjs from 'dayjs'
import dayjsCalendar from 'dayjs/plugin/calendar'
dayjs.extend(dayjsCalendar)

import { useEventListener } from '@/composables/useEventListener'

// events
// -- preferably would use Vue's built in @events, but need to catch the browser default 'window' drag and drop
useEventListener(window, 'dragover', handleDragOver)
useEventListener(window, 'dragleave', handleDragLeave)
useEventListener(window, 'drop', handleDrop)

// state
const emit = defineEmits()
const domRoot = ref(null)
const domInput = ref(null)
const userFiles = ref([])
const dragging = ref(false)

// drag and drop
function handleDragOver (e) {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'none'
  if (!domRoot.value.contains(e.target)) return
  if (userFiles.value.length) return console.log('handleDragOver: ignoring, since already have files')

  e.dataTransfer.dropEffect = 'copy'
  dragging.value = true
  console.log('handleDragOver')
}
function handleDragLeave (e) {
  e.preventDefault()
  if (!domRoot.value.contains(e.target)) return

  dragging.value = false
  console.log('handleDragLeave')
}

const extensionsAllowed = computed(() => {
  return domInput.value
    ?.getAttribute('accept')
    ?.split(',')
    ?.map(ext => ext.substring(1))
    ?? []
})

async function handleDrop (e) {
  e.preventDefault()
  if (!domRoot.value.contains(e.target)) return
  if (userFiles.value.length) return

  const files = e.dataTransfer.files // array-like list
  // const okFileSizes = Array.from(files).every(file => file.size < this.fileSizeLimit)
  const okFileExtensions = Array.from(files).every(file => {
    const extention = file.name.split('.').pop()
    return extensionsAllowed.value.length === 0 // if not specified
      || extensionsAllowed.value.includes(extention)
  })

  // if (!okFileSizes) return emit('error', `File size limit exceeded: ${this.fileSizeLimit / 1024} kb`)
  if (!okFileExtensions) return emit('error', `File extensions accepted: ${extensionsAllowed.value?.join(', ') || '(any)'}`)

  console.log('files:', files)

  userFiles.value = Array.from(files)
  domInput.value.files = files // need to be array-like list

  const filePromises = userFiles.value.map(file => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve({ file, content: e.target.result })
      reader.readAsText(file)
    })
  })

  Promise.all(filePromises).then(files => emit('load', files))
}

function handleRemove (index) {
  console.log('handleRemove')
  const [file] = userFiles.value?.splice(index, 1) || []
  if (file) emit('remove', { file })
}

// -- filters --
function toKb (value) {
  return Math.floor(value / 1024)
}
function toDateTime (value) {
  return dayjs(value).calendar()
}
</script>
