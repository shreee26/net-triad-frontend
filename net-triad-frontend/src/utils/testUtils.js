/**
 * Test utilities for validating application functionality
 */

/**
 * Validates that all required store methods exist
 * @param {Object} store - Store object to validate
 * @param {Array} requiredMethods - Array of required method names
 * @returns {Object} Validation result
 */
export function validateStore(store, requiredMethods) {
  const missingMethods = requiredMethods.filter((method) => {
    return typeof store[method] !== 'function'
  })

  if (missingMethods.length > 0) {
    return {
      isValid: false,
      errors: [`Missing required methods: ${missingMethods.join(', ')}`],
    }
  }

  return { isValid: true }
}

/**
 * Validates that all required fields in an object have values.
 * @param {object} data The object to validate.
 * @param {string[]} requiredFields An array of field names that are required.
 * @returns {boolean} True if all required fields are present, false otherwise.
 */
export function validateRequiredFields(data, requiredFields) {
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      console.error(`Validation Error: The field "${field}" is required.`)
      return false
    }
  }
  return true
}

/**
 * Validates questionnaire data structure
 * @param {Array} questions - Questions array to validate
 * @returns {Object} Validation result
 */
export function validateQuestionnaireData(questions) {
  const errors = []

  if (!Array.isArray(questions)) {
    errors.push('Questions must be an array')
    return { isValid: false, errors }
  }

  if (questions.length === 0) {
    errors.push('Questions array cannot be empty')
    return { isValid: false, errors }
  }

  questions.forEach((question, index) => {
    // Validate question structure
    if (!question.id) {
      errors.push(`Question ${index + 1} missing required field: id`)
    }

    if (!question.text) {
      errors.push(`Question ${index + 1} missing required field: text`)
    }

    if (!question.category) {
      errors.push(`Question ${index + 1} missing required field: category`)
    }

    if (!Array.isArray(question.options) || question.options.length === 0) {
      errors.push(`Question ${index + 1} missing or invalid options array`)
    } else {
      // Validate options structure
      question.options.forEach((option, optionIndex) => {
        if (!option.text) {
          errors.push(
            `Question ${index + 1}, Option ${optionIndex + 1} missing required field: text`,
          )
        }

        if (!option.score && option.score !== 0) {
          errors.push(
            `Question ${index + 1}, Option ${optionIndex + 1} missing required field: score`,
          )
        }

        if (!option.recommendation) {
          errors.push(
            `Question ${index + 1}, Option ${optionIndex + 1} missing required field: recommendation`,
          )
        }
      })
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validates report data structure
 * @param {Object} report - Report object to validate
 * @returns {Object} Validation result
 */
export function validateReportData(report) {
  const errors = []
  const requiredFields = ['name', 'date', 'type', 'score', 'report']

  requiredFields.forEach((field) => {
    if (!report[field] && report[field] !== 0) {
      errors.push(`Report missing required field: ${field}`)
    }
  })

  // Validate score range
  if (report.score !== undefined && (report.score < 0 || report.score > 100)) {
    errors.push('Report score must be between 0 and 100')
  }

  // Validate report object structure
  if (report.report) {
    const reportFields = ['overall', 'ws', 'dn', 'cd', 'cs', 'recommendations']
    reportFields.forEach((field) => {
      if (!(field in report.report)) {
        errors.push(`Report.report missing required field: ${field}`)
      }
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validates user data structure
 * @param {Object} user - User object to validate
 * @returns {Object} Validation result
 */
export function validateUserData(user) {
  const errors = []
  const requiredFields = ['userName', 'userFullName', 'email']

  requiredFields.forEach((field) => {
    if (!user[field]) {
      errors.push(`User missing required field: ${field}`)
    }
  })

  // Validate email format
  if (user.email && !isValidEmail(user.email)) {
    errors.push('Invalid email format')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Tests localStorage functionality
 * @returns {Object} Test result
 */
export function testLocalStorage() {
  const testKey = 'test-storage'
  const testValue = { test: 'data' }

  try {
    // Test set
    localStorage.setItem(testKey, JSON.stringify(testValue))

    // Test get
    const retrieved = JSON.parse(localStorage.getItem(testKey))

    // Test remove
    localStorage.removeItem(testKey)

    if (JSON.stringify(retrieved) === JSON.stringify(testValue)) {
      return { isValid: true, message: 'LocalStorage is working correctly' }
    } else {
      return { isValid: false, message: 'LocalStorage data corruption detected' }
    }
  } catch (error) {
    return { isValid: false, message: `LocalStorage test failed: ${error.message}` }
  }
}

/**
 * Tests router functionality
 * @param {Object} router - Vue router instance
 * @returns {Object} Test result
 */
export function testRouter(router) {
  try {
    // Check if router has required methods
    const requiredMethods = ['push', 'replace', 'go', 'back', 'forward']
    const missingMethods = requiredMethods.filter((method) => {
      return typeof router[method] !== 'function'
    })

    if (missingMethods.length > 0) {
      return {
        isValid: false,
        message: `Router missing methods: ${missingMethods.join(', ')}`,
      }
    }

    return { isValid: true, message: 'Router is working correctly' }
  } catch (error) {
    return { isValid: false, message: `Router test failed: ${error.message}` }
  }
}

/**
 * Runs comprehensive application tests
 * @param {Object} appContext - Application context with stores and data
 * @returns {Object} Test results
 */
export function runApplicationTests(appContext) {
  const results = {
    passed: 0,
    failed: 0,
    tests: [],
  }

  // Test stores
  if (appContext.authStore) {
    const authStoreTest = validateStore(appContext.authStore, ['login', 'logout', 'register'])
    results.tests.push({
      name: 'Auth Store',
      result: authStoreTest.isValid ? 'PASS' : 'FAIL',
      errors: authStoreTest.errors || [],
    })
    authStoreTest.isValid ? results.passed++ : results.failed++
  }

  if (appContext.assessmentStore) {
    const assessmentStoreTest = validateStore(appContext.assessmentStore, [
      'startDraft',
      'updateDraft', // Corrected from 'saveDraftAnswer'
      'clearDraft',
      'loadDraftFromStorage',
      'setGeneratedReport',
    ])
    results.tests.push({
      name: 'Assessment Store',
      result: assessmentStoreTest.isValid ? 'PASS' : 'FAIL',
      errors: assessmentStoreTest.errors || [],
    })
    assessmentStoreTest.isValid ? results.passed++ : results.failed++
  }

  if (appContext.reportsStore) {
    const reportsStoreTest = validateStore(appContext.reportsStore, [
      'addReport',
      'deleteReport',
      'getDraftById',
      'getReportById',
      'saveOrUpdateDraft',
      'loadReportsFromStorage',
    ])
    results.tests.push({
      name: 'Reports Store',
      result: reportsStoreTest.isValid ? 'PASS' : 'FAIL',
      errors: reportsStoreTest.errors || [],
    })
    reportsStoreTest.isValid ? results.passed++ : results.failed++
  }

  // Test questionnaire data
  if (appContext.questions) {
    const questionnaireTest = validateQuestionnaireData(appContext.questions)
    results.tests.push({
      name: 'Questionnaire Data',
      result: questionnaireTest.isValid ? 'PASS' : 'FAIL',
      errors: questionnaireTest.errors || [],
    })
    questionnaireTest.isValid ? results.passed++ : results.failed++
  }

  // Test localStorage
  const storageTest = testLocalStorage()
  results.tests.push({
    name: 'LocalStorage',
    result: storageTest.isValid ? 'PASS' : 'FAIL',
    errors: storageTest.isValid ? [] : [storageTest.message],
  })
  storageTest.isValid ? results.passed++ : results.failed++

  // Test router
  if (appContext.router) {
    const routerTest = testRouter(appContext.router)
    results.tests.push({
      name: 'Router',
      result: routerTest.isValid ? 'PASS' : 'FAIL',
      errors: routerTest.isValid ? [] : [routerTest.message],
    })
    routerTest.isValid ? results.passed++ : results.failed++
  }

  results.success = results.failed === 0

  return results
}
