<!-- src/App.vue - Updated to manage global header/footer visibility and notification -->
<script setup>
import { computed, ref, provide, onMounted } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useReportsStore } from './stores/reports'
import AppHeader from './components/AppHeader.vue' // Global header component
import AppFooter from './components/AppFooter.vue' // Global footer component
import ToastNotification from '@/components/ToastNotification.vue'

const route = useRoute()
const authStore = useAuthStore()
const reportsStore = useReportsStore()

// Reactive state for global notifications
const toast = ref({
  show: false,
  message: '',
  type: 'info',
  duration: 3000,
})

// Provide toast function to all components
function showToast(message, type = 'info', duration = 3000) {
  toast.value = {
    show: true,
    message,
    type,
    duration,
  }
}

function hideToast() {
  toast.value.show = false
}

// Provide toast functions globally
provide('showToast', showToast)
provide('hideToast', hideToast)

// This onMounted hook is critical for correct application startup.
onMounted(() => {
  // 1. Check auth status first to identify the current user.
  authStore.checkAuthStatus()
  // 2. Load all reports from storage. The reportsStore's computed properties
  //    will now automatically filter this data for the identified user.
  reportsStore.loadReportsFromStorage()
})

/**
 * Computed property to determine if the global Header and Footer should be shown.
 * They should be hidden for specific full-page layouts like Login, Assessment, Report, and Admin Dashboard,
 * as these pages now contain their own headers or full-page content.
 */
const showGlobalHeaderAndFooter = computed(() => {
  // Use the auth store for login state if needed for global header logic
  // const authStore = useAuthStore()

  const noGlobalHeaderRoutes = [
    'login',
    'assessment',
    'dashboard',
    'questionnaire',
    'ReportViewerPage',
    'linkAccounts',
    'adminDashboard',
    'adminQuestionnaire', // Assuming this page also handles its own layout
  ]
  // Check if the current route name is in the list of routes that hide the global header/footer
  return !noGlobalHeaderRoutes.includes(route.name)
})
</script>

<template>
  <!-- Main application container, ensures full screen height using flexbox -->
  <div class="flex flex-col min-h-screen">
    <!-- Global Header: Only shown if showGlobalHeaderAndFooter is true -->
    <AppHeader v-if="showGlobalHeaderAndFooter" />

    <!-- Main content area: flex-grow ensures it takes available space, pushing footer to bottom -->
    <main class="flex-grow">
      <!-- Vue Router View: Renders the active route component -->
      <!-- Transition wrapper for smooth page transitions (fade effect) -->
      <router-view :key="$route.fullPath" v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Global Footer: Only shown if showGlobalHeaderAndFooter is true -->
    <AppFooter v-if="showGlobalHeaderAndFooter" />

    <!-- Global Toast Notification -->
    <ToastNotification
      :show="toast.show"
      :message="toast.message"
      :type="toast.type"
      :duration="toast.duration"
      @close="hideToast"
    />
  </div>
</template>

<style>
/* Global styles defined in src/assets/main.css are imported via main.js */
/* No additional scoped styles needed here, as main.css handles app-wide styles */
</style>
