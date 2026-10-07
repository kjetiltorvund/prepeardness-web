import { onBeforeUnmount, onMounted, ref } from 'vue'

/** Reactive wrapper around window.matchMedia, e.g. useMediaQuery('(max-width: 768px)'). */
export function useMediaQuery(query: string) {
  const mediaQuery = window.matchMedia(query)
  const matches = ref(mediaQuery.matches)

  const onChange = (event: MediaQueryListEvent) => {
    matches.value = event.matches
  }

  onMounted(() => mediaQuery.addEventListener('change', onChange))
  onBeforeUnmount(() => mediaQuery.removeEventListener('change', onChange))

  return matches
}
