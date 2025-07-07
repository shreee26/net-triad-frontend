<!-- src/views/EditQuestionnairePage.vue -->
<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuestionnairesStore } from '@/stores/questionnaires'
import QuestionList from '@/components/admin/QuestionList.vue'

// Initialize the route and router for navigation and parameter access
const route = useRoute()
const router = useRouter()

const questionnairesStore = useQuestionnairesStore()

// Reactive state for the questionnaire being edited
const questionnaire = ref({
  id: null,
  name: '',
  status: 'Draft',
})
const questions = ref([]) // Separate ref for the list of questions

// Reactive state for managing the new question input form
const newQuestion = ref({
  category: '',
  text: '',
  explanation: '',
  options: [
    { text: '', score: 0, explanation: '' },
    { text: '', score: 0, explanation: '' },
  ],
})

// Reactive state for displaying messages to the user (e.g., success, error)
const message = ref({ text: '', type: '' }) // type: 'success' or 'error'

/**
 * Loads a questionnaire based on the ID from the route payload.
 * If 'new', initializes an empty questionnaire.
 * If an ID exists, attempts to load mock data.
 */
function loadQuestionnaire() {
  const qId = route.params.questionnaireId
  if (qId && qId !== 'new') {
    const foundQ = questionnairesStore.getQuestionnaireById(qId)
    if (foundQ) {
      // Deep clone to prevent direct mutation of the store's state
      questionnaire.value = JSON.parse(JSON.stringify(foundQ))
      questions.value = JSON.parse(
        JSON.stringify(questionnairesStore.getQuestionsForAssessment(foundQ.name)),
      )
      setMessage('Questionnaire loaded.', 'success')
    } else {
      setMessage(`Questionnaire with ID ${qId} not found.`, 'error')
      router.push('/admin/dashboard')
    }
  } else {
    // Initialize for a new questionnaire
    questionnaire.value = {
      id: null,
      name: '',
      status: 'Draft',
    }
    questions.value = [] // Clear questions for a new questionnaire
    setMessage('Creating new questionnaire.', 'info')
  }
}

/**
 * Adds a new empty option field to the new question form.
 */
function addOption() {
  if (newQuestion.value.options.length < 5) {
    newQuestion.value.options.push({ text: '', score: 0, explanation: '' })
  }
}

/**
 * Removes an option field from the new question form at a specific index.
 * @param {number} index The index of the option to remove.
 */
function removeOption(index) {
  if (newQuestion.value.options.length > 1) {
    // Ensure at least one option remains
    newQuestion.value.options.splice(index, 1)
  }
}

/**
 * Adds the currently defined new question to the questionnaire.
 * Validates that category, text, and at least two non-empty options exist.
 */
function addQuestion() {
  const { category, text, explanation, options } = newQuestion.value
  const validOptions = options.filter((opt) => opt.text.trim() !== '')

  if (!category.trim() || !text.trim() || !explanation.trim() || validOptions.length < 2) {
    setMessage(
      'Please fill in category, text, explanation, and provide at least two valid options.',
      'error',
    )
    return
  }

  const newQ = {
    id: questions.value.length > 0 ? Math.max(...questions.value.map((q) => q.id)) + 1 : 1,
    assessment_name: questionnaire.value.name,
    category: category.trim(),
    text: text.trim(),
    explanation: explanation.trim(),
    options: validOptions.map((opt) => ({
      ...opt,
      score: Number(opt.score), // Ensure score is a number
    })),
  }
  questions.value.push(newQ)
  resetNewQuestionForm()
  setMessage('Question added successfully!', 'success')
}

/**
 * Removes a question from the questionnaire based on its ID.
 * @param {number} questionId The ID of the question to remove.
 */
function removeQuestion(questionId) {
  questions.value = questions.value.filter((q) => q.id !== questionId)
  setMessage('Question removed.', 'info')
}

/**
 * Resets the new question form fields to their initial empty state.
 */
function resetNewQuestionForm() {
  newQuestion.value = {
    category: '',
    text: '',
    explanation: '',
    options: [
      { text: '', score: 0, explanation: '' },
      { text: '', score: 0, explanation: '' },
    ],
  }
}

/**
 * Handles saving the questionnaire.
 * In a real application, this would send data to the backend.
 */
async function saveQuestionnaire() {
  if (!questionnaire.value.name.trim()) {
    setMessage('Questionnaire name cannot be empty.', 'error')
    return
  }
  if (questions.value.length === 0) {
    setMessage('Please add at least one question to the questionnaire.', 'error')
    return
  }

  // Simulate API call
  const payload = {
    ...questionnaire.value,
    questions: questions.value,
  }
  console.log('Saving questionnaire:', JSON.parse(JSON.stringify(payload)))
  setMessage('Saving questionnaire...', 'info')

  try {
    await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate network delay

    if (questionnaire.value.id) {
      // Update existing
      questionnairesStore.updateQuestionnaire(payload)
      setMessage('Questionnaire updated successfully!', 'success')
    } else {
      // Add new
      const result = questionnairesStore.addQuestionnaire(payload)
      questionnaire.value.id = result.newQuestionnaire.id // Update local ID
      setMessage('Questionnaire created successfully!', 'success')
    }
  } catch (error) {
    console.error('Error saving questionnaire:', error)
    setMessage('Failed to save questionnaire.', 'error')
  }
}

/**
 * Sets a message to be displayed to the user, with a timeout to clear it.
 * @param {string} text The message text.
 * @param {string} type The type of message ('success', 'error', 'info').
 */
function setMessage(text, type) {
  message.value = { text, type }
  setTimeout(() => {
    message.value = { text: '', type: '' } // Clear message after 3 seconds
  }, 3000)
}

/**
 * Navigates back to the admin dashboard.
 */
function backToDashboard() {
  router.push('/admin/dashboard')
}

// Load questionnaire data when the component mounts
onMounted(loadQuestionnaire)

// Watch for changes in route parameters (e.g., if navigating from 'new' to an existing ID)
watch(
  () => route.params.questionnaireId,
  () => {
    loadQuestionnaire()
  },
)
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col items-center p-6 font-sans">
    <div class="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8 md:p-10 my-8">
      <header class="mb-8 text-center">
        <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
          {{ questionnaire.id ? 'Edit Questionnaire' : 'Create New Questionnaire' }}
        </h1>
        <p class="text-md text-gray-600">Define and manage your assessment questions.</p>
      </header>

      <!-- Message Display -->
      <div
        v-if="message.text"
        :class="[
          'p-4 mb-6 rounded-lg text-white font-medium',
          message.type === 'success'
            ? 'bg-green-500'
            : message.type === 'error'
              ? 'bg-red-500'
              : 'bg-blue-500',
        ]"
      >
        {{ message.text }}
      </div>

      <!-- Questionnaire Details -->
      <section class="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Questionnaire Details</h2>
        <div class="mb-4">
          <label for="questionnaire-name" class="block text-sm font-medium text-gray-700 mb-1"
            >Questionnaire Name</label
          >
          <input
            type="text"
            id="questionnaire-name"
            v-model="questionnaire.name"
            class="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Annual IT Security Audit"
          />
        </div>
        <div class="mb-4">
          <label for="questionnaire-status" class="block text-sm font-medium text-gray-700 mb-1"
            >Status</label
          >
          <select
            id="questionnaire-status"
            v-model="questionnaire.status"
            class="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Draft">Draft</option>
            <option value="Active">Active</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </section>

      <!-- Current Questions List -->
      <QuestionList :questions="questions" @remove-question="removeQuestion" />

      <!-- Add New Question Form -->
      <section class="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h2 class="text-2xl font-semibold text-blue-800 mb-4">Add New Question</h2>
        <div class="mb-4">
          <label for="new-question-category" class="block text-sm font-medium text-gray-700 mb-1"
            >Category</label
          >
          <input
            type="text"
            id="new-question-category"
            v-model="newQuestion.category"
            class="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Website Strength"
          />
        </div>
        <div class="mb-4">
          <label for="new-question-text" class="block text-sm font-medium text-gray-700 mb-1"
            >Question Text</label
          >
          <textarea
            id="new-question-text"
            v-model="newQuestion.text"
            rows="3"
            class="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 mb-2"
            placeholder="e.g., Is your website traffic encrypted using a valid SSL/TLS certificate?"
          ></textarea>
          <textarea
            id="new-question-explanation"
            v-model="newQuestion.explanation"
            rows="2"
            class="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Question Explanation"
          ></textarea>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Options (at least 2)</label>
          <div
            v-for="(option, index) in newQuestion.options"
            :key="index"
            class="flex items-start gap-2 mb-2 p-2 border-l-4 border-gray-200"
          >
            <div class="flex-grow">
              <input
                type="text"
                v-model="option.text"
                class="block w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                :placeholder="`Option ${index + 1} Text`"
              />
              <textarea
                v-model="option.explanation"
                rows="1"
                class="block w-full mt-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-xs"
                placeholder="Option Explanation"
              ></textarea>
            </div>
            <div class="flex-shrink-0">
              <label class="block text-xs text-gray-600">Score</label>
              <input
                type="number"
                v-model.number="option.score"
                class="w-20 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              v-if="newQuestion.options.length > 1"
              @click="removeOption(index)"
              class="p-2 cursor-pointer rounded-full text-gray-500 hover:bg-gray-200 transition-colors self-center"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
          <button
            @click="addOption"
            :disabled="newQuestion.options.length >= 5"
            class="mt-2 px-4 py-2 cursor-pointer bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add Option
          </button>
        </div>
        <button
          @click="addQuestion"
          class="w-full cursor-pointer py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors"
        >
          Add Question to Questionnaire
        </button>
      </section>

      <!-- Action Buttons -->
      <div class="flex justify-between mt-8">
        <button
          @click="backToDashboard"
          class="px-6 py-3 cursor-pointer bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
        >
          Back to Dashboard
        </button>
        <button
          @click="saveQuestionnaire"
          class="px-8 py-3 cursor-pointer bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          Save Questionnaire
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar for better aesthetics */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f0f0f0; /* Light gray track */
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #a0a0a0; /* Darker gray thumb */
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #888; /* Even darker on hover */
}
</style>
