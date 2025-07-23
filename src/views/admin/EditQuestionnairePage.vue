<!-- src/views/EditQuestionnairePage.vue -->
<script setup lang="ts">
import { ref, watch, computed, inject, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuestionnairesStore } from '@/stores/questionnaires'
import QuestionList from '@/components/admin/QuestionList.vue'
import AppFooter from '@/components/AppFooter.vue'
import Papa from 'papaparse'
import ExcelJS from 'exceljs'

// Initialize the route and router for navigation and parameter access
const route = useRoute()
const router = useRouter()

// --- Import State ---
const fileInput = ref<HTMLInputElement | null>(null)
const isParsing = ref(false)
const showImportModal = ref(false)
const importedQuestions = ref<any[]>([])
const importMode = ref<'all' | 'sequence' | null>(null)
const currentImportIndex = ref(0)

// --- Landscape Mode State ---
const isMobile = ref(false)
const isPortrait = ref(false)
const showLandscapeSuggestion = ref(false)
const isLockedLandscape = ref(false)
const showRotateTooltip = ref(false)
let tooltipTimer: number | null = null

// --- Undo/Redo State for Question Ordering ---
const history = ref<any[]>([])
const redoStack = ref<any[]>([])
const MAX_HISTORY_SIZE = 20

// --- End Import State ---

// Define the type for the showToast function to help TypeScript understand its signature.
type ShowToastFn = (message: string, type?: string, duration?: number) => void

// Inject the global toast function and cast its type to resolve the "not callable" error.
const showToast = inject('showToast') as ShowToastFn

const questionnairesStore = useQuestionnairesStore()

const mainContent = ref(null)

// Reactive state for the questionnaire being edited
const questionnaire = ref({
  id: null,
  name: '',
  status: 'Draft',
})
const questions = ref([]) // Separate ref for the list of questions

// Reactive state for managing the new question input form
const newQuestion = ref({
  id: 1,
  category: '',
  text: '',
  explanation: '',
  options: [
    { text: '', score: 0, explanation: '', recommendation: '' },
    { text: '', score: 0, explanation: '', recommendation: '' },
  ],
})

/**
 * Computes the next available question ID.
 */
const nextQuestionId = computed(() => {
  if (!questions.value || questions.value.length === 0) return 1
  const maxId = Math.max(...questions.value.map((q) => Number(q.id) || 0))
  return maxId + 1
})

// When the component loads or questions change, set the default ID for the new question form
watch(nextQuestionId, (id) => (newQuestion.value.id = id), { immediate: true })

const importProgress = computed(() => {
  if (importMode.value !== 'sequence' || importedQuestions.value.length === 0) {
    return 0
  }
  // Progress is based on how many have been added
  return (currentImportIndex.value / importedQuestions.value.length) * 100
})

/**
 * Computes a unique list of categories from the current questions.
 * This is used to provide suggestions for the category input fields.
 */
const uniqueCategories = computed(() => {
  const allCategories = questions.value.map((q) => q.category.trim())
  // return [...new Set(allCategories)].filter((c) => c) // Return unique, non-empty categories
  return Array.from(new Set(allCategories)).filter((c) => c) // Return unique, non-empty categories
})

/**
 * Loads a questionnaire based on the ID from the route payload.
 * If 'new', initializes an empty questionnaire.
 * If an ID exists, attempts to load mock data.
 */
function loadQuestionnaire(qId) {
  if (qId && qId !== 'new') {
    const foundQ = questionnairesStore.getQuestionnaireById(qId)
    if (foundQ) {
      // Deep clone to prevent direct mutation of the store's state
      questionnaire.value = JSON.parse(JSON.stringify(foundQ))
      const loadedQuestionsFromStore = JSON.parse(
        JSON.stringify(questionnairesStore.getQuestionsForAssessment(foundQ.name)),
      )

      // Sort by original store ID to maintain a consistent order, then re-number for the UI.
      questions.value = loadedQuestionsFromStore
        .sort((a, b) => a.id - b.id)
        .map((q, index) => ({
          ...q,
          id: index + 1, // Re-number the questions to start from 1 for this specific questionnaire
          uuid: `q-${Date.now()}-${Math.random()}`, // Add a stable, unique key for rendering
        }))
      // console.log(
      //   '[EditQuestionnairePage] Questions loaded and mapped with UUIDs:',
      //   JSON.parse(JSON.stringify(questions.value)),
      // )
      showToast('Questionnaire loaded.', 'success')
    } else {
      showToast(`Questionnaire with ID ${qId} not found.`, 'error')
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
    showToast('Creating new questionnaire.', 'info')
  }
}

/**
 * Adds a new empty option field to the new question form.
 */
function addOption() {
  if (newQuestion.value.options.length < 5) {
    newQuestion.value.options.push({ text: '', score: 0, explanation: '', recommendation: '' })
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
  const { id, category, text, explanation, options } = newQuestion.value
  const validOptions = options.filter((opt) => opt.text.trim() !== '')

  if (!category.trim() || !text.trim() || !explanation.trim() || validOptions.length < 2) {
    setTimeout(
      () =>
        showToast(
          'Please fill in category, text, explanation, and provide at least two valid options.',
          'error',
          2000,
        ),
      500,
    )
    return
  }

  const newId = Number(id)
  if (!newId || newId <= 0) {
    setTimeout(
      () => showToast('Please provide a valid, positive question number.', 'error', 2000),
      500,
    )
    return
  }

  const existingQuestion = questions.value.find((q) => q.id === newId)
  if (existingQuestion) {
    const proceed = confirm(
      `Question number ${newId} is already in use. Do you want to insert this question here and shift subsequent questions?`,
    )
    if (!proceed) {
      showToast('Operation cancelled.', 'info')
      return
    }
    // Shift IDs of subsequent questions
    questions.value.forEach((q) => {
      if (q.id >= newId) {
        q.id++
      }
    })
  }

  const newQ = {
    uuid: `q-${Date.now()}-${Math.random()}`, // A new, stable, unique key
    id: newId,
    assessment_name: questionnaire.value.name,
    category: category.trim(),
    text: text.trim(),
    explanation: explanation.trim(),
    options: validOptions.map((opt) => ({
      ...opt,
      recommendation: opt.recommendation || '', // Ensure recommendation is a string
      score: Number(opt.score), // Ensure score is a number
    })),
  }
  questions.value.push(newQ)
  questions.value.sort((a, b) => a.id - b.id) // Keep the list sorted
  showToast('Question added successfully!', 'success')

  // --- NEW LOGIC FOR SEQUENCE IMPORT ---
  if (importMode.value === 'sequence') {
    currentImportIndex.value++
    if (currentImportIndex.value < importedQuestions.value.length) {
      // There are more questions to import, populate the form with the next one
      populateFormWithImportedQuestion(currentImportIndex.value)
    } else {
      // All questions have been imported
      showToast('All questions from the file have been added!', 'success')
      cancelImport() // Clear import state and reset the form
    }
  } else {
    // If not in sequence mode, just reset the form as usual
    resetNewQuestionForm()
  }
}

/**
 * Handles the updated order of questions from the child component.
 * It re-numbers all questions based on their new position in the array.
 * @param {Array} newQuestionOrder The newly ordered array of questions.
 */
function updateQuestionOrder(newQuestionOrder) {
  // Save the current state to history before applying the change.
  history.value.push(JSON.parse(JSON.stringify(questions.value)))
  // Clear the redo stack as a new action has been taken.
  redoStack.value = []
  // Keep history size manageable.
  if (history.value.length > MAX_HISTORY_SIZE) {
    history.value.shift()
  }

  const renumberedQuestions = newQuestionOrder.map((q, index) => ({
    ...q,
    id: index + 1, // Re-assign the ID based on the new index (1-based)
  }))
  questions.value = renumberedQuestions
  // Provide subtle feedback that the order was saved.
  showToast('Question order updated.', 'success', 1500)
}

// --- Import Methods ---

/**
 * Triggers the hidden file input click event.
 */
function triggerFileInput() {
  fileInput.value?.click()
}

/**
 * Handles the file selection, initiates parsing and validation.
 */
async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  isParsing.value = true
  showToast('Parsing file...', 'info')

  try {
    const fileData = await readFile(file)
    const parsed = await parseData(fileData, file.type)
    const { valid, questions: validatedQuestions, error } = validateImportedData(parsed)

    if (!valid) {
      throw new Error(error)
    }

    importedQuestions.value = validatedQuestions
    if (questionnaire.value.id === null) {
      // New questionnaire mode: set name from filename
      const fileName = file.name.split('.').slice(0, -1).join('.')
      questionnaire.value.name = fileName // Use the filename directly without conversion
    }
    showToast('File parsed successfully! Choose an import mode.', 'success')
    showImportModal.value = true
  } catch (err: any) {
    showToast(`Import failed: ${err.message}`, 'error', 5000)
    cancelImport()
  } finally {
    isParsing.value = false
    if (fileInput.value) fileInput.value.value = '' // Reset input
  }
}

/**
 * Reads a file and returns its content.
 */
function readFile(file: File): Promise<string | ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result!)
    reader.onerror = (err) => reject(err)
    if (file.type.includes('sheet') || file.type.includes('excel')) {
      reader.readAsArrayBuffer(file)
    } else {
      reader.readAsText(file)
    }
  })
}

/**
 * Parses data based on file type using appropriate libraries.
 */
async function parseData(data: string | ArrayBuffer, type: string): Promise<any[]> {
  if (type === 'application/json') {
    return JSON.parse(data as string)
  }
  if (type === 'text/csv') {
    const result = Papa.parse(data as string, { header: true, skipEmptyLines: true })
    if (result.errors.length) {
      const firstError = result.errors[0]
      // Papaparse row is 0-indexed, so we add 2 to get the actual line number (1 for 0-index, 1 for header).
      throw new Error(`CSV parsing error on line ${firstError.row + 2}: ${firstError.message}`)
    }
    return result.data as any[]
  }
  if (
    type.includes('sheet') ||
    type.includes('excel') ||
    type.includes('openxmlformats-officedocument')
  ) {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(data as ArrayBuffer)
    const worksheet = workbook.worksheets[0]
    if (!worksheet) throw new Error('No worksheet found in the Excel file.')

    const headers: string[] = []
    const headerRow = worksheet.getRow(1)
    headerRow.eachCell({ includeEmpty: false }, (cell) =>
      headers.push(cell.value?.toString() || ''),
    )
    if (headers.length === 0) throw new Error('Could not find a header row in the Excel file.')

    const jsonData: any[] = []
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const rowData = {}
        let hasData = false
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const header = headers[colNumber - 1]
          if (header) {
            const cellValue = cell.value
            if (cellValue !== null && cellValue !== undefined) {
              rowData[header] = cellValue
              hasData = true
            }
          }
        })
        if (hasData) jsonData.push(rowData)
      }
    })
    return jsonData
  }
  throw new Error('Unsupported file type.')
}

/**
 * Validates the structure of the imported data.
 */
function validateImportedData(data: any[]): {
  valid: boolean
  questions: any[]
  error?: string
} {
  if (!Array.isArray(data) || data.length === 0) {
    return { valid: false, questions: [], error: 'File is empty or not a valid array.' }
  }

  // Group rows by a unique question identifier.
  const questionsMap = new Map<string, { questionData: any; options: any[] }>()

  for (const [index, row] of data.entries()) {
    // For user-facing error messages (1-based index + header row)
    const rowNum = index + 2
    const questionId = row.question_id
    if (!questionId) {
      return {
        valid: false,
        questions: [],
        error: `Row ${rowNum}: Missing required "question_id" field.`,
      }
    }

    // Check for other required fields in each row
    const missingFields = []
    if (!row.category) missingFields.push('category')
    if (!row.question_text) missingFields.push('question_text')
    if (!row.option_text) missingFields.push('option_text')
    if (row.option_score === undefined || row.option_score === null || row.option_score === '') {
      missingFields.push('option_score')
    }

    if (missingFields.length > 0) {
      return {
        valid: false,
        questions: [],
        error: `Row ${rowNum}: Missing required field(s): ${missingFields.join(', ')}.`,
      }
    }

    const questionKey = questionId.toString()

    if (!questionsMap.has(questionKey)) {
      questionsMap.set(questionKey, {
        questionData: {
          category: row.category,
          text: row.question_text,
          explanation: row.question_explanation || '',
        },
        options: [],
      })
    }

    const score = parseFloat(row.option_score)
    if (isNaN(score)) {
      return {
        valid: false,
        questions: [],
        error: `Row ${rowNum}: Invalid value for "option_score". Expected a number, but got "${row.option_score}".`,
      }
    }

    questionsMap.get(questionKey)!.options.push({
      text: row.option_text,
      explanation: row.option_explanation || '',
      recommendation: row.option_recommendation || '', // Add recommendation field
      score: score,
    })
  }

  // Convert the map to the final array of question objects
  const finalQuestions = Array.from(questionsMap.values()).map((entry) => ({
    ...entry.questionData,
    options: entry.options,
  }))

  // Final validation to ensure each question has at least one option
  for (const q of finalQuestions) {
    if (q.options.length === 0) {
      return {
        valid: false,
        questions: [],
        error: `Question "${q.text}" was found but has no valid options.`,
      }
    }
  }

  return { valid: true, questions: finalQuestions }
}

/**
 * Starts the import process based on the selected mode.
 */
function startImport(mode: 'all' | 'sequence') {
  showImportModal.value = false
  if (mode === 'all') {
    const newQuestions = importedQuestions.value.map((q) => ({
      ...q,
      uuid: `q-${Date.now()}-${Math.random()}`,
      assessment_name: questionnaire.value.name,
    }))
    const combined = [...questions.value, ...newQuestions]
    questions.value = combined.map((q, index) => ({ ...q, id: index + 1 }))
    showToast(`${importedQuestions.value.length} questions imported successfully.`, 'success')
    cancelImport()
  } else {
    importMode.value = 'sequence'
    currentImportIndex.value = 0
    populateFormWithImportedQuestion(0)
  }
}

/**
 * Populates the "Add New Question" form with data from an imported question.
 */
function populateFormWithImportedQuestion(index: number) {
  const q = importedQuestions.value[index]
  if (!q) return

  newQuestion.value = {
    id: nextQuestionId.value, // Always suggest the next available ID
    category: q.category || '',
    text: q.text || '',
    explanation: q.explanation || '',
    options: q.options || [{ text: '', score: 0, explanation: '', recommendation: '' }],
  }
}

/**
 * Resets all import-related state variables and the new question form.
 */
function cancelImport() {
  importedQuestions.value = []
  importMode.value = null
  currentImportIndex.value = 0
  resetNewQuestionForm()
}

// --- End Import Methods ---

/**
 * Handles updates to a specific question from the child component.
 * This ensures that any edits to a question's text, category, etc., are
 * immediately reflected in the parent's state.
 * @param {object} updatedQuestion The full question object with the changes.
 */
function handleQuestionUpdate(updatedQuestion) {
  const index = questions.value.findIndex((q) => q.uuid === updatedQuestion.uuid)
  if (index !== -1) {
    questions.value.splice(index, 1, updatedQuestion)
  }
}

/**
 * Removes a question from the questionnaire based on its ID.
 * @param {number} questionId The ID of the question to remove.
 */
function removeQuestion(questionId) {
  questions.value = questions.value.filter((q) => q.id !== questionId)
  showToast('Question removed.', 'info')
}

/**
 * Resets the new question form fields to their initial empty state.
 */
function resetNewQuestionForm() {
  newQuestion.value = {
    id: nextQuestionId.value,
    category: '',
    text: '',
    explanation: '',
    options: [
      { text: '', score: 0, explanation: '', recommendation: '' },
      { text: '', score: 0, explanation: '', recommendation: '' },
    ],
  }
}

/**
 * Handles saving the questionnaire.
 * In a real application, this would send data to the backend.
 */
async function saveQuestionnaire() {
  const trimmedName = questionnaire.value.name.trim()
  if (!trimmedName) {
    setTimeout(() => showToast('Questionnaire name cannot be empty.', 'error', 2000), 500)
    return
  }
  if (questions.value.length === 0) {
    setTimeout(
      () => showToast('Please add at least one question to the questionnaire.', 'error', 2000),
      500,
    )
    return
  }

  // Check if another questionnaire with the same name already exists.
  // This check is case-insensitive and ensures we're not comparing the questionnaire to itself during an update.
  const isNameTaken = questionnairesStore.questionnaires.some(
    (q) => q.name.toLowerCase() === trimmedName.toLowerCase() && q.id !== questionnaire.value.id,
  )

  if (isNameTaken) {
    setTimeout(
      () =>
        showToast(`A questionnaire with the name "${trimmedName}" already exists.`, 'error', 2000),
      500,
    )
    return
  }

  // Simulate API call
  const payload = {
    ...questionnaire.value,
    name: trimmedName, // Use the trimmed name for consistency
    questions: questions.value,
  }
  // console.log('Saving questionnaire:', JSON.parse(JSON.stringify(payload)))
  showToast('Saving questionnaire...', 'info')

  try {
    await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate network delay

    if (questionnaire.value.id) {
      // Update existing
      questionnairesStore.updateQuestionnaire(payload)
      showToast('Questionnaire updated successfully!', 'success')
    } else {
      // Add new
      const result = questionnairesStore.addQuestionnaire(payload)
      questionnaire.value.id = result.newQuestionnaire.id // Update local ID
      showToast('Questionnaire created successfully!', 'success')
    }
  } catch (error) {
    // console.error('Error saving questionnaire:', error)
    showToast('Failed to save questionnaire.', 'error')
  }
}

/**
 * Requests the browser to lock the screen orientation to landscape.
 * This is recommended for a better editing experience on mobile.
 */
async function requestLandscape() {
  try {
    // Many browsers require the page to be in fullscreen to lock orientation.
    if (document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen()
    }

    if (screen.orientation && screen.orientation.lock) {
      await screen.orientation.lock('landscape')
      isLockedLandscape.value = true
      showLandscapeSuggestion.value = false
    } else {
      throw new Error('The Screen Orientation API is not supported by this browser.')
    }
  } catch (error: any) {
    console.error('Could not lock screen orientation:', error)
    let message = 'Could not switch to landscape. Please rotate your device manually.'
    if (error.name === 'NotSupportedError') {
      message =
        'Rotation lock requires a secure (HTTPS) connection or is not supported in this context.'
    } else if (error.name === 'SecurityError') {
      message = 'Switching to landscape must be initiated by a user action, like a tap.'
    } else if (error.message.includes('not supported')) {
      message = error.message
    }
    showToast(message, 'error', 5000)
    // Hide the suggestion even if it fails, to not block the user.
    showLandscapeSuggestion.value = false
  }
}

/**
 * Unlocks the screen orientation, returning control to the device's default behavior.
 * This is called when navigating away from the page.
 */
function unlockOrientation() {
  if (isLockedLandscape.value && screen.orientation && screen.orientation.unlock) {
    try {
      screen.orientation.unlock()
      isLockedLandscape.value = false
    } catch (error) {
      console.error('Could not unlock screen orientation:', error)
    }
  }
  // If we entered fullscreen, we should exit it when unlocking.
  if (document.fullscreenElement) {
    document.exitFullscreen().catch((err) => {
      console.error('Error exiting fullscreen:', err)
    })
  }
}

function checkOrientation() {
  isMobile.value = window.innerWidth < 768 // Simple check for mobile-sized screens
  isPortrait.value = window.matchMedia('(orientation: portrait)').matches

  // If user manually rotates to landscape, hide the modal.
  if (!isPortrait.value) {
    showLandscapeSuggestion.value = false
  }
}

function startTooltipTimer() {
  if (tooltipTimer) clearTimeout(tooltipTimer)
  // Show tooltip after a short delay on long press
  tooltipTimer = window.setTimeout(() => {
    showRotateTooltip.value = true
  }, 500)
}

function cancelTooltipTimer() {
  if (tooltipTimer) clearTimeout(tooltipTimer)
  showRotateTooltip.value = false
}

/**
 * Closes the landscape suggestion modal without taking action.
 */
function closeLandscapeSuggestion() {
  showLandscapeSuggestion.value = false
}

/**
 * Undoes the last change to the question order.
 */
function undoOrderChange() {
  if (history.value.length > 0) {
    // Move the current state to the redo stack
    redoStack.value.push(JSON.parse(JSON.stringify(questions.value)))
    // Restore the previous state from history
    const previousState = history.value.pop()
    questions.value = previousState
    showToast('Undo successful.', 'info', 1500)
  }
}

/**
 * Redoes the last undone change to the question order.
 */
function redoOrderChange() {
  if (redoStack.value.length > 0) {
    // Move the current state back to the history stack
    history.value.push(JSON.parse(JSON.stringify(questions.value)))
    // Restore the next state from the redo stack
    const nextState = redoStack.value.pop()
    questions.value = nextState
    showToast('Redo successful.', 'info', 1500)
  }
}

/**
 * Navigates back to the admin dashboard.
 */
function backToDashboard() {
  unlockOrientation() // Ensure orientation is unlocked before leaving
  router.push('/admin/dashboard')
}

const showScrollTopButton = ref(false)
const handleScroll = () => {
  showScrollTopButton.value = window.scrollY > 400
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

onMounted(() => {
  // Add listeners for orientation and resize events
  window.addEventListener('resize', checkOrientation)
  window.addEventListener('orientationchange', checkOrientation)
  // Perform an initial check when the component mounts
  nextTick(() => {
    isMobile.value = window.innerWidth < 768
    isPortrait.value = window.matchMedia('(orientation: portrait)').matches
    // Show suggestion only on initial load if on mobile and in portrait
    if (isMobile.value && isPortrait.value) {
      showLandscapeSuggestion.value = true
    }
  })
  window.addEventListener('scroll', handleScroll)
  // Note: The uiStore is not used here, but this pattern is kept for consistency
  // uiStore.setMainScrollContainer(mainContent.value)
})

onBeforeUnmount(() => {
  unlockOrientation() // Critically, unlock orientation when leaving the page
  window.removeEventListener('resize', checkOrientation)
  window.removeEventListener('orientationchange', checkOrientation)
  window.removeEventListener('scroll', handleScroll)
  // uiStore.setMainScrollContainer(null)
})

/**
 * Watch for changes in route parameters. The `immediate: true` option ensures
 * this runs immediately on component load, replacing the need for onMounted.
 * This is a more robust way to handle data loading from route params.
 */
watch(
  () => route.params.questionnaireId,
  (newId, oldId) => {
    if (newId !== oldId) {
      loadQuestionnaire(newId)
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="min-h-screen bg-gray-100 font-sans flex flex-col" translate="no">
    <!-- Page-specific Header -->
    <header
      class="bg-white shadow-sm py-4 px-6 flex justify-between items-center sticky top-0 z-20"
    >
      <div class="flex items-center">
        <RouterLink
          to="/admin/dashboard"
          @click="unlockOrientation"
          class="text-xl sm:text-2xl font-bold"
          >IT<span class="text-blue-600">I</span>VA
          <span class="text-blue-600 hidden sm:inline">Admin</span></RouterLink
        >
      </div>
      <nav class="flex items-center space-x-2 sm:space-x-4">
        <button
          @click="backToDashboard"
          class="px-3 sm:px-6 py-2 cursor-pointer bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm sm:text-base"
        >
          <span class="hidden sm:inline">Back to Dashboard</span>
          <span class="sm:hidden">Back</span>
        </button>
        <button
          @click="saveQuestionnaire"
          class="px-4 sm:px-8 py-2 cursor-pointer bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm sm:text-base"
        >
          <span class="hidden sm:inline">Save Questionnaire</span>
          <span class="sm:hidden">Save</span>
        </button>
      </nav>
    </header>

    <!-- Main Content Area -->
    <main ref="mainContent" class="flex-grow overflow-y-auto">
      <div class="container mx-auto px-6 py-8">
        <div class="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-11 my-8">
          <header class="mb-8 text-center">
            <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
              {{ questionnaire.id ? 'Edit Questionnaire' : 'Create New Questionnaire' }}
            </h1>
            <p class="text-md text-gray-600">Define and manage your assessment questions.</p>
          </header>

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
          <QuestionList
            :questions="questions"
            :categories="uniqueCategories"
            @remove-question="removeQuestion"
            @update:question="handleQuestionUpdate"
            @update:questions="updateQuestionOrder"
            :scroll-container="mainContent"
          />

          <!-- Add New Question Form -->
          <section class="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-2xl font-semibold text-blue-800">Add New Question</h2>
              <div class="relative group">
                <button
                  @click="triggerFileInput"
                  :disabled="isParsing"
                  class="flex cursor-pointer items-center px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-100 disabled:opacity-50 disabled:cursor-wait transition-colors"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    ></path>
                  </svg>
                  {{ isParsing ? 'Parsing...' : 'Import Questions' }}
                </button>
                <!-- Tooltip -->
                <div
                  class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 p-3 text-sm text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-95 transition-opacity duration-300 pointer-events-none z-10"
                  role="tooltip"
                >
                  <p class="font-bold mb-1">Import from .csv, .xlsx, or .json</p>
                  <p class="font-semibold mt-2">CSV/XLSX Format:</p>
                  <ul class="list-disc list-inside text-xs">
                    <li>Each row is one option for a question.</li>
                    <li>
                      Group options using the same
                      <code class="bg-gray-600 px-1 rounded">question_id</code>.
                    </li>
                    <li>
                      Required columns:
                      <code class="bg-gray-600 px-1 rounded"
                        >question_id, category, question_text, option_text, option_score</code
                      >.
                    </li>
                  </ul>
                  <p class="font-semibold mt-2">JSON Format:</p>
                  <ul class="list-disc list-inside text-xs">
                    <li>An array of question objects.</li>
                    <li>
                      Required keys:
                      <code class="bg-gray-600 px-1 rounded">category, text, options</code> (array
                      of option objects with <code class="bg-gray-600 px-1 rounded">text</code> and
                      <code class="bg-gray-600 px-1 rounded">score</code>).
                    </li>
                  </ul>
                  <div
                    class="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-800"
                  ></div>
                </div>
              </div>
              <input
                type="file"
                ref="fileInput"
                @change="handleFileSelect"
                class="hidden"
                accept=".csv, .xlsx, .json, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              />
            </div>
            <!-- Sequence Import Progress Bar -->
            <div v-if="importMode === 'sequence'" class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Import Progress ({{ currentImportIndex }} / {{ importedQuestions.length }})</label
              >
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  class="bg-green-500 h-2.5 rounded-full transition-all duration-300"
                  :style="{ width: `${importProgress}%` }"
                ></div>
              </div>
            </div>
            <!-- New Question Form -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div class="md:col-span-1">
                <label for="new-question-id" class="block text-sm font-medium text-gray-700 mb-1"
                  >Question No.</label
                >
                <input
                  type="number"
                  id="new-question-id"
                  v-model.number="newQuestion.id"
                  class="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
              </div>
              <div class="md:col-span-3">
                <label
                  for="new-question-category"
                  class="block text-sm font-medium text-gray-700 mb-1"
                  >Category</label
                >
                <input
                  type="text"
                  id="new-question-category"
                  v-model="newQuestion.category"
                  class="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Website Strength"
                  list="category-suggestions"
                />
                <datalist id="category-suggestions">
                  <option v-for="cat in uniqueCategories" :key="cat" :value="cat"></option>
                </datalist>
              </div>
            </div>
            <div class="mb-4">
              <label for="new-question-text" class="block text-sm font-medium text-gray-700 mb-1"
                >Question Text</label
              >
              <textarea
                id="new-question-text"
                v-model="newQuestion.text"
                rows="2"
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
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Options (at least 2)</label
              >
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
                  <textarea
                    v-model="option.recommendation"
                    rows="1"
                    class="block w-full mt-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-xs"
                    placeholder="Option Recommendation"
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
        </div>
      </div>
    </main>

    <!-- Undo/Redo Buttons -->
    <transition name="fade">
      <div
        v-if="history.length > 0"
        class="fixed top-20 z-30 w-full flex justify-center md:w-auto md:right-8"
      >
        <div
          class="bg-white rounded-full shadow-lg p-1 flex items-center space-x-1 border border-gray-200"
        >
          <button
            @click="undoOrderChange"
            :disabled="history.length === 0"
            class="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Undo Order Change"
          >
            <svg
              class="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
              ></path>
            </svg>
          </button>
          <button
            @click="redoOrderChange"
            :disabled="redoStack.length === 0"
            class="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Redo Order Change"
          >
            <svg
              class="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </transition>

    <!-- Landscape Suggestion Modal -->
    <transition name="fade">
      <div
        v-if="showLandscapeSuggestion"
        class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50"
      >
        <div class="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full text-center relative">
          <button
            @click="closeLandscapeSuggestion"
            class="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors"
            aria-label="Close suggestion"
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
          <h3 class="text-xl font-bold text-gray-800 mb-4">Landscape View Recommended</h3>
          <p class="text-gray-600 mb-6">
            For the best experience managing questions, please switch to landscape view.
          </p>
          <button
            @click="requestLandscape"
            class="w-full cursor-pointer py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors"
          >
            Switch to Landscape
          </button>
        </div>
      </div>
    </transition>
    <!-- Floating Landscape Button -->
    <transition name="fade">
      <button
        v-if="isMobile && isPortrait"
        @click="requestLandscape"
        @mousedown="startTooltipTimer"
        @mouseup="cancelTooltipTimer"
        @mouseleave="cancelTooltipTimer"
        @touchstart.passive="startTooltipTimer"
        @touchend="cancelTooltipTimer"
        class="fixed top-20 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all z-30"
        aria-label="Switch to Landscape View"
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
            d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M20.49 15a9 9 0 0 1-14.85 3.36L1 14"
          ></path>
        </svg>
      </button>
    </transition>
    <!-- Tooltip for long press on rotate button -->
    <transition name="fade">
      <div
        v-if="showRotateTooltip"
        class="fixed top-36 right-4 w-max max-w-[200px] bg-gray-900 text-white text-xs rounded-md py-1.5 px-3 shadow-lg z-40"
        role="tooltip"
      >
        Rotate to Landscape for better user experience
      </div>
    </transition>

    <!-- Import Mode Selection Modal -->
    <transition name="fade">
      <div
        v-if="showImportModal"
        class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
      >
        <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full relative">
          <h3 class="text-xl font-bold text-gray-800 mb-4">Choose Import Mode</h3>
          <p class="text-gray-600 mb-6">
            You have successfully parsed
            <span class="font-bold">{{ importedQuestions.length }}</span> questions. How would you
            like to add them?
          </p>
          <div class="flex flex-col space-y-4">
            <button
              @click="startImport('all')"
              class="w-full text-left p-4 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <h4 class="font-semibold text-gray-800">Import All</h4>
              <p class="text-sm text-gray-600">Add all questions to the list immediately.</p>
            </button>
            <button
              @click="startImport('sequence')"
              class="w-full text-left p-4 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <h4 class="font-semibold text-gray-800">Add in Sequence</h4>
              <p class="text-sm text-gray-600">
                Review and add each question one by one using the form below.
              </p>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Scroll-to-top Button -->
    <transition name="fade">
      <button
        v-if="showScrollTopButton"
        @click="scrollToTop"
        class="fixed bottom-8 right-8 cursor-pointer bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all z-50"
        aria-label="Scroll to top"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 15l7-7 7 7"
          ></path>
        </svg>
      </button>
    </transition>

    <AppFooter />
  </div>
</template>

<style scoped>
/* Added for the new scroll-to-top modal */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

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
