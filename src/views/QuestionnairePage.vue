<!-- @file src/views/QuestionnairePage.vue
@description This is the main view for taking an assessment. It manages question
navigation, answer selection, and the lifecycle of a draft session. It interacts
with both the assessmentStore (for the active session) and the reportsStore (for
saving/updating the draft in the user's main list).  -->
<script setup>
import { ref, computed, onMounted, onBeforeUnmount, inject, watch, nextTick } from 'vue'
import { useRouter, useRoute, onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import { useReportsStore } from '@/stores/reports' // Import the reports store
import { useAssessmentStore } from '@/stores/assessment' // Import the assessment store
import { useAuthStore } from '@/stores/auth' // Import the auth store
import { useQuestionnairesStore } from '@/stores/questionnaires'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import DraftSaveModal from '@/components/DraftSaveModal.vue'

const router = useRouter()
const route = useRoute()

// --- State Management ---
const questions = ref([])
const answers = ref({})
const currentQuestionIndex = ref(0)
const isLoading = ref(false)
const showSuccessModal = ref(false)
const showSwitchConfirmModal = ref(false)
const showReportNameModal = ref(false)
const showDraftSaveModal = ref(false)
const newReportName = ref('')
const targetAssessmentType = ref('')
const pendingNavigation = ref(null)
const reportNameInput = ref(null) // Template ref for the report name input
const isNavigatingAfterSubmit = ref(false) // Flag to bypass the leave guard on successful submission
const activeTooltip = ref(null) // For tap-to-show tooltips on mobile

// Enhanced UX states
const isSubmitting = ref(false) // Used for the final submission button
const showKeyboardHelp = ref(true) // Set to true to always show help

// Initialize the auth store
const authStore = useAuthStore()
const assessmentStore = useAssessmentStore()
const reportsStore = useReportsStore()
const questionnairesStore = useQuestionnairesStore()

// Get toast functions
const showToast = inject('showToast')

/**
 * A computed property to determine the name for the draft save modal.
 * If continuing an existing draft, it uses the draft's current name.
 * Otherwise, it returns a falsy value, signaling the modal to generate a default name.
 * This avoids passing a new Date object on every render, which can cause Vue reconciliation issues.
 */
const draftNameToSave = computed(() => {
  return assessmentStore.currentDraft?.name || ''
})

// Watch for the report name modal to open and focus the input
watch(showReportNameModal, (newValue) => {
  if (newValue) {
    nextTick(() => {
      reportNameInput.value?.focus()
    })
  }
})

const assessmentType = ref('') // Will be set from route params

// Define styles for each category progress bar for better visual distinction
const categoryStyles = {
  'Website Strength': { color: 'bg-blue-500' },
  'Devices & Network': { color: 'bg-green-500' },
  'Compliance Documentation': { color: 'bg-yellow-500' },
  'Cyber Security Implementations': { color: 'bg-red-500' },
  // New categories for Advanced Cloud Security
  'Access Management': { color: 'bg-indigo-500' },
  'Data Protection': { color: 'bg-purple-500' },
  'Infrastructure Security': { color: 'bg-pink-500' },
  // New categories for GDPR
  'Data Governance': { color: 'bg-teal-500' },
  'Operational Compliance': { color: 'bg-cyan-600' },
  // New categories for GDPR
  'IT Configuration': { color: 'bg-blue-500' },
  'User Preferences': { color: 'bg-green-600' },
}
const defaultCategoryStyle = { color: 'bg-gray-500' }

// This computed property ensures that when `questions.value` is filtered,
// this list is also updated. It's crucial for the progress bar logic.
const questionsWithIndex = computed(() =>
  questions.value.map((q, index) => ({ ...q, originalIndex: index })),
)
// --- Lifecycle Hooks ---
/**
 * Initializes the assessment state based on the route. It either continues
 * an existing draft or starts a new one. This is the single source of truth
 * for component initialization.
 * @param {string | undefined} type The assessment type from the route params.
 */
function initializeAssessment(type) {
  const typeToLoad = type || 'Standard Net Triad Assessment'
  assessmentType.value = typeToLoad

  assessmentStore.loadDraftFromStorage()

  const shouldContinueStoreDraft =
    assessmentStore.hasActiveDraft && assessmentStore.currentDraft.type === typeToLoad

  if (shouldContinueStoreDraft) {
    const draft = assessmentStore.currentDraft
    // Validate that the draft has questions before assigning them.
    if (draft && Array.isArray(draft.questions) && draft.questions.length > 0) {
      // Sort questions by category, then by ID to ensure a consistent order for the progress bar.
      questions.value = draft.questions.sort((a, b) => {
        if (a.category < b.category) return -1
        if (a.category > b.category) return 1
        return a.id - b.id
      })
      answers.value = { ...draft.answers }
      currentQuestionIndex.value = draft.lastQuestionIndex || 0 // Ensure index is valid
    } else {
      // If the draft is corrupt or has no questions, start a new one as a fallback.
      console.warn('Draft data is invalid or empty. Starting a new assessment.')
      resetStateAndStartNewDraft(typeToLoad)
    }
  } else {
    // This path is for starting a brand new assessment.
    resetStateAndStartNewDraft(typeToLoad)
  }
}

/**
 * Handles the logic when the user confirms saving a draft from the modal.
 * This function now uses the intelligent `saveOrUpdateDraft` action.
 */
async function handleDraftSave(draftName) {
  try {
    if (assessmentStore.hasActiveDraft) {
      // 1. Prepare the complete draft object from the active session.
      const draftData = {
        ...assessmentStore.currentDraft,
        // Ensure date exists. If the draft is new, create a date. If it's being
        // continued, its original date will be preserved from the spread.
        date: assessmentStore.currentDraft.date || new Date().toISOString(),
        name: draftName, // Update the name
        // Use lastModified for drafts to track the latest save time for sorting.
        // The original 'date' property should represent the creation date.
        lastModified: new Date().toISOString(),
      }

      // 2. Call the single, intelligent action in the reports store.
      const result = await reportsStore.saveOrUpdateDraft(draftData)

      // 3. Show feedback to the user based on the operation performed.
      if (result.success) {
        showToast(
          result.operation === 'updated'
            ? 'Draft updated successfully'
            : 'Draft saved successfully',
          'success',
        )
      }
      showDraftSaveModal.value = false
    }

    // 4. If navigation was pending, complete it now.
    if (pendingNavigation.value) {
      assessmentStore.clearDraft()
      await router.push(pendingNavigation.value)
      pendingNavigation.value = null
    }
  } catch (error) {
    console.error('Error saving draft:', error)
    showToast(`Failed to save draft: ${error.message}`, 'error')
  }
}

async function handleDraftDiscard() {
  // Clear the draft without saving
  assessmentStore.clearDraft()
  showDraftSaveModal.value = false

  // Proceed with navigation if there was a pending navigation
  if (pendingNavigation.value) {
    await router.push(pendingNavigation.value)
    pendingNavigation.value = null
  }
}

function handleDraftCancel() {
  showDraftSaveModal.value = false
  pendingNavigation.value = null
}

onMounted(() => {
  // Initialize the component state based on the current route.
  initializeAssessment(route.params.type)
  // Add keyboard shortcuts
  window.addEventListener('keydown', handleKeyboardShortcuts)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyboardShortcuts)
})

onBeforeRouteUpdate((to, from) => {
  // This guard only runs when switching between assessment types on the same page.
  // It will NOT run when navigating away, thus preserving the report state.
  if (to.params.type !== from.params.type) {
    initializeAssessment(to.params.type)
  }
})

onBeforeRouteLeave((to) => {
  // If we are navigating after a successful submission, allow it immediately.
  if (isNavigatingAfterSubmit.value) {
    return true
  }

  // This guard is triggered when the user tries to navigate away.
  // We check if there is an active, unsaved draft.
  if (assessmentStore.hasActiveDraft && assessmentStore.isDraftMode) {
    // 1. Perform a final, silent save of the current progress.
    saveDraftProgress()

    // 2. Show the toast notification as requested.
    showToast('Progress saved automatically', 'success', 1500)

    // 3. Show the modal to ask the user if they want to save the draft to their list.
    showDraftSaveModal.value = true

    // 4. Store the intended destination, so we can navigate there after the user makes a choice.
    pendingNavigation.value = to

    // 5. Cancel the current navigation attempt. The user's choice in the modal will trigger the navigation later.
    return false
  }

  // If there's no active draft, allow the navigation to proceed without any prompts.
  return true
})

function saveDraftProgress() {
  if (assessmentStore.isDraftMode) {
    // Use the batch update action for efficiency.
    // This sends the entire state of answers and the current index in one go silently.
    assessmentStore.updateDraft({
      answers: answers.value,
      lastQuestionIndex: currentQuestionIndex.value,
    })
  }
}

// --- Computed Properties ---
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
const totalQuestions = computed(() => questions.value.length)
const isLastQuestion = computed(() => currentQuestionIndex.value === totalQuestions.value - 1)
const isFirstQuestion = computed(() => currentQuestionIndex.value === 0)

const questionsByCategory = computed(() => {
  // Group questions by category using the indexed list
  return questionsWithIndex.value.reduce((acc, question) => {
    // Trim the category name to remove any leading/trailing whitespace,
    // ensuring it correctly matches the keys in the categoryStyles object.
    const categoryKey = question.category.trim()
    if (!acc[categoryKey]) {
      acc[categoryKey] = []
    }
    acc[categoryKey].push(question)
    return acc
  }, {})
})

const categories = computed(() => Object.keys(questionsByCategory.value))

const pageTitle = computed(() => {
  // const baseTitle = 'IT Vulnerability Assessment'
  // const type = route.params.type
  // Construct the title like "IT Vulnerability Assessment (Full Assessment)"
  // return type ? `${baseTitle} (${type})` : baseTitle
  // Use the reactive assessmentType state, which is the single source of truth.
  return assessmentType.value || 'Standard Net Triad Assessment'
})

// --- Progress Bar Logic ---
function getCategoryProgress(categoryName) {
  const categoryQuestions = questionsByCategory.value[categoryName]
  // const categoryStartIndex = questions.value.findIndex((q) => q.category === categoryName)

  // if (currentQuestionIndex.value < categoryStartIndex) return 0

  // const categoryEndIndex = categoryStartIndex + categoryQuestions.length - 1
  // if (currentQuestionIndex.value >= categoryEndIndex) return 100

  // const questionsCompletedInCategory = currentQuestionIndex.value - categoryStartIndex + 1
  // return (questionsCompletedInCategory / categoryQuestions.length) * 100
  if (!categoryQuestions || categoryQuestions.length === 0) return 0

  // Count how many questions in this category have an index less than or equal to the current one.
  const questionsCompleted = categoryQuestions.filter(
    (q) => q.originalIndex <= currentQuestionIndex.value,
  ).length

  return (questionsCompleted / categoryQuestions.length) * 100
}

// --- Methods ---
/**
 * Generates a mock report object based on the user's answers.
 * This function calculates scores for each category and an overall score.
 * @returns {object} A report object with overall, ws, dn, cd, and cs scores.
 */
function generateReportFromAnswers() {
  const allRecommendations = []
  const categoryScores = []
  let totalOverallScore = 0
  let categoryCount = 0

  // Group questions by category first
  const questionsByCategory = questions.value.reduce((acc, q) => {
    if (!acc[q.category]) acc[q.category] = []
    acc[q.category].push(q)
    return acc
  }, {})

  // Process each category
  for (const categoryName in questionsByCategory) {
    const categoryQuestions = questionsByCategory[categoryName]
    const questionCount = categoryQuestions.length
    if (questionCount === 0) continue

    const maxImpactPerQuestion = 100 / questionCount
    let categoryTotalScore = 0

    categoryQuestions.forEach((q) => {
      const selectedOption = answers.value[q.id]
      let questionScore = 0 // Default score if no valid answer
      const impactValue = selectedOption ? parseFloat(selectedOption.score) : 0

      // Check if the parsed impact is a valid number
      if (!isNaN(impactValue)) {
        // Normalize impact from [-2, 2] range to [0, 1] range
        const normalizedImpact = (impactValue + 2) / 4
        questionScore = normalizedImpact * maxImpactPerQuestion

        // If the answer is not perfect, generate a recommendation
        // FIX: Ensure selectedOption is not null before accessing its properties.
        // This handles cases where a question might be unanswered.
        if (impactValue < 2 && selectedOption && selectedOption.recommendation) {
          allRecommendations.push({
            text: selectedOption.recommendation,
            category: q.category,
            // The impact is the potential score gain
            impactScore: Math.round(maxImpactPerQuestion - questionScore),
          })
        }
      }
      categoryTotalScore += questionScore
    })

    const finalCategoryScore = Math.round(categoryTotalScore)
    categoryScores.push({ name: categoryName, score: finalCategoryScore })
    totalOverallScore += finalCategoryScore
    categoryCount++
  }

  // Sort recommendations by the highest impact (most points lost) and take the top 3
  const fullRecommendations = allRecommendations.sort((a, b) => b.impactScore - a.impactScore)

  const overall = categoryCount > 0 ? Math.round(totalOverallScore / categoryCount) : 0

  return { overall, categoryScores, recommendations: fullRecommendations }
}

function resetStateAndStartNewDraft(type) {
  // Filter questions based on the selected assessment type
  // questions.value = questionnairesStore.allQuestions.filter((q) => q.assessment_name === type)
  questions.value = questionnairesStore.allQuestions
    .filter((q) => q.assessment_name === type)
    // Sort by category first, then by ID to ensure a logical progression for the user and progress bar.
    .sort((a, b) => {
      if (a.category < b.category) return -1
      if (a.category > b.category) return 1
      return a.id - b.id // Then sort by ID within the same category
    })
  answers.value = questions.value.reduce((acc, q) => ({ ...acc, [q.id]: null }), {})
  currentQuestionIndex.value = 0
  activeTooltip.value = null // Reset tooltip state
  assessmentStore.startDraft(type, JSON.parse(JSON.stringify(questions.value)))
}

function nextQuestion() {
  if (!isLastQuestion.value) {
    currentQuestionIndex.value++
    activeTooltip.value = null // Close tooltip on navigation
    saveDraftProgress()
  }
}

function prevQuestion() {
  if (!isFirstQuestion.value) {
    currentQuestionIndex.value--
    activeTooltip.value = null // Close tooltip on navigation
    saveDraftProgress()
  }
}

function selectAnswer(option) {
  answers.value[currentQuestion.value.id] = option // option is now an object
  activeTooltip.value = null // Close tooltip on selection
  saveDraftProgress()
  setTimeout(() => {
    if (!isLastQuestion.value) {
      nextQuestion()
    }
  }, 300)
}

function submitAssessment() {
  // First, show the modal to get the report name
  showReportNameModal.value = true
}

async function handleReportNameSubmission() {
  if (!newReportName.value.trim()) {
    // Optionally, show an error message if the name is empty
    alert('Please enter a name for your report.')
    return
  }

  // --- NEW: Validate that all questions have been answered ---
  const unansweredQuestions = questions.value.filter((q) => !answers.value[q.id])

  if (unansweredQuestions.length > 0) {
    showReportNameModal.value = false // Close the name modal first
    showToast(
      `Please answer all questions to generate a report. You have ${unansweredQuestions.length} unanswered question(s).`,
      'error',
      4000,
    )
    // For better UX, navigate the user to the first unanswered question.
    const firstUnansweredIndex = questions.value.findIndex(
      (q) => q.id === unansweredQuestions[0].id,
    )
    if (firstUnansweredIndex !== -1) {
      currentQuestionIndex.value = firstUnansweredIndex
    }
    return // Stop the submission process
  }

  try {
    const reportName = newReportName.value.trim()
    showReportNameModal.value = false

    // Show loading/success modal
    isSubmitting.value = true
    isLoading.value = true
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate processing
    isLoading.value = false
    showSuccessModal.value = true

    // Generate report
    const report = generateReportFromAnswers()

    // If we are in draft mode, it means we were working on an assessment session
    // that has an ID. We attempt to delete any corresponding entry from the
    // main reports list. This is safe because deleteReport only removes items
    // that match the ID and user.
    if (assessmentStore.isDraftMode) {
      reportsStore.deleteReport(assessmentStore.currentDraft.id)
    }

    // Add the new, completed report to the reports store.
    const newCompletedReport = reportsStore.addReport({
      name: reportName,
      date: new Date().toISOString(),
      type: assessmentType.value,
      score: report.overall,
      report: report,
    })

    // After successfully creating the report and deleting the old draft,
    // we should now clear the active assessment session from the store.
    assessmentStore.clearDraft()

    // Set the flag to true right before navigating to bypass the onBeforeRouteLeave guard.
    isNavigatingAfterSubmit.value = true

    // Wait for success modal to be visible, then navigate
    await new Promise((resolve) => setTimeout(resolve, 2000))
    // Navigate to the ReportViewerPage, passing the new report's ID as a parameter.
    // This is a more robust way to ensure the correct report is displayed.
    await router.push({ name: 'ReportViewerPage', params: { reportId: newCompletedReport.id } })
  } catch (error) {
    console.error('Error during report submission or navigation:', error)
    showToast('Failed to finalize report. Please try again.', 'error')
    // Reset state in case of failure
    isNavigatingAfterSubmit.value = false
    isSubmitting.value = false
    showSuccessModal.value = false
  }
}

function toggleTooltip(tooltipId) {
  if (activeTooltip.value === tooltipId) {
    activeTooltip.value = null // Close if already open
  } else {
    activeTooltip.value = tooltipId // Open the new one, closing any other
  }
}

function promptSwitchAssessment(type) {
  if (type !== assessmentType.value) {
    targetAssessmentType.value = type
    showSwitchConfirmModal.value = true
  }
}

function executeSwitchAssessment() {
  showSwitchConfirmModal.value = false
  router.push({ name: 'questionnaire', params: { type: targetAssessmentType.value } })
  console.log('Switching to:', targetAssessmentType.value)
}

function cancelSwitch() {
  showSwitchConfirmModal.value = false
}

// --- Keyboard Shortcuts ---
function handleKeyboardShortcuts(event) {
  // Defensive check: If the current question isn't loaded yet, do nothing.
  // This prevents errors if a keydown event fires before the component is fully initialized.
  if (!currentQuestion.value) {
    return
  }

  // Only handle shortcuts if no modal is open
  if (
    showDraftSaveModal.value ||
    showReportNameModal.value ||
    showSuccessModal.value ||
    showSwitchConfirmModal.value
  ) {
    return
  }

  switch (event.key) {
    case 'ArrowLeft':
      if (!isFirstQuestion.value) {
        event.preventDefault()
        prevQuestion()
      }
      break
    case 'ArrowRight':
    case ' ':
      if (!isLastQuestion.value && answers.value[currentQuestion.value.id]) {
        event.preventDefault()
        nextQuestion()
      }
      break
    case 'Enter':
      if (isLastQuestion.value && answers.value[currentQuestion.value.id] && !isSubmitting.value) {
        event.preventDefault()
        submitAssessment()
      }
      break
    case '1':
      if (currentQuestion.value.options.length >= parseInt(event.key)) {
        event.preventDefault()
        const optionIndex = parseInt(event.key) - 1
        selectAnswer(currentQuestion.value.options[optionIndex])
      }
      break
    case '2':
      if (currentQuestion.value.options.length >= parseInt(event.key)) {
        event.preventDefault()
        const optionIndex = parseInt(event.key) - 1
        selectAnswer(currentQuestion.value.options[optionIndex])
      }
      break
    case '3':
      if (currentQuestion.value.options.length >= parseInt(event.key)) {
        event.preventDefault()
        const optionIndex = parseInt(event.key) - 1
        selectAnswer(currentQuestion.value.options[optionIndex])
      }
      break
    case '4':
      if (currentQuestion.value.options.length >= parseInt(event.key)) {
        event.preventDefault()
        const optionIndex = parseInt(event.key) - 1
        selectAnswer(currentQuestion.value.options[optionIndex])
      }
      break
    case '5':
      if (currentQuestion.value.options.length >= parseInt(event.key)) {
        event.preventDefault()
        const optionIndex = parseInt(event.key) - 1
        selectAnswer(currentQuestion.value.options[optionIndex])
      }
      break
  }
}
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-100">
    <!-- The unified header is used here, with 'New Assessment' hidden -->
    <AppHeader
      :user-name="authStore.userName"
      :show-new-assessment="false"
      :assessment-type="assessmentType"
      :show-assessment-type-menu="true"
      @change-assessment="promptSwitchAssessment"
    />

    <main class="flex-grow flex items-center justify-center p-4">
      <div class="w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-6 md:p-10 my-8">
        <!-- Header Section -->
        <div class="text-center mb-8">
          <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 break-words">
            {{ pageTitle }}
          </h1>
          <p class="text-gray-500 mt-2">
            Question {{ currentQuestionIndex + 1 }} of {{ totalQuestions }}
          </p>
          <!-- Draft indicator -->
          <div v-if="assessmentStore.isDraftMode" class="mt-2">
            <span
              class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              Draft - {{ assessmentStore.draftCompletionPercentage }}% Complete
            </span>
          </div>

          <!-- Keyboard shortcuts help -->
          <div class="mt-2">
            <div
              v-if="showKeyboardHelp"
              class="hidden md:block mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-600"
            >
              <p class="font-medium mb-1">Keyboard shortcuts:</p>
              <ul class="space-y-1">
                <li>
                  <kbd class="px-1 py-0.5 bg-gray-200 rounded text-xs">←</kbd> Previous question
                </li>
                <li>
                  <kbd class="px-1 py-0.5 bg-gray-200 rounded text-xs">→</kbd> or
                  <kbd class="px-1 py-0.5 bg-gray-200 rounded text-xs">Space</kbd> Next question
                </li>
                <li>
                  <kbd class="px-1 py-0.5 bg-gray-200 rounded text-xs">1-5</kbd> Select answer
                  option
                </li>
                <li>
                  <kbd class="px-1 py-0.5 bg-gray-200 rounded text-xs">Enter</kbd> Submit assessment
                  (on last question)
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Segmented Progress Bar -->
        <div class="mb-10">
          <div class="flex w-full h-3 rounded-full overflow-hidden bg-gray-200">
            <div
              v-for="category in categories"
              :key="category"
              class="h-full"
              :style="{
                width: (questionsByCategory[category].length / totalQuestions) * 100 + '%',
              }"
            >
              <div
                class="h-full transition-all duration-500 ease-out"
                :class="(categoryStyles[category] || defaultCategoryStyle).color"
                :style="{ width: `${getCategoryProgress(category)}%` }"
              ></div>
            </div>
          </div>
          <div class="flex justify-between mt-2 text-xs font-semibold text-gray-500">
            <span
              v-for="category in categories"
              :key="`label-${category}`"
              class="flex-1 text-center px-1"
            >
              {{ category }}
            </span>
          </div>
        </div>

        <!-- Questionnaire Container -->
        <div class="relative">
          <transition name="fade" mode="out-in">
            <div :key="currentQuestion.id" v-if="currentQuestion">
              <div class="flex items-start justify-between gap-4 mb-6">
                <h2 class="text-xl md:text-2xl font-semibold text-gray-700 leading-tight">
                  {{ currentQuestion.text }}
                </h2>
                <div class="relative group flex-shrink-0">
                  <button
                    type="button"
                    @click.stop="toggleTooltip('question')"
                    @touchend.prevent="toggleTooltip('question')"
                    class="focus:outline-none"
                    aria-label="Show question explanation"
                  >
                    <svg
                      class="w-6 h-6 text-gray-400 cursor-pointer group-hover:text-blue-600 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                  </button>
                  <div
                    class="absolute bottom-full right-0 mb-2 w-64 sm:w-72 p-3 text-sm text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-95 transition-opacity duration-300 pointer-events-none z-10"
                    role="tooltip"
                    :class="{ 'opacity-95': activeTooltip === 'question' }"
                  >
                    {{ currentQuestion.explanation }}
                  </div>
                </div>
              </div>
              <div class="space-y-4">
                <button
                  v-for="(option, index) in currentQuestion.options"
                  :key="option.text"
                  @click="selectAnswer(option)"
                  @keydown.enter="selectAnswer(option)"
                  @keydown.space.prevent="selectAnswer(option)"
                  :aria-label="`Select option ${index + 1}: ${option.text}`"
                  :aria-describedby="`explanation-${currentQuestion.id}-${index}`"
                  role="radio"
                  :aria-checked="answers[currentQuestion.id]?.text === option.text"
                  tabindex="0"
                  class="w-full cursor-pointer text-left p-4 border-2 rounded-lg text-gray-700 transition-all duration-200 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  :class="{
                    'bg-blue-100 border-blue-500 shadow-md':
                      answers[currentQuestion.id]?.text === option.text,
                    'hover:bg-gray-100 hover:border-gray-400 border-gray-300':
                      answers[currentQuestion.id]?.text !== option.text,
                  }"
                >
                  <span class="flex-1 mr-4">{{ option.text }}</span>
                  <div class="relative group flex-shrink-0">
                    <button
                      type="button"
                      @click.stop="toggleTooltip(`option-${index}`)"
                      @touchend.prevent="toggleTooltip(`option-${index}`)"
                      class="focus:outline-none"
                      :aria-label="`Show explanation for option ${index + 1}`"
                    >
                      <svg
                        class="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                    </button>
                    <div
                      :id="`explanation-${currentQuestion.id}-${index}`"
                      class="absolute bottom-full right-0 mb-2 w-64 sm:w-72 p-3 text-sm text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-95 transition-opacity duration-300 pointer-events-none z-10"
                      role="tooltip"
                      :class="{ 'opacity-95': activeTooltip === `option-${index}` }"
                    >
                      {{ option.explanation }}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </transition>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex justify-between items-center mt-8 pt-6 border-t">
          <button
            @click="prevQuestion"
            @keydown.enter="prevQuestion"
            @keydown.space.prevent="prevQuestion"
            :disabled="isFirstQuestion"
            :aria-label="
              isFirstQuestion
                ? 'Cannot go back, this is the first question'
                : 'Go to previous question'
            "
            class="px-4 sm:px-6 py-2 text-sm sm:text-base cursor-pointer font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <svg
              class="w-4 h-4 mr-2 inline"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
            <span class="hidden sm:inline">Previous</span>
            <span class="sm:hidden">Prev</span>
          </button>

          <button
            v-if="!isLastQuestion"
            @click="nextQuestion"
            @keydown.enter="nextQuestion"
            @keydown.space.prevent="nextQuestion"
            :disabled="!currentQuestion || !answers[currentQuestion.id]"
            :aria-label="
              !currentQuestion || !answers[currentQuestion.id]
                ? 'Please select an answer to continue'
                : 'Go to next question'
            "
            class="px-4 sm:px-6 py-2 text-sm sm:text-base cursor-pointer font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Next
            <svg
              class="w-4 h-4 ml-2 inline"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </button>

          <button
            v-if="isLastQuestion"
            @click="submitAssessment"
            @keydown.enter="submitAssessment"
            @keydown.space.prevent="submitAssessment"
            :disabled="isSubmitting || !currentQuestion || !answers[currentQuestion.id]"
            :aria-label="isSubmitting ? 'Submitting assessment...' : 'Submit assessment'"
            class="px-4 sm:px-6 py-2 text-sm sm:text-base cursor-pointer font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <svg
              v-if="isSubmitting"
              class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
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
            <svg
              v-else
              class="w-4 h-4 mr-2 inline"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
            <span v-if="isSubmitting">Submitting...</span>
            <template v-else>
              <span class="hidden sm:inline">Submit Assessment</span>
              <span class="sm:hidden">Submit</span>
            </template>
          </button>
        </div>
      </div>
    </main>

    <!-- Success Modal -->
    <transition name="fade">
      <div
        v-if="showSuccessModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <div class="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full text-center">
          <h3 class="text-2xl font-bold text-green-600 mb-4">Assessment Complete!</h3>
          <p class="text-gray-700 mb-6">
            Your report is being generated. Redirecting to your report...
          </p>
        </div>
      </div>
    </transition>

    <!-- Report Name Modal -->
    <transition name="fade">
      <div
        v-if="showReportNameModal"
        class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
      >
        <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full relative">
          <h3 class="text-xl font-bold text-gray-800 mb-4">Name Your Report</h3>
          <p class="text-gray-600 mb-6">
            Please provide a name for this assessment report to easily identify it later.
          </p>
          <form @submit.prevent="handleReportNameSubmission">
            <input
              type="text"
              v-model="newReportName"
              placeholder="e.g., Q2 Security Audit"
              maxlength="30"
              class="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 mb-6"
              ref="reportNameInput"
              required
            />
            <div class="flex justify-end space-x-4">
              <button
                type="button"
                @click="showReportNameModal = false"
                class="px-6 py-2 cursor-pointer font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-6 py-2 cursor-pointer font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
              >
                Generate Report
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Switch Confirmation Modal -->
    <transition name="fade">
      <div
        v-if="showSwitchConfirmModal"
        class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
      >
        <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full relative">
          <button
            @click="cancelSwitch"
            class="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              class="w-6 h-6"
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
          <h3 class="text-xl font-bold text-gray-800 mb-4">Switch Assessment?</h3>
          <p class="text-gray-600 mb-6">
            You are about to switch to a different assessment. Your current progress will be lost.
            Are you sure?
          </p>
          <div class="flex justify-end space-x-4">
            <button
              @click="cancelSwitch"
              class="px-6 py-2 cursor-pointer font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="executeSwitchAssessment"
              class="px-6 py-2 cursor-pointer font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
            >
              Yes, Switch
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Draft Save Modal -->
    <DraftSaveModal
      :show="showDraftSaveModal"
      :draft-name="draftNameToSave"
      @save="handleDraftSave"
      @discard="handleDraftDiscard"
      @cancel="handleDraftCancel"
    />

    <AppFooter />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #a8a8a8;
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #888;
}
</style>
