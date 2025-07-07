<!-- src/components/SystemTestPanel.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAssessmentStore } from '@/stores/assessment'
import { useReportsStore } from '@/stores/reports'
import { runApplicationTests, validateQuestionnaireData } from '@/utils/testUtils'
import { fullQuestionnaireData } from '@/api/mockData'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

// Store instances
const authStore = useAuthStore()
const assessmentStore = useAssessmentStore()
const reportsStore = useReportsStore()

// Test state
const testResults = ref(null)
const isRunningTests = ref(false)
const showDetails = ref(false)

// Test functions
const runAllTests = async () => {
  isRunningTests.value = true
  testResults.value = null

  try {
    // Create application context for testing
    const appContext = {
      authStore,
      assessmentStore,
      reportsStore,
      questions: fullQuestionnaireData,
      router: null, // We'll test router separately
    }

    // Run comprehensive tests
    const results = runApplicationTests(appContext)

    // Add additional tests
    results.tests.push(...(await runAdditionalTests()))

    // Calculate final results
    results.passed = results.tests.filter((t) => t.result === 'PASS').length
    results.failed = results.tests.filter((t) => t.result === 'FAIL').length
    results.success = results.failed === 0

    testResults.value = results
  } catch (error) {
    console.error('Error running tests:', error)
    testResults.value = {
      passed: 0,
      failed: 1,
      success: false,
      tests: [
        {
          name: 'Test Execution',
          result: 'FAIL',
          errors: [error.message],
        },
      ],
    }
  } finally {
    isRunningTests.value = false
  }
}

const runAdditionalTests = async () => {
  const additionalTests = []

  // Test questionnaire data validation
  try {
    const questionnaireValidation = validateQuestionnaireData(fullQuestionnaireData)
    additionalTests.push({
      name: 'Questionnaire Data Validation',
      result: questionnaireValidation.isValid ? 'PASS' : 'FAIL',
      errors: questionnaireValidation.errors || [],
    })
  } catch (error) {
    additionalTests.push({
      name: 'Questionnaire Data Validation',
      result: 'FAIL',
      errors: [error.message],
    })
  }

  // Test store integration
  try {
    // Test auth store methods
    const authMethods = ['login', 'logout', 'register']
    const authStoreValid = authMethods.every((method) => typeof authStore[method] === 'function')
    additionalTests.push({
      name: 'Auth Store Integration',
      result: authStoreValid ? 'PASS' : 'FAIL',
      errors: authStoreValid ? [] : ['Missing required auth store methods'],
    })
  } catch (error) {
    additionalTests.push({
      name: 'Auth Store Integration',
      result: 'FAIL',
      errors: [error.message],
    })
  }

  // Test assessment store methods
  try {
    const assessmentMethods = ['startDraft', 'updateDraft', 'clearDraft']
    const assessmentStoreValid = assessmentMethods.every(
      (method) => typeof assessmentStore[method] === 'function',
    )
    additionalTests.push({
      name: 'Assessment Store Integration',
      result: assessmentStoreValid ? 'PASS' : 'FAIL',
      errors: assessmentStoreValid ? [] : ['Missing required assessment store methods'],
    })
  } catch (error) {
    additionalTests.push({
      name: 'Assessment Store Integration',
      result: 'FAIL',
      errors: [error.message],
    })
  }

  // Test reports store methods
  try {
    const reportsMethods = ['addReport', 'deleteReport', 'getReportById']
    const reportsStoreValid = reportsMethods.every(
      (method) => typeof reportsStore[method] === 'function',
    )
    additionalTests.push({
      name: 'Reports Store Integration',
      result: reportsStoreValid ? 'PASS' : 'FAIL',
      errors: reportsStoreValid ? [] : ['Missing required reports store methods'],
    })
  } catch (error) {
    additionalTests.push({
      name: 'Reports Store Integration',
      result: 'FAIL',
      errors: [error.message],
    })
  }

  // Test localStorage functionality
  try {
    const testKey = 'system-test-key'
    const testValue = { test: 'data', timestamp: Date.now() }

    localStorage.setItem(testKey, JSON.stringify(testValue))
    const retrieved = JSON.parse(localStorage.getItem(testKey))
    localStorage.removeItem(testKey)

    const storageValid = JSON.stringify(retrieved) === JSON.stringify(testValue)
    additionalTests.push({
      name: 'LocalStorage Functionality',
      result: storageValid ? 'PASS' : 'FAIL',
      errors: storageValid ? [] : ['LocalStorage data corruption detected'],
    })
  } catch (error) {
    additionalTests.push({
      name: 'LocalStorage Functionality',
      result: 'FAIL',
      errors: [error.message],
    })
  }

  // Test computed properties
  try {
    const computedValid =
      typeof authStore.userName === 'string' &&
      typeof authStore.userFullName === 'string' &&
      typeof assessmentStore.hasActiveDraft === 'boolean' &&
      typeof reportsStore.hasDrafts === 'boolean'

    additionalTests.push({
      name: 'Computed Properties',
      result: computedValid ? 'PASS' : 'FAIL',
      errors: computedValid ? [] : ['Invalid computed properties'],
    })
  } catch (error) {
    additionalTests.push({
      name: 'Computed Properties',
      result: 'FAIL',
      errors: [error.message],
    })
  }

  return additionalTests
}

const closePanel = () => {
  emit('close')
}

const toggleDetails = () => {
  showDetails.value = !showDetails.value
}

// Run tests on mount if panel is shown
onMounted(() => {
  if (props.show) {
    runAllTests()
  }
})
</script>

<template>
  <transition name="modal-fade">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800">System Test Panel</h2>
          <button @click="closePanel" class="text-gray-400 hover:text-gray-600 transition-colors">
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

        <!-- Test Controls -->
        <div class="mb-6">
          <button
            @click="runAllTests"
            :disabled="isRunningTests"
            class="px-4 py-2 bg-blue-600 cursor-pointer text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              v-if="isRunningTests"
              class="animate-spin -ml-1 mr-2 h-4 w-4 inline"
              fill="none"
              viewBox="0 0 24 24"
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
            {{ isRunningTests ? 'Running Tests...' : 'Run All Tests' }}
          </button>
        </div>

        <!-- Test Results -->
        <div v-if="testResults" class="space-y-4">
          <!-- Summary -->
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold text-gray-800">Test Summary</h3>
                <p class="text-sm text-gray-600">
                  {{ testResults.passed }} passed, {{ testResults.failed }} failed
                </p>
              </div>
              <div class="flex items-center space-x-2">
                <span
                  :class="
                    testResults.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  "
                  class="px-3 py-1 rounded-full text-sm font-medium"
                >
                  {{ testResults.success ? 'ALL TESTS PASSED' : 'TESTS FAILED' }}
                </span>
                <button
                  @click="toggleDetails"
                  class="text-blue-600 hover:text-blue-700 cursor-pointer text-sm"
                >
                  {{ showDetails ? 'Hide Details' : 'Show Details' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Test Details -->
          <div v-if="showDetails" class="space-y-3">
            <div
              v-for="test in testResults.tests"
              :key="test.name"
              class="border rounded-lg p-4"
              :class="
                test.result === 'PASS' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              "
            >
              <div class="flex items-center justify-between">
                <h4 class="font-medium text-gray-800">{{ test.name }}</h4>
                <span
                  :class="
                    test.result === 'PASS'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  "
                  class="px-2 py-1 rounded text-xs font-medium"
                >
                  {{ test.result }}
                </span>
              </div>

              <div v-if="test.errors && test.errors.length > 0" class="mt-2">
                <p class="text-sm font-medium text-red-700 mb-1">Errors:</p>
                <ul class="text-sm text-red-600 space-y-1">
                  <li v-for="error in test.errors" :key="error" class="ml-4">• {{ error }}</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Recommendations -->
          <div
            v-if="testResults.failed > 0"
            class="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
          >
            <h4 class="font-medium text-yellow-800 mb-2">Recommendations</h4>
            <ul class="text-sm text-yellow-700 space-y-1">
              <li>• Check browser console for detailed error messages</li>
              <li>• Verify that all required dependencies are loaded</li>
              <li>• Ensure localStorage is available and working</li>
              <li>• Check that all store methods are properly implemented</li>
            </ul>
          </div>
        </div>

        <!-- No Results -->
        <div v-else-if="!isRunningTests" class="text-center py-8 text-gray-500">
          <svg
            class="w-12 h-12 mx-auto mb-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <p>Click "Run All Tests" to start system validation</p>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
