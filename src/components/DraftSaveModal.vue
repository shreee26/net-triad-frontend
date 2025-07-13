<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  draftName: {
    type: String,
    default: 'Untitled Draft',
  },
  // Add a new prop to conditionally display discard button
  discardable: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['save', 'discard', 'cancel'])

const customDraftName = ref(props.draftName)
const isSaving = ref(false)

// Computed property for the default draft name
const defaultDraftName = computed(() => {
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  return `Draft Assessment - ${dateStr}`
})

// Handle save with custom name
const handleSave = async () => {
  if (!customDraftName.value.trim()) {
    customDraftName.value = defaultDraftName.value
  }

  isSaving.value = true

  try {
    await emit('save', customDraftName.value.trim(), props.isExistingDraft)
  } finally {
    isSaving.value = false
  }
}

// Handle discard
const handleDiscard = () => {
  emit('discard')
}

// Handle cancel
const handleCancel = () => {
  emit('cancel')
}

// Watch for show prop changes to initialize draft name
watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      // When the modal opens, set the name. Prioritize the prop, otherwise use a fresh default.
      customDraftName.value = props.draftName || defaultDraftName.value
    }
  },
)
</script>

<template>
  <transition name="modal-fade">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center px-3 sm:p-4 z-50"
    >
      <div
        class="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm sm:max-w-md relative transform transition-all duration-300 scale-100 opacity-100"
      >
        <!-- Close button -->
        <button
          @click="handleCancel"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>

        <!-- Header -->
        <div class="text-center mb-6">
          <div
            class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4"
          >
            <svg
              class="h-6 w-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-2">Save Your Progress?</h3>
          <p class="text-gray-600 text-sm">
            You have unsaved changes. Would you like to save your progress as a draft?
          </p>
        </div>

        <!-- Draft Name Input -->
        <div class="mb-6">
          <label for="draft-name" class="block text-sm font-medium text-gray-700 mb-2">
            Draft Name
          </label>
          <input
            id="draft-name"
            v-model="customDraftName"
            type="text"
            placeholder="Enter draft name..."
            class="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            maxlength="50"
          />
          <p class="text-xs text-gray-500 mt-1">
            Give your draft a meaningful name to easily identify it later
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3">
          <!-- Save Button -->
          <button
            @click="handleSave"
            :disabled="isSaving"
            class="flex-1 cursor-pointer flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              v-if="isSaving"
              class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              ></path>
            </svg>
            {{ isSaving ? 'Saving...' : 'Save Draft' }}
          </button>

          <!-- Discard Button -->
          <button
            v-if="discardable"
            @click="handleDiscard"
            class="flex-1 cursor-pointer px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              ></path>
            </svg>
            Discard
          </button>
        </div>

        <!-- Cancel Button -->
        <button
          @click="handleCancel"
          class="w-full mt-3 px-4 py-2 text-gray-500 text-sm font-medium rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
        >
          Cancel
        </button>

        <!-- Info Text -->
        <div class="mt-4 p-3 bg-blue-50 rounded-md">
          <div class="flex">
            <svg
              class="w-5 h-5 text-blue-400 mr-2 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <p class="text-xs text-blue-700">
              Your draft will be saved and you can continue from where you left off later.
            </p>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
