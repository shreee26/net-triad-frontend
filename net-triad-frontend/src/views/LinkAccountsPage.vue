<!-- src/views/LinkAccountsPage.vue - Updated with standard header and footer -->
<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth' // Import the auth store
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const router = useRouter()

const authStore = useAuthStore() // Initialize the auth store

/**
 * Simulates linking a Google account. In a real application, this would
 * involve OAuth flows.
 */
function linkGoogleAccount() {
  alert('Simulating Google account linking...')
  // Implement actual Google OAuth flow here
}

/**
 * Simulates linking a Facebook account. In a real application, this would
 * involve OAuth flows.
 */
function linkFacebookAccount() {
  alert('Simulating Facebook account linking...')
  // Implement actual Facebook OAuth flow here
}

/**
 * Navigates back to the user dashboard.
 */
function goToDashboard() {
  router.push('/dashboard')
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col font-sans">
    <!-- The AppHeader is used here, with the "New Assessment" button hidden as requested -->
    <AppHeader :show-new-assessment="false" />
    <main class="flex-grow flex flex-col items-center justify-center p-6">
      <div class="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 md:p-12 my-8 text-center">
        <h1 class="text-3xl md:text-4xl font-bold text-blue-700 mb-6">Link Your Social Accounts</h1>
        <p class="text-lg text-gray-600 mb-8">
          Connect your social media accounts for easier login and personalized services.
        </p>

        <div class="space-y-6 max-w-sm mx-auto">
          <!-- Link Google Account Button -->
          <button
            @click="linkGoogleAccount"
            class="w-full flex cursor-pointer items-center justify-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
          >
            <svg
              class="w-6 h-6 mr-3"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M44.5 24.5C44.5 23.01 44.38 21.57 44.13 20.18H24V28.82H35.8C35.29 31.81 33.51 34.34 31.06 36.02L31.02 36.06L38.45 41.6L38.54 41.69C43.08 37.5 45.5 31.32 45.5 24.5H44.5Z"
                fill="#4285F4"
              />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M24 45.5C29.62 45.5 34.58 43.6 38.54 40.69L31.02 36.06C29.21 37.26 26.8 37.98 24 37.98C18.52 37.98 13.88 34.34 12.29 29.35L12.24 29.43L4.85 34.98L4.76 35.07C7.38 40.23 15.11 45.5 24 45.5Z"
                fill="#34A853"
              />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M12.29 29.35C11.75 27.96 11.45 26.5 11.45 25C11.45 23.5 11.75 22.04 12.29 20.65L12.24 20.57L4.76 15.02L4.67 14.93C1.72 17.84 0 21.28 0 25C0 28.72 1.72 32.16 4.67 35.07L12.29 29.35Z"
                fill="#FBBC04"
              />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M24 10.42C26.78 10.42 29.2 11.45 31.04 13.1L37.1 7.04C34.58 4.79 31.3 3.5 24 3.5C15.11 3.5 7.38 8.77 4.76 13.93L12.29 19.53C13.88 14.54 18.52 10.9 24 10.9V10.42Z"
                fill="#EA4335"
              />
            </svg>
            Link with Google
          </button>

          <!-- Link Facebook Account Button -->
          <button
            @click="linkFacebookAccount"
            class="w-full flex items-center cursor-pointer justify-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
          >
            <svg
              class="w-6 h-6 mr-3"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M22.0001 12.0001C22.0001 6.47721 17.5229 2.00007 12.0001 2.00007C6.47721 2.00007 2.00007 6.47721 2.00007 12.0001C2.00007 17.0298 5.76566 21.1332 10.5501 21.8767V14.2858H7.77783V12.0001H10.5501V10.2081C10.5501 7.42084 12.1158 5.86708 14.7951 5.86708C16.0827 5.86708 17.3702 6.09673 17.3702 6.09673V8.86897H15.9329C14.6738 8.86897 14.2858 9.61033 14.2858 10.3929V12.0001H17.2064L16.7328 14.2858H14.2858V21.8767C19.0703 21.1332 22.0001 17.0298 22.0001 12.0001Z"
                fill="#1877F2"
              />
            </svg>
            Link with Facebook
          </button>
        </div>

        <button
          @click="goToDashboard"
          class="mt-10 bg-blue-600 cursor-pointer text-white font-semibold py-3 px-8 rounded-full hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-md"
        >
          Back to Dashboard
        </button>
      </div>
    </main>
    <AppFooter />
  </div>
</template>
