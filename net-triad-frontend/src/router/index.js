import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import AboutUsPage from '@/views/AboutUsPage.vue'
import LoginPage from '@/views/LoginPage.vue'
import DashboardPage from '@/views/DashboardPage.vue'
import QuestionnairePage from '@/views/QuestionnairePage.vue'
import ReportViewerPage from '@/views/ReportViewerPage.vue'
import AdminDashboardPage from '@/views/admin/AdminDashboardPage.vue'
import EditQuestionnairePage from '@/views/admin/EditQuestionnairePage.vue'
import LinkAccountsPage from '@/views/LinkAccountsPage.vue' // New import

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
      meta: { showHeaderAndFooter: true },
    },
    {
      path: '/about',
      name: 'about',
      component: AboutUsPage,
      meta: { showHeaderAndFooter: true },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
      meta: { showHeaderAndFooter: false }, // To hide header/footer on this page
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardPage,
      // Meta flag to hide global header/footer, as DashboardPage will have its own
      meta: { showHeaderAndFooter: false },
    },
    {
      path: '/questionnaire/:type',
      name: 'questionnaire',
      component: QuestionnairePage,
      meta: { showHeaderAndFooter: false },
    },
    {
      // path: '/report/:businessName?', // Make businessName optional
      path: '/report/:reportId',
      name: 'ReportViewerPage', // Renamed for clarity in route push
      component: ReportViewerPage,
      props: true, // Pass route params as props to the component
      meta: { showHeaderAndFooter: false },
    },
    // Admin Routes
    {
      path: '/admin/dashboard',
      name: 'adminDashboard',
      component: AdminDashboardPage,
      meta: { showHeaderAndFooter: false }, // Admin pages use their own header
    },
    {
      path: '/admin/questionnaire',
      name: 'adminQuestionnaire',
      component: EditQuestionnairePage,
      meta: { showHeaderAndFooter: false },
    },
    // New route for linking accounts
    {
      path: '/link-accounts',
      name: 'linkAccounts',
      component: LinkAccountsPage,
      meta: { showHeaderAndFooter: false }, // Hide global header/footer for this page
    },
  ],
  // eslint-disable-next-line no-unused-vars
  scrollBehavior(to, from, savedPosition) {
    // Always scroll to top
    return { top: 0 }
  },
})

// // Global navigation guard to handle draft saving
// router.beforeEach(async (to, from, next) => {
//   // Check if user is navigating away from questionnaire page
//   if (from.name === 'questionnaire') {
//     try {
//       // Dynamically import stores to avoid circular dependencies
//       const { useAssessmentStore } = await import('@/stores/assessment')
//       const { useReportsStore } = await import('@/stores/reports')

//       const assessmentStore = useAssessmentStore()
//       const reportsStore = useReportsStore()

//       // Check if there's an active draft
//       if (assessmentStore.hasActiveDraft && assessmentStore.isDraftMode) {
//         // Store the target route for later navigation
//         const targetRoute = to.fullPath

//         // Create a custom event to trigger the draft save modal
//         const draftSaveEvent = new CustomEvent('show-draft-save-modal', {
//           detail: {
//             targetRoute,
//             assessmentStore,
//             reportsStore,
//           },
//         })

//         // Dispatch the event
//         window.dispatchEvent(draftSaveEvent)

//         // Prevent immediate navigation
//         return false
//       }
//     } catch (error) {
//       console.error('Error in navigation guard:', error)
//     }
//   }

//   next()
// })

export default router
