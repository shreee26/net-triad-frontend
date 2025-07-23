<!-- src/views/HomePage.vue - Major rebuild based on new layout and grading requirements -->
<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '@/stores/auth' // Import the auth store
import { useAssessmentStore } from '@/stores/assessment' // Import the assessment store
import { useRouter } from 'vue-router'
import { mockRankings } from '@/api/mockData' // Assuming mockRankings is structured as per previous definition

// Initialize the router for programmatic navigation
const router = useRouter()

const showScrollTopButton = ref(false)

const handleScroll = () => {
  // Show button after scrolling down 400px
  showScrollTopButton.value = window.scrollY > 400
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})

const authStore = useAuthStore()
const reportsStore = useReportsStore()
const questionnairesStore = useQuestionnairesStore()

const rankings = computed(() => {
  // 1. Adjust mock businesses to ensure they have a B grade or higher
  const adjustedMockBusinesses = mockRankings.map((biz) => {
    let score = biz.score
    // If score is C grade (65-74) or D/E grade (<65), bump it to a B or A grade.
    if (score < 75) {
      // Randomly assign a B or A grade score (75-95)
      score = 75 + Math.random() * 20
    }
    return {
      ...biz,
      score: score,
      id: `mock-${biz.rank}`,
      isRealUser: false,
    }
  })

  // 2. Get real users who qualify
  const activeQuestionnaireNames = questionnairesStore.questionnaires
    .filter((q) => q.status === 'Active')
    .map((q) => q.name)

  const totalActiveQuestionnaires = activeQuestionnaireNames.length
  const users = authStore.users.filter((u) => !u.isAdmin)

  const qualifiedUserBusinesses = users
    .map((user) => {
      const result = reportsStore.calculateUserAverageScoreAndReports(
        user.id,
        activeQuestionnaireNames,
      )
      if (!result) return null

      const { averageScore, latestReports } = result

      // Conditions: Must have completed ALL active questionnaires and have a score of 75+
      if (latestReports.length < totalActiveQuestionnaires || averageScore < 75) {
        return null
      }

      return {
        id: `user-${user.id}`,
        name: user.companyName || user.userFullName,
        location: user.city || 'N/A',
        type: user.businessType || 'N/A',
        score: averageScore,
        isRealUser: true,
      }
    })
    .filter(Boolean) // Remove nulls

  // 3. Combine, sort, and rank
  const combined = [...adjustedMockBusinesses, ...qualifiedUserBusinesses]
  combined.sort((a, b) => b.score - a.score)
  // Take only the top 10 businesses for the rankings
  const top10 = combined.slice(0, 10)
  return top10.map((biz, index) => ({ ...biz, rank: index + 1 }))
})

// --- Grading Logic ---
/**
 * Calculates the grade based on a given score.
 * @param {number} score The numerical score.
 * @returns {string} The corresponding letter grade.
 */
function getGrade(score) {
  if (score >= 85) return 'A'
  if (score >= 75) return 'B'
  if (score >= 65) return 'C'
  if (score >= 50) return 'D'
  return 'E'
}

/**
 * Determines the Tailwind CSS text color class based on the grade.
 * As requested, ensuring distinct colors:
 * A: Green (safe)
 * B: Emerald (subtle green, distinct from A)
 * C: Yellow (neutral warning)
 * D: Orange (minor concern)
 * E: Red (danger)
 * @param {string} grade The letter grade (A, B, C, D, E).
 * @returns {string} The Tailwind CSS class for text color.
 */
function getGradeColorClass(grade) {
  switch (grade) {
    case 'A':
      return 'text-green-600' // Safe Green
    case 'B':
      return 'text-emerald-600' // Emerald (slightly darker green/teal)
    case 'C':
      return 'text-yellow-600' // Yellow
    case 'D':
      return 'text-orange-600' // Orange
    case 'E':
      return 'text-red-600' // Danger Red
    default:
      return 'text-gray-600' // Fallback
  }
}

// --- Grouped Rankings for 3-column layout ---
const rankingsByRating = computed(() => {
  // Sort by overall score (descending) as it correlates with 'Rating'
  return rankings.value.slice().sort((a, b) => b.score - a.score)
})

const rankingsByLocation = computed(() => {
  const grouped = rankings.value.reduce((acc, rank) => {
    const key = rank.location
    if (!acc[key]) acc[key] = []
    acc[key].push(rank)
    return acc
  }, {})
  // Sort locations alphabetically, then by score within each location
  return Object.fromEntries(
    Object.entries(grouped)
      .sort()
      .map(([key, value]) => [key, value.sort((a, b) => b.score - a.score)]),
  )
})

const rankingsByType = computed(() => {
  const grouped = rankings.value.reduce((acc, rank) => {
    const key = rank.type
    if (!acc[key]) acc[key] = []
    acc[key].push(rank)
    return acc
  }, {})
  // Sort types alphabetically, then by score within each type
  return Object.fromEntries(
    Object.entries(grouped)
      .sort()
      .map(([key, value]) => [key, value.sort((a, b) => b.score - a.score)]),
  )
})

// // Initialize the auth store
// const authStore = useAuthStore()
// const assessmentStore = useAssessmentStore()

/**
 * Navigates the user to the login page to start an assessment.
 */
function navigateToLogin() {
  router.push('/login')
}
</script>
<template>
  <div class="font-sans">
    <!-- Hero Section: Grand, eye-catching introduction with gradient background and shadow -->
    <div class="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 md:py-22 shadow-xl">
      <div class="container mx-auto px-6 text-center">
        <!-- Main Heading: Large, bold, responsive text with yellow highlight for "AI-Powered" -->
        <h1 class="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
          Net Triad Vulnerability Assessment Portal
        </h1>
        <!-- Sub-heading/Description: Readable text, centered, with slight opacity -->
        <p class="text-lg md:text-xl max-w-3xl mx-auto mb-10 opacity-90">
          Net Triad (IT Infrastructure Vulnerability Assessment) is an intelligent platform that
          helps businesses in the UK identify, analyze, and mitigate security risks across their
          digital infrastructure.
        </p>
        <!-- Call to Action Button: Prominent, white background, blue text, interactive hover effects -->
        <button
          @click="navigateToLogin"
          class="bg-white text-blue-700 cursor-pointer font-bold py-4 px-10 rounded-full text-lg hover:bg-gray-100 transition-transform transform hover:scale-105 shadow-2xl"
        >
          Start Your Free Assessment
        </button>
      </div>
    </div>

    <section id="rankings" class="py-20 bg-gray-50/70">
      <div class="container mx-auto px-6">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-800">UK's Most Secure Businesses</h2>
          <p class="text-gray-600 mt-4 max-w-2xl mx-auto mb-8">
            Discover the top-ranked businesses based on their comprehensive Net Triad vulnerability
            rating
          </p>
          <!-- Removed "Group by:" and filter buttons as per new requirements -->
        </div>

        <!-- Three-Column Ranking Display Area: Grid layout for distinct ranking views -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Column 1: Business Ranking by Rating -->
          <div
            class="bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden border border-gray-200"
          >
            <div class="p-6 border-b border-gray-200 bg-blue-50">
              <h3 class="text-xl font-bold text-blue-800">Business Ranking by Rating</h3>
            </div>
            <div class="overflow-y-auto custom-scrollbar flex-grow p-4 min-h-[400px]">
              <ul class="space-y-1">
                <li
                  v-for="item in rankingsByRating"
                  :key="item.rank"
                  class="p-3 rounded-lg flex items-center justify-between"
                >
                  <div class="flex items-center truncate">
                    <span class="font-bold text-gray-400 mr-3 w-6 text-center flex-shrink-0">{{
                      item.rank
                    }}</span>
                    <div class="truncate">
                      <!-- Increased font size for company name as requested -->
                      <p class="font-bold text-gray-800 text-base truncate">{{ item.name }}</p>
                      <p class="text-xs text-gray-500 truncate">
                        {{ item.location }} - {{ item.type }}
                      </p>
                    </div>
                  </div>
                  <!-- Grade display with conditional color -->
                  <span
                    class="font-extrabold text-base flex-shrink-0 ml-2"
                    :class="getGradeColorClass(getGrade(item.score))"
                  >
                    {{ getGrade(item.score) }}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Column 2: Business Ranking by Location -->
          <div
            class="bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden border border-gray-200"
          >
            <div class="p-6 border-b border-gray-200 bg-green-50">
              <h3 class="text-xl font-bold text-green-800">Business Ranking by Location</h3>
            </div>
            <div class="overflow-y-auto custom-scrollbar flex-grow p-4 min-h-[400px]">
              <div
                v-for="(group, groupName) in rankingsByLocation"
                :key="groupName"
                class="mb-1 last:mb-0"
              >
                <h4
                  class="font-semibold text-sm text-green-800 bg-green-100 px-4 py-2 rounded-md mb-1 sticky top-0 z-10 shadow-sm"
                >
                  {{ groupName }}
                </h4>
                <ul class="space-y-1">
                  <li
                    v-for="item in group"
                    :key="item.rank"
                    class="p-1 rounded-lg flex items-center justify-between"
                  >
                    <div class="flex items-center truncate">
                      <span class="font-bold text-gray-400 mr-3 w-6 text-center flex-shrink-0">{{
                        item.rank
                      }}</span>
                      <div class="truncate">
                        <!-- Increased font size for company name as requested -->
                        <p class="font-bold text-gray-800 text-base truncate">{{ item.name }}</p>
                        <p class="text-xs text-gray-500 truncate">
                          {{ item.location }} - {{ item.type }}
                        </p>
                      </div>
                    </div>
                    <!-- Grade display with conditional color -->
                    <span
                      class="font-extrabold text-base flex-shrink-0 ml-2"
                      :class="getGradeColorClass(getGrade(item.score))"
                    >
                      {{ getGrade(item.score) }}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Column 3: Business Ranking by Type -->
          <div
            class="bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden border border-gray-200"
          >
            <div class="p-6 border-b border-gray-200 bg-purple-50">
              <h3 class="text-xl font-bold text-purple-800">Business Ranking by Type</h3>
            </div>
            <div class="overflow-y-auto custom-scrollbar flex-grow p-4 min-h-[400px]">
              <div
                v-for="(group, groupName) in rankingsByType"
                :key="groupName"
                class="mb-1 last:mb-0"
              >
                <h4
                  class="font-semibold text-sm text-purple-800 bg-purple-100 px-4 py-2 rounded-md mb-1 sticky top-0 z-10 shadow-sm"
                >
                  {{ groupName }}
                </h4>
                <ul class="space-y-1">
                  <li
                    v-for="item in group"
                    :key="item.rank"
                    class="p-1 rounded-lg flex items-center justify-between"
                  >
                    <div class="flex items-center truncate">
                      <span class="font-bold text-gray-400 mr-3 w-6 text-center flex-shrink-0">{{
                        item.rank
                      }}</span>
                      <div class="truncate">
                        <!-- Increased font size for company name as requested -->
                        <p class="font-bold text-gray-800 text-base truncate">{{ item.name }}</p>
                        <p class="text-xs text-gray-500 truncate">
                          {{ item.location }} - {{ item.type }}
                        </p>
                      </div>
                    </div>
                    <!-- Grade display with conditional color -->
                    <span
                      class="font-extrabold text-base flex-shrink-0 ml-2"
                      :class="getGradeColorClass(getGrade(item.score))"
                    >
                      {{ getGrade(item.score) }}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section - Reintroduced and updated content -->
    <section id="how-it-works" class="py-20 bg-white">
      <div class="container mx-auto px-6">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12">How It Works</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Step 1: Register & Answer -->
          <div class="bg-white p-8 rounded-xl shadow-lg text-center border border-gray-200">
            <div
              class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold"
            >
              1
            </div>
            <h3 class="text-2xl font-semibold text-gray-800 mb-4">Register & Answer</h3>
            <p class="text-gray-600 leading-relaxed">
              Create your business profile and complete our straightforward, up to date 40-questions
              Net Triad assessments. We also offer specialized questionnaires for Advanced Cloud
              Security and GDPR Compliance.
            </p>
          </div>
          <!-- Step 2: AI-Powered Analysis -->
          <div class="bg-white p-8 rounded-xl shadow-lg text-center border border-gray-200">
            <div
              class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold"
            >
              2
            </div>
            <h3 class="text-2xl font-semibold text-gray-800 mb-4">AI-Powered Analysis</h3>
            <p class="text-gray-600 leading-relaxed">
              Our system analyzes your answers based on 4 main criteria: Website Security, Device &
              Network, Compliance Documentation & Cybersecurity Implementation to calculate your
              vulnerability score for each category.
            </p>
          </div>
          <!-- Step 3: Get Actionable Insights -->
          <div class="bg-white p-8 rounded-xl shadow-lg text-center border border-gray-200">
            <div
              class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold"
            >
              3
            </div>
            <h3 class="text-2xl font-semibold text-gray-800 mb-4">Get Actionable Insights</h3>
            <p class="text-gray-600 leading-relaxed">
              Receive an instant, detailed report with a visual Radar Chart and prioritized
              recommendations. You may download your reports as pdf for further review or reach to
              us on actionable plans to mitigate your security gaps.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Platform Features Section - Reintroduced -->
    <section id="features" class="py-20 bg-gray-50/70">
      <div class="container mx-auto px-6">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12">
          Platform Features
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <!-- Feature 1: Comprehensive Assessments -->
          <div class="flex items-start bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
            <div
              class="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4"
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
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a11.955 11.955 0 0118 0 12.02 12.02 0 00-3.382-9.984z"
                ></path>
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-semibold text-gray-800 mb-2">Comprehensive Assessments</h3>
              <p class="text-gray-600">
                Detailed analysis of your IT infrastructure covering a wide range of potential
                vulnerabilities.
              </p>
            </div>
          </div>
          <!-- Feature 2: Risk Prioritization -->
          <div class="flex items-start bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
            <div
              class="flex-shrink-0 w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-4"
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                ></path>
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-semibold text-gray-800 mb-2">Risk Prioritization</h3>
              <p class="text-gray-600">
                Automatically identify and prioritize the most critical risks, enabling efficient
                resource allocation.
              </p>
            </div>
          </div>
          <!-- Feature 3: Automated Reporting -->
          <div class="flex items-start bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
            <div
              class="flex-shrink-0 w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-4"
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
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                ></path>
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-semibold text-gray-800 mb-2">Automated Reporting</h3>
              <p class="text-gray-600">
                Generate clear, actionable reports instantly, detailing vulnerabilities and
                recommended solutions.
              </p>
            </div>
          </div>
          <!-- Feature 4: User-Friendly Dashboard -->
          <div class="flex items-start bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
            <div
              class="flex-shrink-0 w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mr-4"
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
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-semibold text-gray-800 mb-2">User-Friendly Dashboard</h3>
              <p class="text-gray-600">
                Intuitive dashboard to monitor your security posture and track progress over time.
              </p>
            </div>
          </div>
          <!-- Feature 5: Scalable Solutions -->
          <div class="flex items-start bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
            <div
              class="flex-shrink-0 w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mr-4"
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253"
                ></path>
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-semibold text-gray-800 mb-2">Scalable Solutions</h3>
              <p class="text-gray-600">
                Whether you're a small business or a large enterprise, Net Triad scales to meet your
                security needs.
              </p>
            </div>
          </div>
          <!-- Feature 6: Expert Support -->
          <div class="flex items-start bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
            <div
              class="flex-shrink-0 w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mr-4"
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
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                ></path>
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-semibold text-gray-800 mb-2">Expert Support</h3>
              <p class="text-gray-600">
                Access to our team of cybersecurity experts for guidance and advanced threat
                mitigation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- UK's Most Secure Businesses Section - Modified for 3-column layout -->

    <!-- About Us Section Placeholder: Calls to action to learn more -->
    <section id="about" class="py-20 bg-white">
      <div class="container mx-auto px-6 text-center">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">About Net Triad</h2>
        <p class="text-lg text-gray-600 max-w-3xl mx-auto">
          Net Triad is committed to empowering businesses with the knowledge and tools to secure
          their digital presence. Our cutting-edge AI technology provides in-depth vulnerability
          assessments, helping you proactively manage and mitigate risks. Learn more about our
          mission and values.
        </p>
        <button
          @click="router.push('/about')"
          class="mt-8 bg-blue-600 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-md"
        >
          Learn More
        </button>
      </div>
    </section>
  </div>
  <!-- Scroll-to-top Button -->
  <transition name="fade">
    <button
      v-if="showScrollTopButton"
      @click="scrollToTop"
      class="fixed bottom-8 cursor-pointer right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all z-50"
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
</style>
