<!-- src/components/admin/QuestionList.vue -->
<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  questions: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['remove-question'])

// --- Pagination State ---
const currentPage = ref(1)
const itemsPerPage = ref(5)

// --- Pagination Computed Properties ---
const totalPages = computed(() => {
  if (!props.questions || props.questions.length === 0) return 1
  return Math.ceil(props.questions.length / itemsPerPage.value)
})

const paginatedQuestions = computed(() => {
  if (!props.questions || props.questions.length === 0) return []
  const startIndex = (currentPage.value - 1) * itemsPerPage.value
  const endIndex = startIndex + itemsPerPage.value
  return props.questions.slice(startIndex, endIndex)
})

// --- Pagination Methods ---
function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

function removeQuestion(questionId) {
  emit('remove-question', questionId)
  // If the last item on a page is removed, go to the previous page
  if (paginatedQuestions.value.length === 1 && currentPage.value > 1) {
    currentPage.value--
  }
}

// Watch for changes in the total number of questions to reset pagination
watch(
  () => props.questions.length,
  () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value || 1
    }
  },
)
</script>

<template>
  <section class="mb-8 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
    <h2 class="text-2xl font-semibold text-gray-800 mb-4">
      Existing Questions ({{ questions.length }})
    </h2>
    <div v-if="paginatedQuestions.length > 0" class="space-y-4">
      <div
        v-for="q in paginatedQuestions"
        :key="q.id"
        class="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-start justify-between"
      >
        <div class="w-full">
          <div class="flex justify-between items-center mb-2">
            <input
              type="text"
              v-model="q.category"
              class="text-sm font-medium text-blue-600 bg-transparent border-b border-blue-200 focus:outline-none focus:border-blue-500"
            />
            <button
              @click="removeQuestion(q.id)"
              class="ml-4 p-2 rounded-full text-red-600 hover:bg-red-100 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                ></path>
              </svg>
            </button>
          </div>
          <textarea
            v-model="q.text"
            rows="2"
            class="w-full text-lg font-medium text-gray-800 bg-gray-100 p-2 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          ></textarea>
          <textarea
            v-model="q.explanation"
            rows="2"
            class="w-full text-sm text-gray-600 mt-2 bg-gray-100 p-2 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Question Explanation"
          ></textarea>
          <div class="mt-4 space-y-2">
            <div v-for="(option, idx) in q.options" :key="idx" class="p-2 border-l-4">
              <input
                type="text"
                v-model="option.text"
                class="w-full text-sm text-gray-700 bg-white p-1 rounded border border-gray-200"
                placeholder="Option Text"
              />
              <textarea
                v-model="option.explanation"
                rows="1"
                class="w-full text-xs text-gray-500 mt-1 bg-white p-1 rounded border border-gray-200"
                placeholder="Option Explanation"
              ></textarea>
              <div class="flex items-center mt-1">
                <label class="text-xs mr-2">Score:</label>
                <input
                  type="number"
                  v-model.number="option.score"
                  class="w-16 text-sm text-gray-700 bg-white p-1 rounded border border-gray-200"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <p v-else class="text-gray-500 text-center py-4">No questions added yet.</p>

    <!-- Pagination Controls -->
    <div v-if="totalPages > 1" class="mt-6 flex justify-center items-center space-x-2">
      <button
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <button
        v-for="page in totalPages"
        :key="page"
        @click="goToPage(page)"
        :class="[
          'px-4 py-2 text-sm font-medium border rounded-md',
          currentPage === page
            ? 'bg-blue-600 text-white border-blue-600 z-10'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
        ]"
      >
        {{ page }}
      </button>
      <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  </section>
</template>
