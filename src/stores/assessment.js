/**
 * @file src/stores/assessment.js
 * @description Manages the state of the *active* questionnaire session.
 * This store holds the current questions, answers, and progress for the assessment
 * the user is currently taking. It persists this single active session to
 * localStorage to prevent data loss on page refresh. It does NOT manage the list
 * of all saved drafts; that is the responsibility of reports.js.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { validateQuestionnaireData } from '@/utils/testUtils'

export const useAssessmentStore = defineStore('assessment', () => {
  // --- State ---
  /**
   * A single reactive object holding the entire state for the active draft.
   * This is more efficient as it's managed and persisted as one unit.
   * @type {ref<{id: string, type: string, questions: any[], answers: object, lastQuestionIndex: number, createdAt: string, lastModified: string}|null>}
   */
  const draft = ref(null)
  const generatedReport = ref(null)
  const reportName = ref('')
  const assessmentType = ref('')

  /**
   * The single source of truth for all available assessment types.
   * This is a static list that can be extended as needed even from a DB.
   */
  const availableAssessments = ref([
    'Standard ITIVA Assessment',
    'Advanced Cloud Security Check',
    'GDPR Compliance Audit',
  ])

  // --- Private Storage Handlers ---
  const _saveDraftToStorage = () => {
    try {
      if (draft.value) {
        localStorage.setItem('assessment-draft', JSON.stringify(draft.value))
      } else {
        localStorage.removeItem('assessment-draft')
      }
    } catch (error) {
      console.error('Error saving draft to storage:', error)
    }
  }

  // Save draft to localStorage
  const loadDraftFromStorage = () => {
    try {
      const storedDraftJSON = localStorage.getItem('assessment-draft')
      if (storedDraftJSON) {
        draft.value = JSON.parse(storedDraftJSON)
      }
    } catch (error) {
      console.error('Error loading draft from storage:', error)
      draft.value = null // Clear corrupted data
      localStorage.removeItem('assessment-draft')
    }
  }

  // Initialize store state from localStorage on load
  loadDraftFromStorage()

  // --- Computed Properties (Getters) ---
  const hasActiveDraft = computed(() => !!draft.value)
  const isDraftMode = computed(() => !!draft.value) // Simplified alias for hasActiveDraft
  const currentDraft = computed(() => draft.value) // Alias for backward compatibility if needed
  const draftAnswers = computed(() => draft.value?.answers || {})
  const draftLastQuestionIndex = computed(() => draft.value?.lastQuestionIndex || 0)

  const draftCompletionPercentage = computed(() => {
    if (!draft.value?.questions?.length) return 0
    const totalQuestions = draft.value.questions.length
    const answeredQuestions = Object.values(draft.value.answers || {}).filter(Boolean).length
    return Math.round((answeredQuestions / totalQuestions) * 100)
  })

  const draftProgress = computed(() => {
    if (!draft.value || !draft.value.questions) {
      return { current: 0, total: 0, percentage: 0 }
    }

    if (!draft.value?.questions?.length) return { current: 0, total: 0, percentage: 0 }
    const total = draft.value.questions.length
    const current = (draft.value.lastQuestionIndex || 0) + 1
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0

    return { current, total, percentage }
  })

  // --- Actions ---
  const startDraft = (type, questions) => {
    try {
      const validation = validateQuestionnaireData(questions)
      if (!validation.isValid) {
        throw new Error(`Questionnaire validation failed: ${validation.errors.join(', ')}`)
      }

      if (!type || typeof type !== 'string') {
        throw new Error('Assessment type is required and must be a string')
      }

      draft.value = {
        id: `draft-${Date.now()}`,
        type,
        questions,
        answers: {},
        lastQuestionIndex: 0,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      }

      _saveDraftToStorage()
      return { success: true, draft: draft.value }
    } catch (error) {
      console.error('Error starting draft:', error)
      throw error
    }
  }

  /**
   * Efficiently updates the draft with a batch of changes.
   * @param {{answers: object, lastQuestionIndex: number}} payload
   */
  const updateDraft = ({ answers, lastQuestionIndex }) => {
    try {
      if (!draft.value) {
        throw new Error('No active draft to update.')
      }

      draft.value.answers = answers
      draft.value.lastQuestionIndex = lastQuestionIndex
      draft.value.lastModified = new Date().toISOString()
      _saveDraftToStorage()

      return { success: true }
    } catch (error) {
      console.error('Error updating draft:', error)
      throw error
    }
  }

  /**
   * Loads a specific draft object into the active state.
   * This is used when a user clicks "Continue Draft" from the dashboard.
   * @param {object} draftData The complete draft object from the reportsStore.
   */
  const loadDraft = (draftData) => {
    if (draftData && draftData.id) {
      // Correctly assign the loaded draft data to the reactive `draft` ref.
      draft.value = draftData
      // Persist this draft as the active one for the session
      _saveDraftToStorage()
    } else {
      console.error('Failed to load draft: invalid data provided.')
    }
  }

  const clearDraft = () => {
    try {
      draft.value = null
      _saveDraftToStorage() // This will remove the item from localStorage
      return { success: true }
    } catch (error) {
      console.error('Error clearing draft:', error)
      throw error
    }
  }

  const setGeneratedReport = (report, name, type) => {
    try {
      if (!report) throw new Error('Report data is required')
      if (!name || typeof name !== 'string') throw new Error('Report name is required')
      if (!type || typeof type !== 'string') throw new Error('Assessment type is required')

      const requiredFields = ['overall', 'ws', 'dn', 'cd', 'cs', 'recommendations']
      const missingFields = requiredFields.filter((field) => !(field in report))

      if (missingFields.length > 0) {
        throw new Error(`Report missing required fields: ${missingFields.join(', ')}`)
      }

      generatedReport.value = report
      reportName.value = name
      assessmentType.value = type

      return { success: true }
    } catch (error) {
      console.error('Error setting generated report:', error)
      throw error
    }
  }

  return {
    // State (exposed via computed properties for better practice)
    currentDraft,
    draftAnswers,
    draftLastQuestionIndex,
    isDraftMode,
    generatedReport,
    reportName,

    // Computed
    hasActiveDraft,
    draftCompletionPercentage,
    draftProgress,

    // --- Actions ---
    startDraft,
    updateDraft,
    loadDraft,
    clearDraft,
    setGeneratedReport,

    loadDraftFromStorage,
    availableAssessments,
  }
})
