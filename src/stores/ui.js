import { ref } from 'vue'
import { defineStore } from 'pinia'

/**
 * @description UI store for managing global UI state, such as the main scrollable element.
 * This helps components like the AppFooter know which element to monitor for scroll events,
 * especially in complex layouts with nested scrollable areas.
 */
export const useUiStore = defineStore('ui', () => {
  const mainScrollContainer = ref(null)

  function setMainScrollContainer(element) {
    mainScrollContainer.value = element
  }

  return { mainScrollContainer, setMainScrollContainer }
})
