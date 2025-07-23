<!-- src/views/DashboardPage.vue - Enhanced version with better UX and accessibility -->
<script setup>
import { ref, computed, onMounted, onBeforeUnmount, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router' // Add useRoute
import { useAssessmentStore } from '@/stores/assessment' // Import the assessment store
import { useAuthStore } from '@/stores/auth' // Import the auth store
import { useReportsStore } from '@/stores/reports' // Import the new reports store
import { useQuestionnairesStore } from '@/stores/questionnaires' // Import the questionnaires store
import { useUiStore } from '@/stores/ui' // Import the UI store
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import SystemTestPanel from '@/components/SystemTestPanel.vue'

// Initialize the Vue Router for navigation
const router = useRouter()
const route = useRoute()

const mainContent = ref(null)

// --- Admin View Logic ---
const isAdminView = computed(() => route.query.viewAsAdmin === 'true')
const viewedUserId = computed(() => (isAdminView.value ? route.query.userId : null))

const viewedUser = computed(() => {
  if (!viewedUserId.value) return null
  // Find the user being viewed from the auth store's list of all users
  return authStore.users.find((u) => u.id === viewedUserId.value)
})

const viewedUserName = computed(() => {
  if (!viewedUser.value) return 'User'
  // Display company name if available, otherwise full name
  return viewedUser.value.companyName || viewedUser.value.userFullName
})

/**
 * Navigates the admin back to their main dashboard.
 */
function goBackToAdmin() {
  router.push('/admin/dashboard')
}
// --- End Admin View Logic ---

// Initialize the auth store
const authStore = useAuthStore()
const reportsStore = useReportsStore()
const uiStore = useUiStore()
const questionnairesStore = useQuestionnairesStore()
const assessmentStore = useAssessmentStore()

// Get toast functions
const showToast = inject('showToast')

// Reactive state to control the visibility of the settings dropdown menu
const showSettingsMenu = ref(false)
const showDeleteConfirmModal = ref(false)
const reportToDeleteId = ref(null)
const showNewAssessmentModal = ref(false)

// Reactive state for search functionality
const searchQuery = ref('')

// Reactive state for the welcome modal
const showWelcomeModal = ref(false)

// Reactive state for the system test panel
const showSystemTestPanel = ref(false)

// Loading states
const isLoading = ref(false)
const isDeleting = ref(false)

// --- Data Source Logic ---
// This computed property dynamically determines which reports to show.
const reportsForDisplay = computed(() => {
  if (isAdminView.value && viewedUserId.value) {
    // Admin view: filter all reports from the store for the specific user ID.
    return reportsStore.allReports
      .filter((r) => r.userId === viewedUserId.value)
      .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort newest first
  }
  // Normal user view: use the default computed property from the store.
  return reportsStore.userReports
})

const completedReports = computed(() => reportsForDisplay.value.filter((r) => !r.isDraft))
const draftReports = computed(() => reportsForDisplay.value.filter((r) => r.isDraft))
const hasDrafts = computed(() => draftReports.value.length > 0)

// The average score must be recalculated for the admin view.
const averageScore = computed(() => {
  const reports = completedReports.value
  if (reports.length === 0) return 'N/A'

  // Group reports by type to find the latest of each.
  const reportsByType = reports.reduce((acc, report) => {
    const type = report.type
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(report)
    return acc
  }, {})

  // Get the score from the latest report of each type.
  const latestScores = Object.values(reportsByType).map((group) => {
    const latestReport = group.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    return latestReport.score
  })

  if (latestScores.length === 0) return 'N/A'

  // Calculate and format the average.
  const sumOfLatestScores = latestScores.reduce((sum, score) => sum + score, 0)
  const avg = sumOfLatestScores / latestScores.length
  return avg.toFixed(1)
})

const scoreTrend = computed(() => {
  const reportsByType = completedReports.value.reduce((acc, report) => {
    if (!acc[report.type]) acc[report.type] = []
    acc[report.type].push(report)
    return acc
  }, {})

  // Only consider types that have at least two reports to calculate a trend
  const trendableGroups = Object.values(reportsByType).filter((group) => group.length >= 2)

  if (trendableGroups.length === 0) {
    return 'neutral' // Not enough data for a trend
  }

  const latestScores = trendableGroups.map(
    (group) => group.sort((a, b) => new Date(b.date) - new Date(a.date))[0].score,
  )
  const previousScores = trendableGroups.map(
    (group) => group.sort((a, b) => new Date(b.date) - new Date(a.date))[1].score,
  )

  const currentAvg = latestScores.reduce((sum, score) => sum + score, 0) / latestScores.length
  const previousAvg = previousScores.reduce((sum, score) => sum + score, 0) / previousScores.length

  if (currentAvg > previousAvg) return 'up'
  if (currentAvg < previousAvg) return 'down'
  return 'neutral'
})

const filteredReports = computed(() => {
  if (!searchQuery.value.trim()) {
    return reportsForDisplay.value // Use the new dynamic data source
  }
  return reportsForDisplay.value.filter((report) =>
    report.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

const activeAssessments = computed(() =>
  questionnairesStore.questionnaires
    .filter((q) => q.status === 'Active')
    .map((q) => ({
      ...q,
      questionsCount: questionnairesStore.getQuestionCountForAssessment(q.name),
    })),
)

const draftNameMapping = computed(() => {
  // Get drafts and sort them by creation date (oldest first) to ensure consistent numbering
  const sortedDrafts = reportsForDisplay.value
    .filter((r) => r.isDraft)
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  // Create a map of draft.id -> sequential name
  const map = new Map()
  sortedDrafts.forEach((draft, index) => {
    map.set(draft.id, `Draft Assessment ${index + 1}`)
  })
  return map
})

function getMobileDisplayName(report) {
  let displayName
  // If it's a draft, use the sequential name from the map
  if (report.isDraft) {
    displayName = draftNameMapping.value.get(report.id) || report.name
  } else {
    displayName = report.name
  }

  // Apply truncation logic for long names
  if (displayName.length > 25) {
    return displayName.substring(0, 22) + '...'
  }

  return displayName
}
// --- Grading Logic (copied for consistency) ---
function getGrade(score) {
  if (score >= 85) return 'A'
  if (score >= 75) return 'B'
  if (score >= 65) return 'C'
  if (score >= 50) return 'D'
  return 'E'
}

function getGradeColorClass(grade) {
  switch (grade) {
    case 'A':
      return 'text-green-600'
    case 'B':
      return 'text-emerald-600'
    case 'C':
      return 'text-yellow-600'
    case 'D':
      return 'text-orange-600'
    case 'E':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

function getScoreColorClass(score) {
  if (score >= 80) return 'text-green-600'
  if (score >= 55) return 'text-yellow-600'
  return 'text-red-600'
}

/**
 * Navigates to the ReportViewerPage with the details of the selected report.
 * @param {object} report The report object containing details.
 */
async function viewReport(report) {
  try {
    isLoading.value = true
    const routeConfig = {
      name: 'ReportViewerPage',
      params: { reportId: report.id },
    }

    if (isAdminView.value) {
      // For admin view, pass the full report object in the state to bypass
      // the standard store security check, and pass query params to maintain context.
      routeConfig.state = { reportData: JSON.parse(JSON.stringify(report)) }
      routeConfig.query = { viewAsAdmin: 'true', userId: viewedUserId.value }
    }

    await router.push(routeConfig)
  } catch (error) {
    console.error('Error navigating to report:', error)
    showToast('Failed to open report.', 'error')
  } finally {
    isLoading.value = false
  }
}

/**
 * Opens the confirmation modal before deleting a report.
 * @param {number} reportId The ID of the report to be deleted.
 */
function promptDeleteReport(reportId) {
  reportToDeleteId.value = reportId
  showDeleteConfirmModal.value = true
}

/**
 * Deletes a report from the user's list after confirmation.
 */
async function confirmDeleteReport() {
  if (reportToDeleteId.value !== null) {
    try {
      isDeleting.value = true
      await reportsStore.deleteReport(reportToDeleteId.value)
      showToast('Report deleted successfully', 'success')
    } catch (error) {
      console.error('Error deleting report:', error)
      showToast('Failed to delete report', 'error')
    } finally {
      isDeleting.value = false
      cancelDelete() // Close modal and reset state
    }
  }
}

/**
 * Closes the delete confirmation modal without taking action.
 */
function cancelDelete() {
  showDeleteConfirmModal.value = false
  reportToDeleteId.value = null
}

/**
 * Continues a draft assessment from where the user left off.
 * @param {object} report The draft report object to continue.
 */
async function continueAssessment(report) {
  try {
    isLoading.value = true
    // Load the draft into the assessment store
    const draft = reportsStore.getDraftById(report.id)
    if (draft) {
      // Use a dedicated action to load the draft into the active state
      assessmentStore.loadDraft(draft)
      // Navigate to questionnaire with the draft type
      await router.push({ name: 'questionnaire', params: { type: report.type } })
    }
  } catch (error) {
    console.error('Error continuing assessment:', error)
  } finally {
    isLoading.value = false
  }
}

/**
 * Navigates to the QuestionnairePage to initiate a new security assessment.
 */
async function startNewAssessment() {
  showNewAssessmentModal.value = true
}

async function startSelectedAssessment(type) {
  showNewAssessmentModal.value = false
  try {
    isLoading.value = true
    // Navigate to the questionnaire page with a default assessment type
    await router.push({ name: 'questionnaire', params: { type } })
  } catch (error) {
    console.error('Error starting new assessment:', error)
    showToast('Failed to start assessment.', 'error')
  } finally {
    isLoading.value = false
  }
}

/**
 * Closes the welcome modal.
 */
function closeWelcomeModal() {
  showWelcomeModal.value = false
}

/**
 * Navigates to the new LinkAccountsPage.
 */
async function goToLinkAccounts() {
  try {
    isLoading.value = true
    await router.push('/link-accounts')
    showSettingsMenu.value = false // Close menu after navigation
  } catch (error) {
    console.error('Error navigating to link accounts:', error)
  } finally {
    isLoading.value = false
  }
}

/**
 * Handles user logout.
 */
async function logout() {
  try {
    isLoading.value = true
    console.log('User logged out.')
    showToast('Logging out...', 'info')
    // In a real app, this would clear authentication tokens.
    await router.push('/')
    authStore.logout() // Use the store's logout action
  } catch (error) {
    console.error('Error during logout:', error)
    showToast('Error during logout', 'error')
  } finally {
    isLoading.value = false
  }
}

// Lifecycle hook to show welcome modal on first visit
onMounted(() => {
  // Only show the welcome modal for a regular user, not in admin view.
  if (isAdminView.value) return

  // Check if this is the user's first visit to the dashboard
  const hasVisited = localStorage.getItem('dashboard-visited')
  if (!hasVisited) {
    showWelcomeModal.value = true
    localStorage.setItem('dashboard-visited', 'true')
  }

  // Set the main scroll container for the AppFooter's Back to Top button
  uiStore.setMainScrollContainer(mainContent.value)
})

onBeforeUnmount(() => {
  // Clean up the scroll container when leaving the page
  uiStore.setMainScrollContainer(null)
})

/**
 * Opens the system test panel.
 */
function openSystemTestPanel() {
  showSystemTestPanel.value = true
}

/**
 * Closes the system test panel.
 */
function closeSystemTestPanel() {
  showSystemTestPanel.value = false
}
</script>

<template>
  <!-- Main container for the dashboard page, with light gray background -->

  <div class="h-screen bg-gray-100 font-sans flex flex-col">
    <!-- Admin View Header: A special header shown only when an admin is viewing. -->
    <header
      v-if="isAdminView"
      class="bg-white shadow-sm py-4 px-6 flex justify-between items-center sticky top-0 z-30"
    >
      <h2 class="text-xl font-bold text-gray-800">
        Viewing Dashboard for: <span class="text-indigo-600">{{ viewedUserName }}</span>
      </h2>
      <button
        @click="goBackToAdmin"
        class="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors"
      >
        Back to Admin
      </button>
    </header>
    <!-- Default User Header: The standard header for a logged-in user. -->
    <AppHeader
      v-else
      :show-new-assessment="true"
      @request-new-assessment-modal="showNewAssessmentModal = true"
    />

    <!-- Main Content Area: Centered, padded, responsive -->
    <main ref="mainContent" class="flex-grow overflow-y-auto">
      <div class="container mx-auto px-6 py-8">
        <!-- Welcome Heading - uses authStore.userFullName for better display -->
        <h1 v-if="!isAdminView" class="text-3xl font-bold text-gray-900 mb-6">
          Welcome, {{ authStore.userFullName }}!
        </h1>

        <!-- Dashboard Overview Cards: Grid layout for key metrics -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <!-- Total Assessments Card -->
          <div class="bg-white rounded-lg shadow p-6 text-center">
            <h3 class="text-xl font-semibold text-gray-700 mb-2">Total Assessments</h3>
            <p class="text-5xl font-extrabold text-blue-600">{{ completedReports.length }}</p>
          </div>
          <!-- Average Score Card -->
          <div class="bg-white rounded-lg shadow p-6 text-center">
            <h3 class="text-xl font-semibold text-gray-700 mb-2">Average Score</h3>
            <div class="flex items-center justify-center">
              <p class="text-5xl font-extrabold text-green-600">{{ averageScore }}</p>
              <div v-if="scoreTrend !== 'neutral'" class="ml-2">
                <svg
                  v-if="scoreTrend === 'up'"
                  class="w-8 h-8 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <svg
                  v-if="scoreTrend === 'down'"
                  class="w-8 h-8 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 9.586V7z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
          <!-- Draft Assessments Card -->
          <div class="bg-white rounded-lg shadow p-6 text-center">
            <h3 class="text-xl font-semibold text-gray-700 mb-2">Draft Assessments</h3>
            <p class="text-5xl font-extrabold text-yellow-600">{{ draftReports.length }}</p>
          </div>
        </div>

        <!-- Recent Reports Section: Displays a table of user's past reports -->
        <section class="bg-white rounded-lg shadow p-6 mb-8">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-semibold text-gray-800">Your Recent Reports</h2>
            <div class="w-full md:w-1/3">
              <input
                type="text"
                v-model="searchQuery"
                placeholder="Search reports by name..."
                class="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                aria-label="Search reports by name"
              />
            </div>
          </div>

          <div
            ref="reportsContainer"
            v-if="filteredReports.length > 0"
            class="max-h-96 overflow-y-auto"
          >
            <!-- Desktop Table View -->
            <table class="hidden md:table min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50 sticky top-0">
                <tr>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Report Name
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Score
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Grade
                  </th>
                  <th
                    scope="col"
                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th scope="col" class="relative px-4 py-3">
                    <span class="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="report in filteredReports" :key="report.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div class="flex items-center">
                      <span>{{ report.name }}</span>
                      <!-- Draft indicator -->
                      <span
                        v-if="report.isDraft"
                        class="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                      >
                        <svg
                          class="w-3 h-3 mr-1"
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
                        Draft
                      </span>
                      <!-- Continue assessment button for drafts -->
                      <button
                        v-if="report.isDraft && !isAdminView"
                        @click="continueAssessment(report)"
                        class="ml-2 text-gray-400 cursor-pointer hover:text-blue-600 transition-colors"
                        title="Continue Assessment"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ report.date.replace('T', ' ').substring(0, 16) }}
                  </td>
                  <td
                    v-if="!report.isDraft"
                    class="px-6 py-4 whitespace-nowrap text-sm font-bold"
                    :class="getScoreColorClass(report.score)"
                  >
                    {{ report.score }}
                  </td>
                  <td v-else class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">--</td>
                  <td
                    v-if="!report.isDraft"
                    class="px-6 py-4 whitespace-nowrap text-sm font-bold"
                    :class="getGradeColorClass(getGrade(report.score))"
                  >
                    {{ getGrade(report.score) }}
                  </td>
                  <td v-else class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">--</td>
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ report.type }}
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex items-center justify-end space-x-4">
                      <!-- View Report button - only for completed reports -->
                      <button
                        v-if="!report.isDraft"
                        @click="viewReport(report)"
                        class="text-blue-600 hover:text-blue-900 transition-colors duration-200 cursor-pointer"
                      >
                        View Report
                      </button>
                      <!-- Delete button - only shown to the actual user, not in admin view -->
                      <button
                        v-if="!isAdminView"
                        @click="promptDeleteReport(report.id)"
                        class="text-red-500 hover:text-red-700 cursor-pointer transition-colors"
                        :title="report.isDraft ? 'Delete Draft' : 'Delete Report'"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <!-- Mobile Card View -->
            <div class="md:hidden space-y-3 p-1">
              <div
                v-for="report in filteredReports"
                :key="report.id"
                class="bg-white p-4 rounded-lg shadow-md border border-gray-200"
              >
                <div class="flex justify-between items-start">
                  <div class="flex-grow pr-4">
                    <h3 class="font-bold text-gray-800">
                      {{ getMobileDisplayName(report) }}
                    </h3>
                    <p class="text-sm text-gray-500">{{ report.type }}</p>
                    <p class="text-xs text-gray-400 mt-1">
                      {{ report.date.replace('T', ' ').substring(0, 16) }}
                    </p>
                  </div>
                  <div class="flex items-center space-x-3 flex-shrink-0">
                    <button
                      v-if="!report.isDraft"
                      @click="viewReport(report)"
                      class="text-blue-600 hover:text-blue-800 transition-colors"
                      title="View Report"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7S3.732 16.057 2.458 12z"
                        />
                      </svg>
                    </button>
                    <button
                      v-if="!isAdminView"
                      @click="promptDeleteReport(report.id)"
                      class="text-red-500 hover:text-red-700 transition-colors"
                      :title="report.isDraft ? 'Delete Draft' : 'Delete Report'"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div v-if="report.isDraft" class="mt-3">
                  <div class="flex items-center justify-between">
                    <span
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                    >
                      <svg
                        class="w-3 h-3 mr-1"
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
                      Draft
                    </span>
                    <button
                      v-if="!isAdminView"
                      @click="continueAssessment(report)"
                      class="flex items-center text-sm text-blue-600 font-semibold hover:text-blue-800 transition-colors"
                      title="Continue Assessment"
                    >
                      Continue
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div
                  v-if="!report.isDraft"
                  class="mt-4 flex justify-around items-center text-center bg-gray-50 p-2 rounded-md"
                >
                  <div>
                    <p class="text-xs text-gray-500 uppercase font-semibold">Score</p>
                    <p class="text-2xl font-bold" :class="getScoreColorClass(report.score)">
                      {{ report.score }}
                    </p>
                  </div>
                  <div class="border-l h-10 border-gray-200"></div>
                  <div>
                    <p class="text-xs text-gray-500 uppercase font-semibold">Grade</p>
                    <p
                      class="text-2xl font-bold"
                      :class="getGradeColorClass(getGrade(report.score))"
                    >
                      {{ getGrade(report.score) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Message if no reports are available -->
          <div v-else class="text-center py-8 text-gray-500">
            <p class="mb-4">
              <span v-if="searchQuery && reportsStore.userReports.length > 0"
                >No reports match your search.</span
              >
              <span v-else>No reports found. Start a new assessment to see your reports here!</span>
            </p>
            <button
              @click="startNewAssessment"
              class="bg-blue-600 cursor-pointer text-white font-semibold py-2 px-6 rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Start New Assessment
            </button>
          </div>
        </section>

        <!-- Quick Actions Section: Buttons for common tasks -->
        <section v-if="!isAdminView" class="bg-white rounded-lg shadow p-6">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <!-- Start New Assessment Button -->
            <button
              @click="startNewAssessment"
              class="flex cursor-pointer flex-col items-center justify-center p-6 bg-blue-50 rounded-lg shadow-sm hover:bg-blue-100 transition-colors duration-200"
            >
              <!-- Icon for New Assessment -->
              <svg
                class="w-12 h-12 text-blue-600 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M12 4v16m8-8H4"
                ></path>
              </svg>
              <span class="text-lg font-medium text-blue-800">Start New Assessment</span>
            </button>
            <!-- Continue Draft Assessment Button - only show if there are drafts -->
            <button
              v-if="hasDrafts"
              @click="continueAssessment(draftReports[0])"
              class="flex flex-col cursor-pointer items-center justify-center p-6 bg-yellow-50 rounded-lg shadow-sm hover:bg-yellow-100 transition-colors duration-200"
            >
              <!-- Icon for Continue Assessment -->
              <svg
                class="w-12 h-12 text-yellow-600 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                ></path>
              </svg>
              <span class="text-lg font-medium text-yellow-800">Continue Draft</span>
            </button>
            <!-- Manage Settings Button (now handled by dropdown) -->
            <button
              @click="goToLinkAccounts"
              class="flex flex-col cursor-pointer items-center justify-center p-6 bg-green-50 rounded-lg shadow-sm hover:bg-green-100 transition-colors duration-200"
            >
              <!-- Icon for Settings/Link Accounts -->
              <svg
                class="w-12 h-12 text-green-600 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.368 2.572-1.065z"
                ></path>
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
              <span class="text-lg font-medium text-green-800">Link Accounts</span>
            </button>
            <!-- Logout Button -->
            <button
              @click="logout"
              class="flex flex-col cursor-pointer items-center justify-center p-6 bg-red-50 rounded-lg shadow-sm hover:bg-red-100 transition-colors duration-200"
            >
              <!-- Icon for Logout -->
              <svg
                class="w-12 h-12 text-red-600 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                ></path>
              </svg>
              <span class="text-lg font-medium text-red-800">Logout</span>
            </button>

            <!-- System Test Panel Button (for development/testing) -->
            <button
              @click="openSystemTestPanel"
              class="flex flex-col cursor-pointer items-center justify-center p-6 bg-purple-50 rounded-lg shadow-sm hover:bg-purple-100 transition-colors duration-200"
            >
              <!-- Icon for System Test -->
              <svg
                class="w-12 h-12 text-purple-600 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span class="text-lg font-medium text-purple-800">System Test</span>
            </button>
          </div>
        </section>
      </div>
    </main>
    <AppFooter />

    <!-- Welcome Modal: Displays a welcome message when the dashboard is loaded -->
    <transition name="flash-out-fade">
      <div
        v-if="showWelcomeModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <div
          class="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center relative transform transition-all duration-300 scale-100 opacity-100"
        >
          <!-- Close button for the modal -->
          <button
            @click="closeWelcomeModal"
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <!-- Close Icon -->
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
          <!-- Modal Heading -->
          <h3 class="text-3xl font-bold text-blue-600 mb-4">Welcome Back!</h3>
          <!-- Modal Body Text -->
          <p class="text-gray-700 mb-6">
            We're glad to see you again, {{ authStore.userFullName }}. Dive into your dashboard to
            manage your IT vulnerability assessments.
          </p>
          <!-- Get Started Button to close the modal -->
          <button
            @click="closeWelcomeModal"
            class="bg-blue-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Get Started
          </button>
        </div>
      </div>
    </transition>

    <!-- New Assessment Modal -->
    <transition name="fade">
      <div
        v-if="showNewAssessmentModal"
        @click.self="showNewAssessmentModal = false"
        class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
      >
        <div class="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full relative">
          <h3 class="text-xl font-bold text-gray-800 mb-4">Start a New Assessment</h3>
          <p class="text-gray-600 mb-6">
            Please select the type of assessment you would like to begin.
          </p>
          <ul class="space-y-2 max-h-60 overflow-y-auto">
            <li v-for="assessment in activeAssessments" :key="assessment.id">
              <button
                @click="startSelectedAssessment(assessment.name)"
                class="w-full text-left p-4 rounded-lg bg-gray-100 hover:bg-blue-100 transition-colors"
              >
                <h4 class="font-semibold text-gray-800">{{ assessment.name }}</h4>
                <p class="text-sm text-gray-600">{{ assessment.questionsCount }} questions</p>
              </button>
            </li>
          </ul>
          <button
            @click="showNewAssessmentModal = false"
            class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
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
        </div>
      </div>
    </transition>

    <!-- System Test Panel -->
    <SystemTestPanel :show="showSystemTestPanel" @close="closeSystemTestPanel" />

    <!-- Delete Confirmation Modal -->
    <transition name="fade">
      <div
        v-if="showDeleteConfirmModal"
        class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
      >
        <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full relative">
          <button
            @click="cancelDelete"
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
          <h3 class="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h3>
          <p class="text-gray-600 mb-6">
            Are you sure you want to delete this
            {{
              reportToDeleteId && reportsStore.getDraftById(reportToDeleteId) ? 'draft' : 'report'
            }}? This action cannot be undone.
          </p>
          <div class="flex justify-end space-x-4">
            <button
              @click="cancelDelete"
              class="px-6 py-2 cursor-pointer font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="confirmDeleteReport"
              class="px-6 py-2 cursor-pointer font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/*
  Scoped styles for the flash-out-fade transition.
  This defines how the notification/modal will fade out.
*/
.flash-out-fade-enter-active,
.flash-out-fade-leave-active {
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}

.flash-out-fade-enter-from,
.flash-out-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px); /* Moves up slightly while fading out */
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
