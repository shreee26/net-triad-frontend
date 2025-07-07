let toastInstance = null

/**
 * Initialize the toast system with a toast instance
 * @param {Object} instance - Toast instance with show/hide methods
 */
export function initToast(instance) {
  toastInstance = instance
}

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of notification (success, error, warning, info)
 * @param {number} duration - Duration in milliseconds
 */
export function showToast(message, type = 'info', duration = 3000) {
  if (toastInstance && typeof toastInstance.show === 'function') {
    toastInstance.show(message, type, duration)
  } else {
    // Fallback to console if toast is not available
    console.log(`[${type.toUpperCase()}] ${message}`)
  }
}

/**
 * Hide the current toast notification
 */
export function hideToast() {
  if (toastInstance && typeof toastInstance.hide === 'function') {
    toastInstance.hide()
  }
}

/**
 * Convenience methods for different toast types
 */
export const toast = {
  success: (message, duration) => showToast(message, 'success', duration),
  error: (message, duration) => showToast(message, 'error', duration),
  warning: (message, duration) => showToast(message, 'warning', duration),
  info: (message, duration) => showToast(message, 'info', duration),
}
