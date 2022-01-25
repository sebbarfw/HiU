import { onMounted, onBeforeUnmount } from 'vue';

export function useEventListener (target, event, handler, options) {
  onMounted(() => {
    target.addEventListener(event, handler, options)
  })

  onBeforeUnmount(() => {
    target.removeEventListener(event, handler)
  })
}
