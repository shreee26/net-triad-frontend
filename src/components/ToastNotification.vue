<!-- src/components/ToastNotification.vue -->
<script setup>
import { watch, onUnmounted } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'info', // 'info', 'success', 'warning', 'error'
  },
  duration: {
    type: Number,
    default: 3000,
  },
})

const emit = defineEmits(['close'])

let timer = null

const closeToast = () => {
  emit('close')
}

watch(
  () => props.show,
  (newValue) => {
    if (timer) {
      clearTimeout(timer)
    }
    if (newValue) {
      timer = setTimeout(() => {
        closeToast()
      }, props.duration)
    }
  },
)

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer)
  }
})

const typeClasses = {
  info: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
}

const iconPaths = {
  success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  warning:
    'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
}
</script>

<template>
  <transition
    enter-active-class="transition-all duration-300 ease-out"
    leave-active-class="transition-all duration-300 ease-in"
    enter-from-class="opacity-0 transform translate-x-full"
    leave-to-class="opacity-0 transform translate-x-full"
  >
    <div
      v-if="show"
      :class="[
        'fixed top-20 right-5 w-auto max-w-md p-4 rounded-lg shadow-2xl text-white flex items-center z-[100]',
        typeClasses[type] || 'bg-gray-800',
      ]"
      role="alert"
    >
      <div class="flex-shrink-0">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            :d="iconPaths[type] || iconPaths.info"
          ></path>
        </svg>
      </div>
      <div class="ml-3 font-medium">
        {{ message }}
      </div>
      <button
        @click="closeToast"
        class="ml-4 -mr-2 p-1 rounded-full hover:bg-black/20 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </button>
    </div>
  </transition>
</template>
