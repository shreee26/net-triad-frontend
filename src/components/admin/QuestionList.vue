<!-- src/components/admin/QuestionList.vue -->
<script setup>
import { ref, computed, watch } from 'vue'
import { VueDraggableNext as draggable } from 'vue-draggable-next'

const props = defineProps({
  questions: {
    type: Array,
    required: true,
  },
  categories: {
    type: Array,
    default: () => [],
  },
  scrollContainer: {
    type: Object, // HTMLElement
    default: null,
  },
})

const emit = defineEmits(['remove-question', 'update:questions', 'update:question'])

// --- Modal State ---
const showConfirmModal = ref(false)
const questionToRemoveId = ref(null)

// --- Pagination State ---
const currentPage = ref(1)
const itemsPerPage = ref(5)

// --- Pagination Computed Properties ---
const totalPages = computed(() => {
  if (!props.questions || props.questions.length === 0) return 1
  return Math.ceil(props.questions.length / itemsPerPage.value)
})

const paginatedQuestions = computed({
  get() {
    if (!props.questions || props.questions.length === 0) return []
    const startIndex = (currentPage.value - 1) * itemsPerPage.value
    const endIndex = startIndex + itemsPerPage.value
    const paginated = props.questions.slice(startIndex, endIndex)
    return paginated
  },
  set(newOrderOfPaginatedItems) {
    // This setter is triggered when vue-draggable-next reorders the items on the current page.
    // We construct the new full list and emit it to the parent.
    const fullQuestionList = [...props.questions]
    const startIndex = (currentPage.value - 1) * itemsPerPage.value

    // Replace the slice of the array corresponding to the current page with the new order
    fullQuestionList.splice(
      startIndex,
      newOrderOfPaginatedItems.length,
      ...newOrderOfPaginatedItems,
    )

    // Emit the newly constructed full list to the parent for re-numbering
    emit('update:questions', fullQuestionList)
  },
})

// --- Pagination Methods ---
function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

function removeQuestion(questionId) {
  questionToRemoveId.value = questionId
  showConfirmModal.value = true
}

function confirmRemove() {
  if (questionToRemoveId.value !== null) {
    emit('remove-question', questionToRemoveId.value)
    // If the last item on a page is removed, go to the previous page
    if (paginatedQuestions.value.length === 1 && currentPage.value > 1) {
      currentPage.value--
    }
  }
  cancelRemove()
}

function cancelRemove() {
  showConfirmModal.value = false
  questionToRemoveId.value = null
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
/**
 * Emits an event to the parent component when a question's property is changed.
 * This is a robust way to handle state updates without directly mutating props.
 * @param {object} question The question being edited.
 * @param {string} field The property of the question being changed (e.g., 'text', 'category').
 * @param {any} value The new value for the property.
 */
function updateQuestionField(question, field, value) {
  // Create a new object with the updated value and emit it to the parent.
  const updatedQuestion = { ...question, [field]: value }
  emit('update:question', updatedQuestion)
}

/**
 * Handles updates to a specific field within a question's option.
 * @param {object} question The parent question object.
 * @param {number} optionIndex The index of the option being edited.
 * @param {string} field The property of the option being changed (e.g., 'text', 'score').
 * @param {any} value The new value for the property.
 */
function updateOptionField(question, optionIndex, field, value) {
  const newOptions = JSON.parse(JSON.stringify(question.options))
  newOptions[optionIndex][field] = value
  const updatedQuestion = { ...question, options: newOptions }
  emit('update:question', updatedQuestion)
}

// --- Mobile Drag-to-Scroll Logic ---
let animationFrameId = null
let scrollSpeed = 0

/**
 * Continuously scrolls the container based on the current scrollSpeed.
 * Uses requestAnimationFrame for smooth, performant animation.
 */
function scrollLoop() {
  if (scrollSpeed !== 0 && props.scrollContainer) {
    props.scrollContainer.scrollBy(0, scrollSpeed)
    animationFrameId = requestAnimationFrame(scrollLoop)
  } else {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
    animationFrameId = null
  }
}

/**
 * Calculates the required scroll speed when a dragged item enters the
 * "hot zones" at the top or bottom of the scrollable container.
 * @param {object} evt The move event from vue-draggable-next.
 */
function onDragMove(evt) {
  const container = props.scrollContainer
  if (!container) return

  const originalEvent = evt.originalEvent
  // Handle both mouse and touch events to get the Y coordinate
  const clientY = originalEvent.touches ? originalEvent.touches[0].clientY : originalEvent.clientY

  const rect = container.getBoundingClientRect()
  const sensitivity = 100 // The "hot zone" size in pixels from the top/bottom edge
  const maxSpeed = 20 // Maximum scroll speed in pixels per frame

  if (clientY < rect.top + sensitivity) {
    // Scrolling up
    const distance = rect.top + sensitivity - clientY
    scrollSpeed = -maxSpeed * (distance / sensitivity)
  } else if (clientY > rect.bottom - sensitivity) {
    // Scrolling down
    const distance = clientY - (rect.bottom - sensitivity)
    scrollSpeed = maxSpeed * (distance / sensitivity)
  } else {
    scrollSpeed = 0
  }

  // If scrolling is needed and the loop isn't running, start it.
  if (scrollSpeed !== 0 && !animationFrameId) {
    animationFrameId = requestAnimationFrame(scrollLoop)
  }
}

/**
 * Stops the scrolling loop when the drag operation ends.
 */
function onDragEnd() {
  scrollSpeed = 0
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}
</script>

<template>
  <section class="mb-8 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
    <div class="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
      <h2 class="text-2xl font-semibold text-gray-800">
        Existing Questions ({{ questions.length }})
      </h2>
      <!-- Pagination Controls -->
      <div
        v-if="totalPages > 1"
        class="flex justify-center items-center space-x-2 flex-wrap gap-y-2"
      >
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-4 py-2 text-sm cursor-pointer font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
              ? 'bg-blue-600 text-white cursor-pointer border-blue-600 z-10'
              : 'bg-white text-gray-700 cursor-pointer border-gray-300 hover:bg-gray-50',
          ]"
        >
          {{ page }}
        </button>
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 text-sm font-medium cursor-pointer text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>

    <transition name="page-fade" mode="out-in">
      <div :key="currentPage">
        <div v-if="paginatedQuestions.length > 0" class="relative">
          <!-- Re-implementing draggable based on official documentation -->
          <draggable
            v-model="paginatedQuestions"
            item-key="uuid"
            tag="div"
            class="space-y-4"
            handle=".drag-handle"
            name="question-list"
            @move="onDragMove"
            @end="onDragEnd"
          >
            <div
              v-for="q in paginatedQuestions"
              :key="q.uuid"
              class="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-start gap-3"
            >
              <!-- Drag Handle -->
              <div class="drag-handle pt-1">
                <svg
                  class="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 6h16M4 12h16m-7 6h7"
                  ></path>
                </svg>
              </div>

              <div class="w-full">
                <div class="flex justify-between items-start mb-2 gap-4">
                  <div class="flex-grow flex items-center gap-4">
                    <div>
                      <label :for="`q-id-${q.id}`" class="block text-xs font-medium text-gray-500"
                        >No.</label
                      >
                      <input
                        type="text"
                        :id="`q-id-${q.id}`"
                        :value="q.id"
                        readonly
                        class="w-12 text-center bg-gray-100 border border-gray-300 rounded-md p-1"
                      />
                    </div>
                    <div class="flex-grow">
                      <label :for="`q-cat-${q.id}`" class="block text-xs font-medium text-gray-500"
                        >Category</label
                      >
                      <input
                        :id="`q-cat-${q.id}`"
                        :value="q.category"
                        class="w-full text-sm font-medium text-blue-600 bg-transparent border-b border-blue-200 focus:outline-none focus:border-blue-500"
                        @input="updateQuestionField(q, 'category', $event.target.value)"
                        :list="`category-list-${q.id}`"
                      />
                      <datalist :id="`category-list-${q.id}`">
                        <option v-for="cat in props.categories" :key="cat" :value="cat"></option>
                      </datalist>
                    </div>
                  </div>
                  <button
                    @click="removeQuestion(q.id)"
                    class="p-2 rounded-full cursor-pointer text-red-600 hover:bg-red-100 transition-colors flex-shrink-0"
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
                  :value="q.text"
                  rows="2"
                  class="w-full text-lg font-medium text-gray-800 bg-gray-100 p-2 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  @input="updateQuestionField(q, 'text', $event.target.value)"
                ></textarea>
                <textarea
                  :value="q.explanation"
                  rows="2"
                  class="w-full text-sm text-gray-600 mt-2 bg-gray-100 p-2 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Question Explanation"
                  @input="updateQuestionField(q, 'explanation', $event.target.value)"
                ></textarea>
                <div class="mt-4 space-y-2">
                  <div
                    v-for="(option, idx) in q.options"
                    :key="idx"
                    class="p-2 border-l-4 border-gray-200"
                  >
                    <input
                      type="text"
                      :value="option.text"
                      @input="updateOptionField(q, idx, 'text', $event.target.value)"
                      class="w-full text-sm text-gray-700 bg-white p-1 rounded border border-gray-200"
                      placeholder="Option Text"
                    />
                    <textarea
                      :value="option.explanation"
                      @input="updateOptionField(q, idx, 'explanation', $event.target.value)"
                      rows="1"
                      class="w-full text-xs text-gray-500 mt-1 bg-white p-1 rounded border border-gray-200"
                      placeholder="Option Explanation"
                    ></textarea>
                    <textarea
                      :value="option.recommendation"
                      @input="updateOptionField(q, idx, 'recommendation', $event.target.value)"
                      rows="1"
                      class="w-full text-xs text-gray-500 mt-1 bg-white p-1 rounded border border-gray-200"
                      placeholder="Option Recommendation"
                    ></textarea>
                    <div class="flex items-center mt-1">
                      <label class="text-xs mr-2">Score:</label>
                      <input
                        type="number"
                        :value="option.score"
                        @input="updateOptionField(q, idx, 'score', parseFloat($event.target.value))"
                        class="w-16 text-sm text-gray-700 bg-white p-1 rounded border border-gray-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </draggable>
        </div>
        <p v-else class="text-gray-500 text-center py-4">No questions added yet.</p>
      </div>
    </transition>

    <!-- Delete Confirmation Modal -->
    <transition name="fade">
      <div
        v-if="showConfirmModal"
        class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
      >
        <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full relative">
          <h3 class="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h3>
          <p class="text-gray-600 mb-6">
            Are you sure you want to remove this question? This action cannot be undone.
          </p>
          <div class="flex justify-end space-x-4">
            <button
              @click="cancelRemove"
              class="px-6 py-2 cursor-pointer font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="confirmRemove"
              class="px-6 py-2 cursor-pointer font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </transition>
  </section>
</template>

<style scoped>
/* Added for page transition */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.2s ease-out;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}

/* Re-introducing animation styles for the question list */
.question-list-move, /* apply transition to moving elements */
.question-list-enter-active,
.question-list-leave-active {
  transition: all 0.5s ease;
}

.question-list-enter-from,
.question-list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* ensure leaving items are taken out of layout flow so that moving animations can be calculated correctly. */
.question-list-leave-active {
  position: absolute;
  width: 100%;
}

.drag-handle {
  cursor: grab;
}
.sortable-drag {
  cursor: grabbing;
}
.sortable-ghost {
  opacity: 0.4;
}

/* Added for the new delete modal */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
