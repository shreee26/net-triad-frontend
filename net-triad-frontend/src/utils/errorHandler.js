/**
 * Error types for different scenarios
 */
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTH_ERROR',
  PERMISSION: 'PERMISSION_ERROR',
  STORAGE: 'STORAGE_ERROR',
  NAVIGATION: 'NAVIGATION_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
}

/**
 * Error messages for different error types
 */
export const ErrorMessages = {
  [ErrorTypes.NETWORK]: 'Network connection error. Please check your internet connection.',
  [ErrorTypes.VALIDATION]: 'Invalid data provided. Please check your input.',
  [ErrorTypes.AUTHENTICATION]: 'Authentication failed. Please log in again.',
  [ErrorTypes.PERMISSION]: "You don't have permission to perform this action.",
  [ErrorTypes.STORAGE]: 'Unable to save data. Please try again.',
  [ErrorTypes.NAVIGATION]: 'Navigation error. Please try again.',
  [ErrorTypes.UNKNOWN]: 'An unexpected error occurred. Please try again.',
}

/**
 * Handles errors with appropriate user feedback
 * @param {Error} error - The error object
 * @param {string} context - Context where the error occurred
 * @param {Function} showToast - Toast notification function
 */
export function handleError(error, context = 'Application', showToastFn = null) {
  console.error(`[${context}] Error:`, error)

  // Determine error type
  const errorType = determineErrorType(error)

  // Get user-friendly message
  const userMessage = ErrorMessages[errorType] || ErrorMessages[ErrorTypes.UNKNOWN]

  // Show toast notification if available
  if (showToastFn && typeof showToastFn === 'function') {
    showToastFn(userMessage, 'error')
  }

  // Log to console for debugging
  console.error(`[${context}] Error Type: ${errorType}`)
  console.error(`[${context}] Error Details:`, {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  })

  return {
    type: errorType,
    message: userMessage,
    originalError: error,
  }
}

/**
 * Determines the type of error based on the error object
 * @param {Error} error - The error object
 * @returns {string} Error type
 */
function determineErrorType(error) {
  if (error.name === 'NetworkError' || error.message.includes('network')) {
    return ErrorTypes.NETWORK
  }

  if (error.name === 'ValidationError' || error.message.includes('validation')) {
    return ErrorTypes.VALIDATION
  }

  if (error.name === 'AuthenticationError' || error.message.includes('auth')) {
    return ErrorTypes.AUTHENTICATION
  }

  if (error.name === 'PermissionError' || error.message.includes('permission')) {
    return ErrorTypes.PERMISSION
  }

  if (error.name === 'StorageError' || error.message.includes('storage')) {
    return ErrorTypes.STORAGE
  }

  if (error.name === 'NavigationError' || error.message.includes('navigation')) {
    return ErrorTypes.NAVIGATION
  }

  return ErrorTypes.UNKNOWN
}

/**
 * Creates a custom error with additional context
 * @param {string} message - Error message
 * @param {string} type - Error type
 * @param {Object} context - Additional context
 * @returns {Error} Custom error object
 */
export function createCustomError(message, type = ErrorTypes.UNKNOWN, context = {}) {
  const error = new Error(message)
  error.name = type
  error.context = context
  error.timestamp = new Date().toISOString()
  return error
}

/**
 * Validates required fields in an object
 * @param {Object} data - Data to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} Validation result
 */
export function validateRequiredFields(data, requiredFields) {
  const missingFields = requiredFields.filter((field) => {
    const value = data[field]
    return value === undefined || value === null || value === ''
  })

  if (missingFields.length > 0) {
    throw createCustomError(
      `Missing required fields: ${missingFields.join(', ')}`,
      ErrorTypes.VALIDATION,
      { missingFields, data },
    )
  }

  return { isValid: true }
}

/**
 * Safe JSON parsing with error handling
 * @param {string} jsonString - JSON string to parse
 * @param {any} defaultValue - Default value if parsing fails
 * @returns {any} Parsed object or default value
 */
export function safeJsonParse(jsonString, defaultValue = null) {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.warn('Failed to parse JSON:', error)
    return defaultValue
  }
}

/**
 * Safe localStorage operations with error handling
 */
export const safeStorage = {
  getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key)
      return item ? safeJsonParse(item, defaultValue) : defaultValue
    } catch (error) {
      console.warn(`Failed to get item from localStorage (${key}):`, error)
      return defaultValue
    }
  },

  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.warn(`Failed to set item in localStorage (${key}):`, error)
      return false
    }
  },

  removeItem(key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.warn(`Failed to remove item from localStorage (${key}):`, error)
      return false
    }
  },
}
