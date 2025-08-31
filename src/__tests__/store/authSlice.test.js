import authReducer, { logout, register, login, me } from '../../store/slices/authSlice'
import { configureStore } from '@reduxjs/toolkit'

// Mock the API module
jest.mock('../../lib/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
  },
  setAuthToken: jest.fn(),
}))

describe('Auth Slice', () => {
  let store

  beforeEach(() => {
    // Create a fresh store for each test
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    })

    // Mock localStorage
    Storage.prototype.getItem = jest.fn()
    Storage.prototype.setItem = jest.fn()
    Storage.prototype.removeItem = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState().auth
      expect(state).toEqual({
        user: null,
        status: 'idle',
        error: null,
        token: null,
      })
    })
  })

  describe('Logout Action', () => {
    it('should reset state when logout is dispatched', () => {
      // Set up initial state with user data
      const initialState = {
        user: { id: 1, email: 'test@test.com' },
        status: 'succeeded',
        error: null,
        token: 'test-token',
      }

      const newState = authReducer(initialState, logout())

      expect(newState).toEqual({
        user: null,
        status: 'idle',
        error: null,
        token: null,
      })
    })

    it('should call localStorage.removeItem when logout is dispatched', () => {
      const initialState = {
        user: { id: 1, email: 'test@test.com' },
        status: 'succeeded',
        error: null,
        token: 'test-token',
      }

      authReducer(initialState, logout())

      expect(localStorage.removeItem).toHaveBeenCalledWith('token')
    })
  })

  describe('Register Async Thunk', () => {
    it('should handle register.pending', () => {
      const action = { type: register.pending.type }
      const state = authReducer(
        { user: null, status: 'idle', error: 'previous error', token: null },
        action
      )

      expect(state.status).toBe('loading')
      expect(state.error).toBeNull()
    })

    it('should handle register.fulfilled', () => {
      const userData = {
        user: { id: 1, email: 'test@test.com', name: 'Test User' },
        token: 'test-token'
      }

      const action = { 
        type: register.fulfilled.type, 
        payload: userData 
      }

      const state = authReducer(
        { user: null, status: 'loading', error: null, token: null },
        action
      )

      expect(state.status).toBe('succeeded')
      expect(state.user).toEqual(userData.user)
      expect(state.token).toBe(userData.token)
      expect(localStorage.setItem).toHaveBeenCalledWith('token', userData.token)
    })

    it('should handle register.rejected', () => {
      const errorMessage = 'Registration failed'
      const action = { 
        type: register.rejected.type, 
        payload: errorMessage 
      }

      const state = authReducer(
        { user: null, status: 'loading', error: null, token: null },
        action
      )

      expect(state.status).toBe('failed')
      expect(state.error).toBe(errorMessage)
    })
  })

  describe('Login Async Thunk', () => {
    it('should handle login.pending', () => {
      const action = { type: login.pending.type }
      const state = authReducer(
        { user: null, status: 'idle', error: 'previous error', token: null },
        action
      )

      expect(state.status).toBe('loading')
      expect(state.error).toBeNull()
    })

    it('should handle login.fulfilled with user object', () => {
      const userData = {
        user: { id: 1, email: 'test@test.com', name: 'Test User' },
        token: 'test-token'
      }

      const action = { 
        type: login.fulfilled.type, 
        payload: userData 
      }

      const state = authReducer(
        { user: null, status: 'loading', error: null, token: null },
        action
      )

      expect(state.status).toBe('succeeded')
      expect(state.user).toEqual(userData.user)
      expect(state.token).toBe(userData.token)
    })

    it('should handle login.fulfilled with direct user data', () => {
      const userData = {
        id: 1, 
        email: 'test@test.com', 
        name: 'Test User',
        token: 'test-token'
      }

      const action = { 
        type: login.fulfilled.type, 
        payload: userData 
      }

      const state = authReducer(
        { user: null, status: 'loading', error: null, token: null },
        action
      )

      expect(state.status).toBe('succeeded')
      expect(state.user).toEqual(userData)
      expect(state.token).toBe(userData.token)
    })

    it('should handle login.rejected', () => {
      const errorMessage = 'Login failed'
      const action = { 
        type: login.rejected.type, 
        payload: errorMessage 
      }

      const state = authReducer(
        { user: null, status: 'loading', error: null, token: null },
        action
      )

      expect(state.status).toBe('failed')
      expect(state.error).toBe(errorMessage)
    })
  })

  describe('Me Async Thunk', () => {
    it('should handle me.fulfilled', () => {
      const userData = { id: 1, email: 'test@test.com', name: 'Test User' }
      const action = { 
        type: me.fulfilled.type, 
        payload: userData 
      }

      const state = authReducer(
        { user: null, status: 'idle', error: null, token: 'existing-token' },
        action
      )

      expect(state.user).toEqual(userData)
      expect(state.token).toBe('existing-token') // Should preserve existing token
    })

    it('should handle me.rejected', () => {
      const errorMessage = 'Failed to fetch user'
      const action = { 
        type: me.rejected.type, 
        payload: errorMessage 
      }

      const state = authReducer(
        { user: { id: 1 }, status: 'idle', error: null, token: 'existing-token' },
        action
      )

      expect(state.error).toBe(errorMessage)
      expect(state.user).toEqual({ id: 1 }) // Should preserve existing user
    })
  })
})


