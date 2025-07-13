<!-- src/components/AppHeader.vue -->
<script setup>
import { ref, computed } from 'vue'
import { useQuestionnairesStore } from '@/stores/questionnaires'
import { useAuthStore } from '@/stores/auth' // Import the auth store
import { RouterLink, useRouter, useRoute } from 'vue-router'

// Define props to control the header's appearance and behavior
const props = defineProps({
  // showNewAssessment prop is still relevant for controlling the "New Assessment" button visibility
  // The type of assessment, to be displayed on the Questionnaire page
  assessmentType: {
    type: String,
    default: '',
  },
  // Controls visibility of the assessment type dropdown on the Questionnaire page
  showAssessmentTypeMenu: {
    type: Boolean,
    default: false,
  },
  // Controls the visibility of the "New Assessment" button on logged-in pages
  showNewAssessment: {
    type: Boolean,
  },
})

// Define emits for custom events, such as logging out
const emit = defineEmits(['logout', 'change-assessment', 'request-new-assessment-modal'])

const router = useRouter()
const route = useRoute()

// Initialize the auth store
const authStore = useAuthStore()

const questionnairesStore = useQuestionnairesStore()

// Reactive state to toggle the user settings dropdown menu
const showSettingsMenu = ref(false)
const showAssessmentMenu = ref(false)
const isMobileMenuOpen = ref(false)

const activeAssessments = computed(() =>
  questionnairesStore.questionnaires
    .filter((q) => q.status === 'Active')
    .map((q) => ({
      name: q.name,
    })),
)
/**
 * Toggles the visibility of the user settings dropdown menu.
 */
function toggleSettingsMenu() {
  showSettingsMenu.value = !showSettingsMenu.value
}

/**
 * Toggles the visibility of the assessment dropdown menu.
 */
function toggleAssessmentMenu() {
  showAssessmentMenu.value = !showAssessmentMenu.value
}

/**
 * Toggles the visibility of the mobile navigation menu.
 */
function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function changeAssessment(type) {
  showAssessmentMenu.value = false
  emit('change-assessment', type)
}

function openNewAssessmentModalFromMobile() {
  isMobileMenuOpen.value = false // Close the hamburger menu
  emit('request-new-assessment-modal')
}

/**
 * Handles the user logout process.
 * Emits a 'logout' event to the parent component to handle global state change.
 */
function handleLogout() {
  showSettingsMenu.value = false // Close menu
  authStore.logout() // Use the store's logout action
  router.push('/login')
}
</script>

<template>
  <header class="bg-white shadow-md w-full sticky top-0 z-40">
    <div class="container mx-auto px-6 py-3">
      <nav class="flex items-center justify-between">
        <!-- Logged-Out Navigation State -->
        <template v-if="!authStore.isAuthenticated">
          <RouterLink
            to="/"
            class="text-2xl font-bold text-black-600 hover:text-blue-700 transition-colors"
          >
            N<span class="text-blue-600">E</span>T TR<span class="text-blue-600">I</span>AD
          </RouterLink>
          <div class="hidden md:flex items-center space-x-6">
            <RouterLink
              to="/about"
              class="text-gray-600 cursor-pointer hover:text-blue-600 transition-colors"
              >About Us</RouterLink
            >
            <RouterLink
              to="/login"
              class="text-gray-600 cursor-pointer hover:text-blue-600 transition-colors"
              >Login</RouterLink
            >
            <RouterLink
              to="/login"
              class="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Get Started
            </RouterLink>
          </div>
          <!-- Mobile Menu Button (Hamburger) -->
          <div class="md:hidden">
            <button @click="toggleMobileMenu" class="focus:outline-none">
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
                  d="M4 6h16M4 12h16m-7 6h7"
                ></path>
              </svg>
            </button>
          </div>
        </template>

        <!-- Logged-In Navigation State (as per your request) -->
        <template v-else>
          <!-- Left side: Logo-like text which links to the Dashboard -->
          <RouterLink to="/dashboard" class="text-xl font-bold text-gray-800 hover:text-blue-600">
            N<span class="text-blue-600">E</span>T TR<span class="text-blue-600">I</span>AD
            <span class="text-blue-600">User</span>
          </RouterLink>

          <!-- Right side: User controls -->
          <div class="flex items-center space-x-4">
            <!-- New Assessment Dropdown (for Dashboard) -->
            <div v-if="showNewAssessment" class="relative">
              <button
                @click="toggleAssessmentMenu"
                class="hidden sm:inline-flex cursor-pointer items-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                New Assessment
              </button>
              <transition name="fade">
                <div
                  v-if="showAssessmentMenu"
                  class="absolute right-0 mt-2 w-50 bg-white rounded-md shadow-xl z-50 py-1"
                  @click.away="showAssessmentMenu = false"
                >
                  <RouterLink
                    v-for="assessment in activeAssessments"
                    :key="assessment.name"
                    :to="{ name: 'questionnaire', params: { type: assessment.name } }"
                    @click="showAssessmentMenu = false"
                    class="block w-full cursor-pointer text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                  >
                    {{ assessment.name }}
                  </RouterLink>
                </div>
              </transition>
            </div>

            <!-- Change Assessment Type Dropdown (for Questionnaire) -->
            <div v-if="showAssessmentTypeMenu" class="relative">
              <button
                @click="toggleAssessmentMenu"
                class="flex items-center cursor-pointer text-gray-600 hover:text-blue-600 transition-colors"
              >
                <span class="font-semibold">Change Assessment</span>
                <svg class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </button>
              <transition name="fade">
                <div
                  v-if="showAssessmentMenu"
                  class="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-xl z-50 py-1"
                  @click.away="showAssessmentMenu = false"
                >
                  <button
                    v-for="assessment in activeAssessments"
                    :key="assessment.name"
                    @click="changeAssessment(assessment.name)"
                    :disabled="assessment.name === assessmentType"
                    class="block w-full text-left px-4 py-2 text-sm transition-colors"
                    :class="{
                      'bg-blue-100 text-blue-700 font-bold cursor-not-allowed':
                        assessment.name === assessmentType,
                      'text-gray-700 hover:bg-blue-50 cursor-pointer':
                        assessment.name !== assessmentType,
                    }"
                  >
                    {{ assessment.name }}
                  </button>
                </div>
              </transition>
            </div>

            <!-- Settings Icon and Dropdown Menu -->
            <div class="relative">
              <button
                @click="toggleSettingsMenu"
                class="focus:outline-none cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg
                  class="w-6 h-6 text-gray-600 cursor-pointer"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  ></path>
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                </svg>
              </button>
              <!-- Dropdown Menu Content -->
              <transition name="fade">
                <div
                  v-if="showSettingsMenu"
                  class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-50 py-1"
                  @click.away="showSettingsMenu = false"
                >
                  <!-- Conditionally show "Dashboard" or "Link Accounts" based on the current page -->
                  <RouterLink
                    v-if="route.name !== 'linkAccounts'"
                    to="/link-accounts"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                    >Link Accounts</RouterLink
                  >
                  <RouterLink
                    v-else
                    to="/dashboard"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                    >Dashboard</RouterLink
                  >
                  <button
                    @click="handleLogout"
                    href="#"
                    class="block w-full cursor-pointer text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                  >
                    Logout
                  </button>
                </div>
              </transition>
            </div>
          </div>
        </template>
      </nav>
    </div>
    <!-- Mobile Menu Content -->
    <transition name="fade">
      <div
        v-if="isMobileMenuOpen"
        class="md:hidden bg-white shadow-lg absolute top-full left-0 w-full z-30"
      >
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <RouterLink
            to="/about"
            @click="toggleMobileMenu"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >About Us</RouterLink
          >
          <RouterLink
            to="/login"
            @click="toggleMobileMenu"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >Login</RouterLink
          >
          <RouterLink
            to="/login"
            @click="toggleMobileMenu"
            class="block w-full text-center mt-2 px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
            >Get Started</RouterLink
          >
          <!-- New Assessment button for logged-in mobile users -->
          <button
            v-if="authStore.isAuthenticated"
            @click="openNewAssessmentModalFromMobile"
            class="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
          >
            New Assessment
          </button>
        </div>
      </div>
    </transition>
  </header>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-in-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
