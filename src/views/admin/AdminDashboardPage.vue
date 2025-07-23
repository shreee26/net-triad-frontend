<!-- src/views/admin/AdminDashboardPage.vue - Updated as per requirements -->
<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, inject } from 'vue'
import { useAuthStore } from '@/stores/auth' // Import the auth store
import { useRouter, RouterLink } from 'vue-router' // Import RouterLink for navigation
import { useReportsStore } from '@/stores/reports' // Import the reports store
import { useQuestionnairesStore } from '@/stores/questionnaires' // Import the new questionnaires store
import { useUiStore } from '@/stores/ui' // Import the UI store
import { mockRankings } from '@/api/mockData' // Using mock data
import AppFooter from '@/components/AppFooter.vue'

const mainContent = ref(null)

// Initialize the router for navigation
const router = useRouter()

// Mock data for admin dashboard overview
const totalUsers = ref(150)

// Initialize the auth store
const authStore = useAuthStore()
const reportsStore = useReportsStore()
const uiStore = useUiStore()
const showToast = inject('showToast')
const questionnairesStore = useQuestionnairesStore() // Use the store
const activeAssessments = ref(25)
const pendingApprovals = ref(5)

// Get questionnaires from the store
const showScrollTopButton = ref(false)
const questionnaires = computed(() =>
  questionnairesStore.questionnaires.map((q) => ({
    ...q,
    questionsCount: questionnairesStore.getQuestionCountForAssessment(q.name),
  })),
)

// This computed property combines mock businesses with real, qualified users
const allBusinesses = computed(() => {
  // Start with the mock data, ensuring unique IDs
  const mockBusinesses = mockRankings.map((r) => ({
    ...r, // Spread the original mock data
    id: `mock-${r.rank}`,
    status: r.score > 70 ? 'Active' : 'Needs Attention',
    categoryScores: r.report
      ? [
          { name: 'Website Strength', score: r.report.ws, key: 'ws' },
          { name: 'Devices & Network', score: r.report.dn, key: 'dn' },
          { name: 'Compliance & Documentation', score: r.report.cd, key: 'cd' },
          { name: 'Cyber Security Implementations', score: r.report.cs, key: 'cs' },
        ]
      : [],
    isRealUser: false,
  }))

  // 1. Get all available 'Active' assessment types
  const availableAssessmentTypes = questionnairesStore.questionnaires
    .filter((q) => q.status === 'Active')
    .map((q) => q.name)

  // 2. Get all non-admin users
  const users = authStore.users.filter((u) => !u.isAdmin)

  // 3. Process each user to see if they qualify to be on the list
  const userBusinesses = users
    .map((user) => {
      const result = reportsStore.calculateUserAverageScoreAndReports(
        user.id,
        availableAssessmentTypes,
      )

      if (!result) return null

      const { averageScore, latestReports } = result

      // As requested, find the latest "Standard Net Triad Assessment" to display its category scores.
      // This provides a consistent and meaningful view for all users on the list.
      const standardReport = latestReports.find((r) => r.type === 'Standard Net Triad Assessment')

      // The categoryScores from the report already have `name` and `score`.
      // We just need to add a `key` for the v-for loop to work correctly.
      const avgCategoryScores =
        // Directly use the categoryScores from the found report.
        standardReport?.report?.categoryScores || []

      return {
        id: `user-${user.id}`,
        name: user.companyName || user.userFullName,
        location: user.city || 'N/A',
        type: user.businessType || 'N/A',
        score: averageScore,
        status: averageScore > 70 ? 'Active' : 'Needs Attention',
        categoryScores: avgCategoryScores,
        isRealUser: true,
      }
    })
    .filter(Boolean) // Remove nulls

  const combined = [...mockBusinesses, ...userBusinesses]
  combined.sort((a, b) => b.score - a.score)
  return combined.map((biz, index) => ({ ...biz, rank: index + 1 }))
})

// Reactive state for search and sort for business list
const searchTerm = ref('')
const sortKey = ref('score') // Default sort key is 'score'
const sortOrder = ref(0) // 0 for descending, 1 for ascending

// Computed property for filtered and sorted businesses in the list
const filteredAndSortedBusinesses = computed(() => {
  let filtered = allBusinesses.value

  // Apply search filter
  if (searchTerm.value) {
    const lowerCaseSearchTerm = searchTerm.value.toLowerCase()
    filtered = filtered.filter(
      (biz) =>
        biz.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        biz.location.toLowerCase().includes(lowerCaseSearchTerm) ||
        biz.type.toLowerCase().includes(lowerCaseSearchTerm),
    )
  }

  // Apply sorting
  return filtered.sort((a, b) => {
    let valA = a[sortKey.value]
    let valB = b[sortKey.value]
    if (typeof valA === 'string' && typeof valB === 'string') {
      return valA.localeCompare(valB) * (sortOrder.value === 0 ? -1 : 1)
    }
    return (valA - valB) * (sortOrder.value === 0 ? -1 : 1)
  })
})

/**
 * Toggles the sort order when a sort key is clicked.
 * @param {string} key The key to sort by.
 */
function toggleSort(key) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 0 ? 1 : 0 // Toggle between 0 and 1
  } else {
    sortKey.value = key
    sortOrder.value = 0 // Default to descending for new key
  }
}

// Reactive state for selected business to show category scores on the right side
const selectedBusinessForScores = ref(null)

// Watch for the combined list to populate and set the first item as selected
watch(
  allBusinesses,
  (newBusinesses) => {
    if (newBusinesses.length > 0 && !selectedBusinessForScores.value) {
      selectedBusinessForScores.value = newBusinesses[0]
    } else if (newBusinesses.length === 0) {
      selectedBusinessForScores.value = null
    }
  },
  { immediate: true },
)
/**
 * Sets the selected business for displaying category scores.
 * @param {object} biz The business object to select.
 */
function selectBusinessForScores(biz) {
  selectedBusinessForScores.value = biz
}

/**
 * Navigates to the edit questionnaire page for a specific questionnaire.
 * @param {object} questionnaire The questionnaire object to be edited.
 */
function editQuestionnaire(questionnaire) {
  router.push({ name: 'adminQuestionnaire', params: { questionnaireId: questionnaire.id } })
}

/**
 * Handles adding a new questionnaire.
 */
function addNewQuestionnaire() {
  router.push({ name: 'adminQuestionnaire', params: { questionnaireId: 'new' } })
}

// --- Modal State & Logic ---
const showConfirmModal = ref(false)
const modalConfig = ref({
  title: '',
  message: '',
  action: null,
  confirmText: 'Confirm',
  confirmColor: 'bg-red-600',
})
const selectedQuestionnaire = ref(null)

function promptDelete(questionnaire) {
  selectedQuestionnaire.value = questionnaire
  modalConfig.value = {
    title: 'Confirm Deletion',
    message: `Are you sure you want to delete the questionnaire "${questionnaire.name}"? This will also delete all of its questions and cannot be undone.`,
    action: 'delete',
    confirmText: 'Delete',
    confirmColor: 'bg-red-600 hover:bg-red-700',
  }
  showConfirmModal.value = true
}

function promptDuplicate(questionnaire) {
  selectedQuestionnaire.value = questionnaire
  modalConfig.value = {
    title: 'Confirm Duplication',
    message: `Are you sure you want to duplicate the questionnaire "${questionnaire.name}"? A new draft will be created.`,
    action: 'duplicate',
    confirmText: 'Duplicate',
    confirmColor: 'bg-blue-600 hover:bg-blue-700',
  }
  showConfirmModal.value = true
}

function handleConfirm() {
  if (!selectedQuestionnaire.value) return
  if (modalConfig.value.action === 'delete') {
    questionnairesStore.deleteQuestionnaire(selectedQuestionnaire.value.id)
    showToast('Questionnaire deleted successfully.', 'success')
  } else if (modalConfig.value.action === 'duplicate') {
    questionnairesStore.duplicateQuestionnaire(selectedQuestionnaire.value.id)
    showToast('Questionnaire duplicated successfully.', 'success')
  }
  cancelAction()
}

function cancelAction() {
  showConfirmModal.value = false
  selectedQuestionnaire.value = null
}

/**
 * Navigates to the selected user's dashboard in an admin-view mode.
 * @param {object} business The business object, which must be a real user.
 */
function viewBusinessDashboard(business) {
  if (!business.isRealUser) return
  // Extract the user ID from the business object's ID (e.g., 'user-xyz' -> 'xyz')
  const userId = business.id.replace('user-', '')
  router.push({
    name: 'dashboard',
    query: { viewAsAdmin: 'true', userId: userId },
  })
}

/**
 * Logs out the admin and navigates to the home page.
 */
function logout() {
  console.log('Admin logged out')
  authStore.logout() // Use the store's logout action
  router.push('/login') // Redirect to login page after logout
}

// Set the main scroll container for the AppFooter's Back to Top button
onMounted(() => {
  if (mainContent.value) {
    mainContent.value.addEventListener('scroll', handleScroll)
  }
  uiStore.setMainScrollContainer(mainContent.value)
})

onBeforeUnmount(() => {
  if (mainContent.value) {
    mainContent.value.removeEventListener('scroll', handleScroll)
  }
  uiStore.setMainScrollContainer(null)
})

const handleScroll = () => {
  showScrollTopButton.value = mainContent.value && mainContent.value.scrollTop > 400
}

const scrollToTop = () => {
  mainContent.value?.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}
</script>

<template>
  <!-- Main container for the admin dashboard: full height, light gray background -->
  <div class="h-screen bg-gray-100 font-sans flex flex-col">
    <!-- Admin Dashboard Header: White background, shadow, flex layout for alignment -->
    <header
      class="bg-white shadow-sm py-4 px-6 flex justify-between items-center sticky top-0 z-20"
    >
      <div class="flex items-center">
        <!-- NET TRIAD Admin link now correctly points to the admin dashboard -->
        <RouterLink to="/admin/dashboard" class="text-2xl font-bold text-gray-800"
          ><span class="text-blue-600">NET</span> T<span class="text-blue-600">R</span>I<span
            class="text-blue-600"
            >A</span
          >D <span class="text-blue-600">Admin</span></RouterLink
        >
      </div>
      <nav class="flex items-center space-x-4">
        <button
          @click="addNewQuestionnaire"
          class="px-4 py-2 cursor-pointer rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors duration-200"
        >
          Add New Questionnaire
        </button>
        <button
          @click="logout"
          class="px-4 py-2 cursor-pointer rounded-md text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
        >
          Logout
        </button>
      </nav>
    </header>

    <!-- Main Content Area: Centered, padded, responsive -->
    <main ref="mainContent" class="flex-grow overflow-y-auto">
      <div class="container mx-auto px-6 py-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

        <!-- Overview Cards: Grid layout for key metrics -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <!-- Total Users Card -->
          <div class="bg-white rounded-lg shadow p-6 text-center">
            <h3 class="text-xl font-semibold text-gray-700 mb-2">Total Users</h3>
            <p class="text-5xl font-extrabold text-blue-600">
              {{ authStore.users.filter((u) => !u.isAdmin).length }}
            </p>
          </div>
          <!-- Active Assessments Card -->
          <div class="bg-white rounded-lg shadow p-6 text-center">
            <h3 class="text-xl font-semibold text-gray-700 mb-2">Active Assessments</h3>
            <p class="text-5xl font-extrabold text-purple-600">{{ activeAssessments }}</p>
          </div>
          <!-- Pending Approvals Card -->
          <div class="bg-white rounded-lg shadow p-6 text-center">
            <h3 class="text-xl font-semibold text-gray-700 mb-2">Pending Approvals</h3>
            <p class="text-5xl font-extrabold text-yellow-600">{{ pendingApprovals }}</p>
          </div>
        </div>

        <!-- Business Management Section: Split into 2 columns with progress bars -->
        <section class="bg-white rounded-lg shadow p-6 mb-8">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4">
            Business Overview and Management
          </h2>
          <div class="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <input
              type="text"
              v-model="searchTerm"
              placeholder="Search businesses..."
              class="w-full sm:w-1/3 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <div class="flex items-center flex-wrap gap-2">
              <span class="mr-2 text-sm font-medium">Sort by:</span>
              <button
                @click="toggleSort('score')"
                :class="[
                  'px-3 py-1 text-sm rounded-full cursor-pointer',
                  sortKey === 'score' ? 'bg-blue-600 text-white' : 'bg-gray-200',
                ]"
              >
                Score
                <span v-if="sortKey === 'score'">{{ sortOrder === 0 ? ' ▲' : ' ▼' }}</span>
              </button>
              <button
                @click="toggleSort('name')"
                :class="[
                  'px-3 py-1 text-sm rounded-full cursor-pointer',
                  sortKey === 'name' ? 'bg-blue-600 text-white' : 'bg-gray-200',
                ]"
              >
                Name
                <span v-if="sortKey === 'name'">{{ sortOrder === 0 ? ' ▲' : ' ▼' }}</span>
              </button>
              <button
                @click="toggleSort('location')"
                :class="[
                  'px-3 py-1 text-sm rounded-full cursor-pointer',
                  sortKey === 'location' ? 'bg-blue-600 text-white' : 'bg-gray-200',
                ]"
              >
                Location
                <span v-if="sortKey === 'location'">{{ sortOrder === 0 ? ' ▲' : ' ▼' }}</span>
              </button>
              <button
                @click="toggleSort('type')"
                :class="[
                  'px-3 py-1 text-sm rounded-full cursor-pointer',
                  sortKey === 'type' ? 'bg-blue-600 text-white' : 'bg-gray-200',
                ]"
              >
                Type
                <span v-if="sortKey === 'type'">{{ sortOrder === 0 ? ' ▲' : ' ▼' }}</span>
              </button>
            </div>
          </div>

          <!-- Split view for Business List and Category Scores with Progress Bars -->
          <div class="flex flex-col lg:flex-row gap-6">
            <!-- Left Side: Business List (Scrollable) -->
            <div
              class="w-full lg:w-1/2 h-96 overflow-y-auto custom-scrollbar bg-gray-50 p-4 pt-0 rounded-lg border border-gray-200"
            >
              <h3
                class="text-lg font-semibold text-gray-800 mb-4 sticky top-0 bg-gray-50 py-2 z-10"
              >
                Business List
              </h3>
              <ul class="space-y-3">
                <li
                  v-for="biz in filteredAndSortedBusinesses"
                  :key="biz.id"
                  @click="selectBusinessForScores(biz)"
                  class="p-4 rounded-lg hover:bg-white cursor-pointer flex items-center justify-between border border-gray-200 transition-colors duration-200"
                  :class="{
                    'bg-blue-100 border-blue-300 shadow-sm':
                      selectedBusinessForScores && selectedBusinessForScores.id === biz.id,
                  }"
                >
                  <div class="flex items-center truncate">
                    <span class="font-bold text-gray-400 mr-4 w-6 text-center flex-shrink-0">{{
                      biz.rank
                    }}</span>
                    <div>
                      <p class="font-bold text-gray-900 text-lg flex items-center">
                        {{ biz.name }}
                        <span v-if="biz.isRealUser" title="Registered User" class="ml-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-4 w-4 text-blue-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                          </svg>
                        </span>
                      </p>
                      <p class="text-sm text-gray-600">{{ biz.location }} - {{ biz.type }}</p>
                    </div>
                  </div>
                  <div
                    class="flex flex-col items-end space-y-1 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 flex-shrink-0 ml-2"
                  >
                    <span
                      class="font-extrabold text-xl"
                      :class="
                        biz.score > 75
                          ? 'text-green-600'
                          : biz.score > 50
                            ? 'text-yellow-600'
                            : 'text-red-600'
                      "
                    >
                      {{ typeof biz.score === 'number' ? biz.score.toFixed(1) : biz.score }}
                    </span>
                    <span
                      :class="[
                        'px-3 py-1 text-xs font-semibold rounded-full',
                        biz.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800',
                      ]"
                    >
                      {{ biz.status }}
                    </span>
                  </div>
                </li>
              </ul>
              <div
                v-if="filteredAndSortedBusinesses.length === 0"
                class="text-center py-8 text-gray-500"
              >
                No businesses found matching your criteria.
              </div>
            </div>

            <!-- Right Side: Category Scores with Progress Bars (shows for selectedBusinessForScores) -->
            <div
              class="w-full lg:w-1/2 bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col justify-start"
              v-if="selectedBusinessForScores"
            >
              <div class="flex flex-col sm:flex-row justify-between items-start mb-2">
                <div>
                  <h3 class="text-6xl sm:text-8xl font-bold text-green-600 mb-2">
                    {{
                      typeof selectedBusinessForScores.score === 'number'
                        ? selectedBusinessForScores.score.toFixed(1)
                        : selectedBusinessForScores.score
                    }}
                  </h3>
                  <p class="text-lg sm:text-xl font-bold text-yellow-600 mb-4">
                    {{ selectedBusinessForScores.name }}'s Scores
                  </p>
                </div>
                <button
                  v-if="selectedBusinessForScores.isRealUser"
                  @click="viewBusinessDashboard(selectedBusinessForScores)"
                  class="cursor-pointer flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm self-start sm:self-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fill-rule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span>View Business</span>
                </button>
              </div>
              <div class="space-y-2">
                <div
                  v-for="(category, index) in selectedBusinessForScores.categoryScores"
                  :key="category.key || index"
                >
                  <p class="text-sm font-medium text-gray-700 mb-1">{{ category.name }}</p>
                  <div class="w-full bg-gray-200 rounded-full h-4">
                    <div
                      class="h-full rounded-full flex items-center justify-end pr-2 text-xs font-bold text-white transition-all duration-500"
                      :class="{
                        'bg-green-500': category.score >= 85,
                        'bg-emerald-500': category.score >= 75 && category.score < 85,
                        'bg-yellow-500': category.score >= 65 && category.score < 75,
                        'bg-orange-500': category.score >= 50 && category.score < 65,
                        'bg-red-500': category.score < 50,
                      }"
                      :style="{ width: `${category.score}%` }"
                    >
                      {{ category.score }}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              v-else
              class="w-full lg:w-1/2 bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500"
            >
              Select a business from the list to view its category scores.
            </div>
          </div>
        </section>

        <!-- Questionnaire Management Section -->
        <section class="bg-white rounded-lg shadow p-6">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4">Questionnaire Management</h2>
          <div class="mb-4">
            <button
              @click="addNewQuestionnaire"
              class="px-5 py-2 bg-blue-600 cursor-pointer text-white rounded-md font-semibold hover:bg-blue-700 transition-colors duration-200"
            >
              Create New Questionnaire
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="hidden md:table min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Questions
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Last Updated
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th scope="col" class="relative px-6 py-3">
                    <span class="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="q in questionnaires" :key="q.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ q.name }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ q.questionsCount }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ q.lastUpdated.replace('T', ' ').substring(0, 16) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="[
                        'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                        q.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800',
                      ]"
                    >
                      {{ q.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex items-center justify-end space-x-4">
                      <button
                        @click="editQuestionnaire(q)"
                        class="text-indigo-600 cursor-pointer hover:text-indigo-900 transition-colors duration-200"
                      >
                        Edit
                      </button>
                      <button
                        @click="promptDuplicate(q)"
                        class="text-blue-600 cursor-pointer hover:text-blue-900 transition-colors duration-200"
                      >
                        Duplicate
                      </button>
                      <button
                        @click="promptDelete(q)"
                        class="text-red-600 cursor-pointer hover:text-red-900 transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <!-- Mobile Card View for Questionnaires -->
            <div class="md:hidden space-y-3 p-1">
              <div
                v-for="q in questionnaires"
                :key="q.id"
                class="bg-white p-4 rounded-lg shadow-md border border-gray-200"
              >
                <div class="flex justify-between items-start">
                  <div class="flex-grow pr-4">
                    <h3 class="font-bold text-gray-800">{{ q.name }}</h3>
                    <p class="text-sm text-gray-500">{{ q.questionsCount }} questions</p>
                    <p class="text-xs text-gray-400 mt-1">
                      Updated: {{ q.lastUpdated.replace('T', ' ').substring(0, 10) }}
                    </p>
                  </div>
                  <div class="flex items-center space-x-2 flex-shrink-0">
                    <button
                      @click="editQuestionnaire(q)"
                      class="p-2 text-indigo-600 hover:text-indigo-800 transition-colors rounded-full hover:bg-gray-100"
                      title="Edit Questionnaire"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"
                        />
                        <path
                          fill-rule="evenodd"
                          d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      @click="promptDuplicate(q)"
                      class="p-2 text-blue-600 hover:text-blue-800 transition-colors rounded-full hover:bg-gray-100"
                      title="Duplicate Questionnaire"
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
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                    <button
                      @click="promptDelete(q)"
                      class="p-2 text-red-500 hover:text-red-700 transition-colors rounded-full hover:bg-gray-100"
                      title="Delete Questionnaire"
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
                </div>

                <div class="mt-3">
                  <span
                    :class="[
                      'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                      q.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800',
                    ]"
                  >
                    {{ q.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
    <!-- Confirmation Modal -->
    <transition name="fade">
      <div
        v-if="showConfirmModal"
        class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
      >
        <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full relative">
          <h3 class="text-xl font-bold text-gray-800 mb-4">{{ modalConfig.title }}</h3>
          <p class="text-gray-600 mb-6">{{ modalConfig.message }}</p>
          <div class="flex justify-end space-x-4">
            <button
              @click="cancelAction"
              class="px-6 py-2 cursor-pointer font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="handleConfirm"
              class="px-6 py-2 cursor-pointer font-semibold text-white rounded-md transition-colors"
              :class="modalConfig.confirmColor"
            >
              {{ modalConfig.confirmText }}
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
        class="fixed bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all z-50"
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
/*
  Scoped styles for the flash-out-fade transition specific to this component.
  This defines how the modal will fade out.
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
</style>
