<template>
  <div
    ref="domRoot"
    class="w-full border-1 rounded p-3 mt-4"
    :class="{
      'bg-gray-400': dragging || userFiles.length,
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
      <span v-else-if="userFiles.length > 0" class="flex justify-center items-center cursor-pointer">
        <span v-for="(file, index) in userFiles" :key="index">
          <span>{{ file.name }} ({{ toKb(file.size) }} kb)</span>
          - <span class="font-bold">senast ändrad:</span>
          <span>{{ toDateTime(file.lastModifiedDate) }}</span>
        </span>
        <XIcon class="h-5 w-5 ml-2" @click.prevent="handleRemove(userFiles.indexOf(file))" />
      </span>
    </label>
  </div>
</template>

<script setup>
import { ref, computed, defineEmits, defineProps } from 'vue'
import { useEventListener } from '@/composables/useEventListener'
import dayjs from 'dayjs'
import dayjsCalendar from 'dayjs/plugin/calendar'
dayjs.extend(dayjsCalendar)
import { XIcon } from '@heroicons/vue/solid'

// init
const emit = defineEmits(['drop', 'remove'])
const props = defineProps({
  fileSizeLimit: {
    type: [Number, String],
    default: Infinity, // FIXME: withDefaults()
  },
})

// state
const domRoot = ref(null)
const domInput = ref(null)
const dragging = ref(false)
const userFiles = ref([])

// events
// -- preferably would use Vue's built in @events, but need to catch the browser default 'window' drag and drop
useEventListener(window, 'dragover', handleDragOver)
useEventListener(window, 'dragleave', handleDragLeave)
useEventListener(window, 'drop', handleDrop)

// drag and drop
function handleDragOver (e) {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'none'
  // if (!domRoot.value.contains(e.target)) return // enable to only allow drop on FileDrop area
  // if (userFiles.value.length) return

  e.dataTransfer.dropEffect = 'copy'
  dragging.value = true
}

function handleDragLeave (e) {
  e.preventDefault()
  if (!domRoot.value.contains(e.target)) return

  dragging.value = false
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
  // if (!domRoot.value.contains(e.target)) return // enable to only allow drop on FileDrop area
  // if (userFiles.value.length) return
  const domFiles = e.target?.files || e.dataTransfer?.files
  if (!domFiles) return

  const files = Array.from(domFiles) // array-like list
  const okFileSizes = files.every(file => file.size < props.fileSizeLimit)
  const okFileExtensions = files.every(file => {
    const extention = file.name.split('.').pop()
    return extensionsAllowed.value.length === 0 // if not specified
      || extensionsAllowed.value.includes(extention)
  })

  if (!okFileSizes) return emit('error', `File size limit exceeded: ${props.fileSizeLimit / 1024} kb`)
  if (!okFileExtensions) return emit('error', `File extensions accepted: ${extensionsAllowed.value?.join(', ') || '(any)'}`)

  userFiles.value = files
  dragging.value = false
  emit('drop', files)
}

function handleRemove (index) {
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
