// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { safeStorage } from '@/utils/errorHandler'
import { v4 as uuidv4 } from 'uuid' // Import UUID for unique user IDs
import { validateUserData, validateRequiredFields } from '@/utils/testUtils'

export const useAuthStore = defineStore('auth', () => {
  // State
  const users = ref([])
  const currentUser = ref(null)
  const isAuthenticated = ref(false)

  // Load users from localStorage
  const loadUsersFromStorage = () => {
    const storedUsers = safeStorage.getItem('auth-users', [])
    if (Array.isArray(storedUsers)) {
      users.value = storedUsers
    }
  }

  // Save users to localStorage
  const saveUsersToStorage = () => {
    safeStorage.setItem('auth-users', users.value)
  }

  // --- OPTIMIZED: Function to create default users that match the form ---
  const createDefaultUsers = () => {
    const defaultUsers = [
      {
        id: 'default-admin',
        userName: 'admin',
        password: 'admin', // In a real app, this would be hashed
        firstName: 'Default',
        lastName: 'Admin',
        email: 'admin@admin.com',
        companyName: 'ITIVA Corp',
        companyDescription: 'Administrator Account',
        address: '1 Admin Plaza',
        city: 'Adminville',
        businessType: 'IT Services & Consulting',
        isAdmin: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'default-user',
        userName: 'user',
        password: 'password', // In a real app, this would be hashed
        firstName: 'Default',
        lastName: 'User',
        email: 'user@user.com',
        companyName: 'User Co',
        companyDescription: 'Standard User Account',
        address: '123 User Street',
        city: 'Userville',
        businessType: 'SaaS (Software as a Service)',
        isAdmin: false,
        createdAt: new Date().toISOString(),
      },
    ]

    defaultUsers.forEach((defaultUser) => {
      // Check if a user with this username already exists
      const userExists = users.value.some((user) => user.userName === defaultUser.userName)
      if (!userExists) {
        // If the user doesn't exist, add them to the list
        users.value.push(defaultUser)
      }
    })

    // Save the updated user list to storage
    saveUsersToStorage()
  }

  // Initialize store
  loadUsersFromStorage()
  createDefaultUsers() // Call the function on initialization

  // --- OPTIMIZED: Computed properties ---
  const userName = computed(() => currentUser.value?.userName || '')
  // Dynamically create userFullName from firstName and lastName
  const userFullName = computed(() => {
    if (currentUser.value) {
      return `${currentUser.value.firstName || ''} ${currentUser.value.lastName || ''}`.trim()
    }
    return ''
  })
  const userEmail = computed(() => currentUser.value?.email || '')

  // --- OPTIMIZED: Actions ---
  const register = async (userData) => {
    try {
      loadUsersFromStorage()
      // Validate required fields based on the form
      validateRequiredFields(userData, ['userName', 'firstName', 'lastName', 'email', 'password'])

      // Validate user data structure
      const validation = validateUserData(userData)
      if (!validation.isValid) {
        throw new Error(`User validation failed: ${validation.errors.join(', ')}`)
      }

      // Check if user already exists
      const existingUser = users.value.find((user) => user.userName === userData.userName)
      if (existingUser) {
        throw new Error('Username already exists')
      }

      // Check if email already exists
      const existingEmail = users.value.find((user) => user.email === userData.email)
      if (existingEmail) {
        throw new Error('Email already registered')
      }

      // Create new user object matching the form structure
      const newUser = {
        ...userData,
        id: uuidv4(), // Generate a unique ID for the new user
        isAdmin: userData.isAdmin || false,
        createdAt: new Date().toISOString(),
      }

      // Add user to store
      users.value.push(newUser)

      // Save to localStorage
      saveUsersToStorage()

      // Auto-login after registration
      await login(newUser.userName, newUser.password)

      return { success: true, user: newUser }
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const login = async (loginIdentifier, password) => {
    try {
      loadUsersFromStorage()
      // Validate inputs
      if (!loginIdentifier || !password) {
        throw new Error('Username/email and password are required')
      }

      // *** FIX: Find user by either userName OR email ***
      const user = users.value.find(
        (u) => u.userName === loginIdentifier || u.email === loginIdentifier,
      )

      if (!user) {
        throw new Error('User not found')
      }

      // Check password
      if (user.password !== password) {
        throw new Error('Invalid password')
      }

      // Set current user and authentication state
      currentUser.value = user
      isAuthenticated.value = true

      // Save authentication state
      safeStorage.setItem('auth-currentUser', user)
      safeStorage.setItem('auth-isAuthenticated', true)

      return { success: true, user }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = () => {
    try {
      // Clear current user and authentication state
      currentUser.value = null
      isAuthenticated.value = false

      // Clear from localStorage
      safeStorage.removeItem('auth-currentUser')
      safeStorage.removeItem('auth-isAuthenticated')

      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  const checkAuthStatus = () => {
    try {
      // Check if user is authenticated from localStorage
      const storedUser = safeStorage.getItem('auth-currentUser')
      const storedAuth = safeStorage.getItem('auth-isAuthenticated')

      if (storedUser && storedAuth) {
        // Verify user still exists in users array
        const userExists = users.value.find((u) => u.id === storedUser.id)
        if (userExists) {
          currentUser.value = storedUser
          isAuthenticated.value = true
          return true
        }
      }

      // Clear invalid authentication state
      logout()
      return false
    } catch (error) {
      console.error('Auth status check error:', error)
      return false
    }
  }

  const updateUserProfile = async (updates) => {
    try {
      if (!currentUser.value) {
        throw new Error('No user logged in')
      }

      // Validate updates
      if (updates.email) {
        const emailValidation = validateUserData({ email: updates.email })
        if (!emailValidation.isValid) {
          throw new Error(`Email validation failed: ${emailValidation.errors.join(', ')}`)
        }
      }

      // Update user in store
      const userIndex = users.value.findIndex((u) => u.id === currentUser.value.id)
      if (userIndex === -1) {
        throw new Error('User not found in store')
      }

      // Apply updates
      users.value[userIndex] = { ...users.value[userIndex], ...updates }
      currentUser.value = { ...currentUser.value, ...updates }

      // Save to localStorage
      saveUsersToStorage()
      safeStorage.setItem('auth-currentUser', currentUser.value)

      return { success: true, user: currentUser.value }
    } catch (error) {
      console.error('Profile update error:', error)
      throw error
    }
  }

  const deleteUser = async (userId) => {
    try {
      if (!userId) {
        throw new Error('User ID is required')
      }

      // Find user index
      const userIndex = users.value.findIndex((u) => u.id === userId)
      if (userIndex === -1) {
        throw new Error('User not found')
      }

      // Remove user
      users.value.splice(userIndex, 1)

      // If deleting current user, logout
      if (currentUser.value && currentUser.value.id === userId) {
        await logout()
      }

      // Save to localStorage
      saveUsersToStorage()

      return { success: true }
    } catch (error) {
      console.error('User deletion error:', error)
      throw error
    }
  }

  // Initialize authentication status on store creation
  checkAuthStatus()

  return {
    // State
    users,
    currentUser,
    isAuthenticated,

    // Computed
    userName,
    userFullName,
    userEmail,

    // Actions
    register,
    login,
    logout,
    checkAuthStatus,
    updateUserProfile,
    deleteUser,

    // Utility methods
    loadUsersFromStorage,
    saveUsersToStorage,
  }
})
