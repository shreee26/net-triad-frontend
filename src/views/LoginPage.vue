<!-- src/views/LoginPage.vue - Updated with comprehensive registration fields, improved responsiveness, and NET TRIAD header link -->
<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth' // Import the auth store
import { useRouter, RouterLink } from 'vue-router' // Import RouterLink for navigation

// Initialize the router
const router = useRouter()

// Reactive properties for login/registration forms
const username = ref('')
const password = ref('')
const confirmPassword = ref('') // For registration
const companyName = ref('') // For registration
const companyDescription = ref('') // For registration
const address = ref('') // For registration
const city = ref('') // For registration
const businessType = ref('') // For registration
const firstName = ref('') // For registration
const lastName = ref('') // For registration
const registrationUserName = ref('') // For registration
const email = ref('') // For registration

// Template refs for autofocus
const loginUsernameInput = ref(null)
const registerCompanyNameInput = ref(null)

// Password visibility states
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const showLoginPassword = ref(false)

const errorMessage = ref('') // To display form errors

// Reactive property to control which tab is active: 'login' or 'register'
const activeTab = ref('login') // Default to showing the login form

// Initialize the auth store
const authStore = useAuthStore()

// List of business types for autocomplete
const businessTypes = ref([
  'AI/ML',
  'Creative Agency',
  'Data Analytics',
  'E-commerce',
  'Education Technology (EdTech)',
  'Trading',
  'Fintech',
  'IT Services & Consulting',
  'Logistics & Supply Chain',
  'Marketing & Advertising',
  'SaaS (Software as a Service)',
  'Finance & Accounting',
  'Healthcare & Wellness',
  'Real Estate & PropTech',
  'Recruitment & HR Tech',
  'Management Consulting',
  'Manufacturing',
  'Retail (Brick & Mortar)',
  'Hospitality (Hotels, Restaurants)',
  'Legal Services & LegalTech',
  'Biotechnology & Life Sciences',
  'Gaming & Entertainment',
  'Media & Publishing',
  'Telecommunications',
  'Energy & Utilities',
  'Automotive',
  'Construction',
  'Travel & Tourism',
  'Cybersecurity',
  'Non-Profit & Charity',
])

const showBusinessTypeOptions = ref(false)

const filteredBusinessTypes = computed(() => {
  if (!businessType.value) {
    return businessTypes.value
  }
  return businessTypes.value.filter((type) =>
    type.toLowerCase().includes(businessType.value.toLowerCase()),
  )
})

function selectBusinessType(type) {
  businessType.value = type
  showBusinessTypeOptions.value = false
}

/**
 * Generates a strong password suggestion using Google's password strength guidelines
 */
function generateStrongPassword() {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'

  let password = ''

  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]

  // Fill the rest with random characters
  const allChars = lowercase + uppercase + numbers + symbols
  for (let i = 4; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Shuffle the password
  password = password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('')

  return password
}

/**
 * Suggests a strong password and fills both password fields
 */
function suggestStrongPassword() {
  const suggestedPassword = generateStrongPassword()
  password.value = suggestedPassword
  confirmPassword.value = suggestedPassword
}

/**
 * Handles the login attempt using the new user management system.
 */
async function handleLogin() {
  errorMessage.value = '' // Clear previous error messages

  try {
    // Use the new login system, which can throw an error
    const response = await authStore.login(username.value, password.value)

    // *** FIX: Check the 'isAdmin' property on the nested user object ***
    if (response && response.success) {
      if (response.user.isAdmin) {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }
    }
  } catch (error) {
    console.error('Login failed:', error.message) // Log the specific error for developers
    errorMessage.value = 'Invalid username or password.' // Show a generic message to the user
  }
}

/**
 * Handles the registration attempt using the new user management system.
 */
async function handleRegister() {
  errorMessage.value = '' // Clear previous error messages

  // Basic validation for demonstration (can be extended)
  if (
    !companyName.value ||
    !email.value ||
    !password.value ||
    !confirmPassword.value ||
    !firstName.value ||
    !lastName.value
  ) {
    errorMessage.value = 'Please fill in all required fields.'
    return
  }
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.'
    return
  }
  if (password.value.length < 8) {
    errorMessage.value = 'Password must be at least 8 characters long.'
    return
  }

  // Check if user already exists
  const existingUser = authStore.users.find(
    (u) => u.email === email.value || u.username === registrationUserName.value,
  )

  if (existingUser) {
    errorMessage.value = 'A user with this email or username already exists.'
    return
  }

  // Create user data object
  const userData = {
    // FIX: Use the correct property names (userName, userFullName) expected by the auth store.
    userName: registrationUserName.value || email.value.split('@')[0],
    password: password.value,
    userFullName: `${firstName.value} ${lastName.value}`.trim(),
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
    companyName: companyName.value,
    companyDescription: companyDescription.value,
    address: address.value,
    city: city.value,
    businessType: businessType.value,
    isAdmin: false,
  }

  try {
    // Step 1: Register the user using the new system
    authStore.register(userData)

    // Step 2: Immediately log the new user in to create an active session.
    await authStore.login(userData.userName, userData.password)

    // Step 3: Redirect to the dashboard, now with an active session.
    await router.push('/dashboard')
  } catch (error) {
    errorMessage.value = 'Registration failed. Please try again.'
    console.error('Registration error:', error)
  }
}

/**
 * Switches the active form tab and clears messages/inputs for a cleaner UX.
 * @param {string} tab The tab to switch to ('login' or 'register').
 */
function switchTab(tab) {
  activeTab.value = tab
  errorMessage.value = '' // Clear error message when switching tabs
  // Clear all fields when switching tabs
  username.value = ''
  password.value = ''
  confirmPassword.value = ''
  companyName.value = ''
  companyDescription.value = ''
  address.value = ''
  city.value = ''
  businessType.value = ''
  firstName.value = ''
  lastName.value = ''
  registrationUserName.value = ''
  email.value = ''
  // Reset password visibility
  showPassword.value = false
  showConfirmPassword.value = false
  showLoginPassword.value = false
}

onMounted(() => {
  // Autofocus the login username field when the component mounts
  loginUsernameInput.value?.focus()
})

watch(activeTab, (newTab) => {
  // When the tab switches, wait for the DOM to update, then focus the correct input.
  nextTick(() => {
    if (newTab === 'login') {
      loginUsernameInput.value?.focus()
    } else if (newTab === 'register') {
      registerCompanyNameInput.value?.focus()
    }
  })
})
</script>

<template>
  <!-- Main container for the login/registration page -->
  <!-- Min-h-screen for full height, bg-gray-100 for background.
         Flex-col for vertical stacking, items-center & justify-center for centering content.
         P-6 for general padding, font-sans for font family. -->
  <div
    class="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans"
  >
    <!-- NET TRIAD Logo/Link at the top, styled like the company icon, links to homepage -->
    <!-- Max-w-md for max width on larger screens, mx-auto for centering, mb-8 for margin-bottom.
             Flex for inner alignment, rounded-lg and shadow-sm for styling. -->
    <RouterLink to="/" class="cursor-pointer text-3xl font-bold text-gray-800 mb-6 inline-block">
      N<span class="text-blue-600">E</span>T TR<span class="text-blue-600">I</span>AD
    </RouterLink>

    <!-- Main content area for forms -->
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <!-- Heading for the form section, dynamic based on active tab -->
      <h2 class="mt-6 text-center text-2xl font-extrabold text-gray-900">
        {{ activeTab === 'login' ? 'Sign in to your account' : 'Create a new account' }}
      </h2>
    </div>

    <!-- Form Container: white background, padding, shadow, rounded corners -->
    <!-- Max-w-md for max width, w-full ensures it takes full width up to max-w.
             The `flex flex-col` on the parent `div` combined with `items-center justify-center`
             should keep this centered vertically and horizontally on all screen sizes,
             with `max-w-md` limiting its absolute width on larger screens. -->
    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
        <!-- Tab Navigation Buttons -->
        <div class="flex border-b border-gray-200 mb-6">
          <button
            @click="switchTab('login')"
            :class="[
              'flex-1 py-2 cursor-pointer text-lg font-medium text-center transition-colors duration-200',
              activeTab === 'login'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700',
            ]"
          >
            Login
          </button>
          <button
            @click="switchTab('register')"
            :class="[
              'flex-1 py-2 cursor-pointer text-lg font-medium text-center transition-colors duration-200',
              activeTab === 'register'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700',
            ]"
          >
            Register
          </button>
        </div>

        <transition name="form-fade" mode="out-in">
          <!-- Login Form & Social Login -->
          <div v-if="activeTab === 'login'" key="login-view">
            <form class="space-y-6" @submit.prevent="handleLogin">
              <div>
                <label for="login-username" class="block text-sm font-medium text-gray-700">
                  Username or Email
                </label>
                <div class="mt-1">
                  <input
                    id="login-username"
                    name="username"
                    type="text"
                    autocomplete="username"
                    required="true"
                    v-model="username"
                    ref="loginUsernameInput"
                    class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label for="login-password" class="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div class="mt-1 relative">
                  <input
                    id="login-password"
                    name="password"
                    :type="showLoginPassword ? 'text' : 'password'"
                    autocomplete="current-password"
                    required
                    v-model="password"
                    class="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <button
                    v-if="password"
                    type="button"
                    @click="showLoginPassword = !showLoginPassword"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  >
                    <svg
                      v-if="showLoginPassword"
                      class="h-5 w-5 text-gray-400 hover:text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                    <svg
                      v-else
                      class="h-5 w-5 text-gray-400 hover:text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div v-if="errorMessage" class="text-red-600 text-sm text-center">
                {{ errorMessage }}
              </div>

              <div>
                <button
                  type="submit"
                  class="w-full cursor-pointer flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  Sign in
                </button>
              </div>
            </form>

            <!-- Separator for social login options -->
            <div class="mt-6">
              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-300"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-2 bg-white text-gray-500"> Or continue with </span>
                </div>
              </div>

              <!-- Social Login Buttons (Google, Facebook) -->
              <div class="mt-6 grid grid-cols-2 gap-3">
                <div>
                  <a
                    href="#"
                    class="w-full cursor-pointer flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <!-- Google Icon SVG (with full color) -->
                    <svg
                      class="w-5 h-5 mr-2"
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
                    Google
                  </a>
                </div>
                <div>
                  <a
                    href="#"
                    class="w-full cursor-pointer flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <!-- Facebook Icon SVG (with actual blue color) -->
                    <svg
                      class="w-5 h-5 mr-2"
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
                    Facebook
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Registration Form -->
          <form v-else key="register-view" class="space-y-4" @submit.prevent="handleRegister">
            <!-- Company Information -->
            <div>
              <label for="company-name" class="block text-sm font-medium text-gray-700">
                Company Name <span class="text-red-500">*</span>
              </label>
              <input
                id="company-name"
                name="companyName"
                type="text"
                v-model="companyName"
                required
                ref="registerCompanyNameInput"
                placeholder="e.g., Acme Corp"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label for="company-description" class="block text-sm font-medium text-gray-700">
                Company Description
              </label>
              <textarea
                id="company-description"
                name="companyDescription"
                rows="3"
                v-model="companyDescription"
                placeholder="e.g., Leading provider of innovative solutions."
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              ></textarea>
            </div>
            <div>
              <label for="address" class="block text-sm font-medium text-gray-700">
                Company Address
              </label>
              <input
                id="address"
                name="address"
                type="text"
                v-model="address"
                placeholder="e.g., 123 Business Lane"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label for="city" class="block text-sm font-medium text-gray-700">
                Company City
              </label>
              <input
                id="city"
                name="city"
                type="text"
                v-model="city"
                placeholder="e.g., London"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label for="business-type" class="block text-sm font-medium text-gray-700">
                Business Type
              </label>
              <div class="relative mt-1">
                <input
                  id="business-type"
                  name="businessType"
                  type="text"
                  v-model="businessType"
                  @focus="showBusinessTypeOptions = true"
                  @blur="window.setTimeout(() => (showBusinessTypeOptions = false), 200)"
                  autocomplete="off"
                  placeholder="e.g., Fintech"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <transition name="form-fade">
                  <div
                    v-if="showBusinessTypeOptions && filteredBusinessTypes.length > 0"
                    class="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg"
                  >
                    <ul>
                      <li
                        v-for="type in filteredBusinessTypes"
                        :key="type"
                        @click="selectBusinessType(type)"
                        class="px-3 py-2 cursor-pointer hover:bg-blue-50"
                      >
                        {{ type }}
                      </li>
                    </ul>
                  </div>
                </transition>
              </div>
            </div>

            <!-- Separator -->
            <div class="border-t border-gray-200 pt-4"></div>

            <!-- User Information -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="first-name" class="block text-sm font-medium text-gray-700">
                  First Name <span class="text-red-500">*</span>
                </label>
                <input
                  id="first-name"
                  name="firstName"
                  type="text"
                  v-model="firstName"
                  required
                  placeholder="e.g., John"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label for="last-name" class="block text-sm font-medium text-gray-700">
                  Last Name <span class="text-red-500">*</span>
                </label>
                <input
                  id="last-name"
                  name="lastName"
                  type="text"
                  v-model="lastName"
                  required
                  placeholder="e.g., Doe"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label for="contact-person" class="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="contact-person"
                name="registrationUserName"
                type="text"
                autocomplete="username"
                v-model="registrationUserName"
                placeholder="e.g., john.doe"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">
                Email Address <span class="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autocomplete="email"
                v-model="email"
                required
                placeholder="e.g., john.doe@example.com"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <!-- Password Fields with Google Suggestions -->
            <div>
              <label for="register-password" class="block text-sm font-medium text-gray-700">
                Password <span class="text-red-500">*</span>
              </label>
              <div class="mt-1 relative">
                <input
                  id="register-password"
                  name="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  v-model="password"
                  required
                  placeholder="e.g., SecureP@ssw0rd"
                  class="block w-full px-3 py-2 pr-20 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <div v-if="password" class="absolute inset-y-0 right-0 flex items-center pr-2">
                  <button
                    type="button"
                    @click="suggestStrongPassword"
                    class="text-blue-600 cursor-pointer hover:text-blue-800 text-xs font-medium mr-2"
                    title="Suggest strong password"
                  >
                    Suggest
                  </button>
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      v-if="showPassword"
                      class="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                    <svg
                      v-else
                      class="h-5 w-5 cursor-pointer"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label for="confirm-password" class="block text-sm font-medium text-gray-700">
                Confirm Password <span class="text-red-500">*</span>
              </label>
              <div class="mt-1 relative">
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  v-model="confirmPassword"
                  required
                  placeholder="e.g., SecureP@ssw0rd"
                  class="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                >
                  <svg
                    v-if="showConfirmPassword"
                    class="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    />
                  </svg>
                  <svg
                    v-else
                    class="h-5 w-5 text-gray-400 hover:text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div v-if="errorMessage" class="text-red-600 text-sm text-center">
              {{ errorMessage }}
            </div>

            <div class="pt-2">
              <button
                type="submit"
                class="w-full cursor-pointer flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
              >
                Register
              </button>
            </div>
          </form>
        </transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-fade-enter-active,
.form-fade-leave-active {
  transition:
    opacity 0.3s ease-in-out,
    transform 0.3s ease-in-out;
}
.form-fade-enter-from,
.form-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
