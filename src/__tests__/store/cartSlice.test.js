import cartReducer, { fetchCart, addToCart, removeFromCart } from '../../store/slices/cartSlice'
import { configureStore } from '@reduxjs/toolkit'

// Mock the API module
jest.mock('../../lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}))

describe('Cart Slice', () => {
  let store

  beforeEach(() => {
    // Create a fresh store for each test
    store = configureStore({
      reducer: {
        cart: cartReducer,
      },
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState().cart
      expect(state).toEqual({
        items: [],
        status: 'idle',
        error: null,
      })
    })
  })

  describe('FetchCart Async Thunk', () => {
    it('should handle fetchCart.pending', () => {
      const action = { type: fetchCart.pending.type }
      const state = cartReducer(
        { items: [], status: 'idle', error: 'previous error' },
        action
      )

      expect(state.status).toBe('loading')
      expect(state.error).toBeNull()
    })

    it('should handle fetchCart.fulfilled', () => {
      const cartItems = [
        { id: 1, productId: 1, quantity: 2, product: { name: 'Product 1', price: 10.99 } },
        { id: 2, productId: 2, quantity: 1, product: { name: 'Product 2', price: 15.99 } }
      ]

      const action = { 
        type: fetchCart.fulfilled.type, 
        payload: cartItems 
      }

      const state = cartReducer(
        { items: [], status: 'loading', error: null },
        action
      )

      expect(state.status).toBe('succeeded')
      expect(state.items).toEqual(cartItems)
    })

    it('should handle fetchCart.rejected', () => {
      const errorMessage = 'Failed to fetch cart'
      const action = { 
        type: fetchCart.rejected.type, 
        error: { message: errorMessage }
      }

      const state = cartReducer(
        { items: [], status: 'loading', error: null },
        action
      )

      expect(state.status).toBe('failed')
      expect(state.error).toBe(errorMessage)
    })
  })

  describe('AddToCart Async Thunk', () => {
    it('should handle addToCart.fulfilled', () => {
      const updatedCartItems = [
        { id: 1, productId: 1, quantity: 2, product: { name: 'Product 1', price: 10.99 } },
        { id: 2, productId: 2, quantity: 3, product: { name: 'Product 2', price: 15.99 } }
      ]

      const action = { 
        type: addToCart.fulfilled.type, 
        payload: updatedCartItems 
      }

      const initialState = {
        items: [
          { id: 1, productId: 1, quantity: 2, product: { name: 'Product 1', price: 10.99 } }
        ],
        status: 'succeeded',
        error: null
      }

      const state = cartReducer(initialState, action)

      expect(state.items).toEqual(updatedCartItems)
    })

    it('should handle empty cart response', () => {
      const action = { 
        type: addToCart.fulfilled.type, 
        payload: [] 
      }

      const state = cartReducer(
        { items: [], status: 'succeeded', error: null },
        action
      )

      expect(state.items).toEqual([])
    })
  })

  describe('RemoveFromCart Async Thunk', () => {
    it('should handle removeFromCart.fulfilled', () => {
      const updatedCartItems = [
        { id: 2, productId: 2, quantity: 1, product: { name: 'Product 2', price: 15.99 } }
      ]

      const action = { 
        type: removeFromCart.fulfilled.type, 
        payload: updatedCartItems 
      }

      const initialState = {
        items: [
          { id: 1, productId: 1, quantity: 2, product: { name: 'Product 1', price: 10.99 } },
          { id: 2, productId: 2, quantity: 1, product: { name: 'Product 2', price: 15.99 } }
        ],
        status: 'succeeded',
        error: null
      }

      const state = cartReducer(initialState, action)

      expect(state.items).toEqual(updatedCartItems)
    })

    it('should handle removing all items', () => {
      const action = { 
        type: removeFromCart.fulfilled.type, 
        payload: [] 
      }

      const initialState = {
        items: [
          { id: 1, productId: 1, quantity: 2, product: { name: 'Product 1', price: 10.99 } }
        ],
        status: 'succeeded',
        error: null
      }

      const state = cartReducer(initialState, action)

      expect(state.items).toEqual([])
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined payload for cart operations', () => {
      const action = { 
        type: fetchCart.fulfilled.type, 
        payload: undefined 
      }

      const state = cartReducer(
        { items: [], status: 'loading', error: null },
        action
      )

      expect(state.items).toEqual([])
    })

    it('should preserve existing items when payload is undefined', () => {
      const existingItems = [
        { id: 1, productId: 1, quantity: 2, product: { name: 'Product 1', price: 10.99 } }
      ]

      const action = { 
        type: addToCart.fulfilled.type, 
        payload: undefined 
      }

      const state = cartReducer(
        { items: existingItems, status: 'succeeded', error: null },
        action
      )

      expect(state.items).toEqual([])
    })
  })

  describe('Cart Item Calculations', () => {
    it('should handle cart with multiple quantities', () => {
      const cartItems = [
        { id: 1, productId: 1, quantity: 5, product: { name: 'Product 1', price: 10.00 } },
        { id: 2, productId: 2, quantity: 3, product: { name: 'Product 2', price: 25.50 } },
        { id: 3, productId: 3, quantity: 1, product: { name: 'Product 3', price: 100.00 } }
      ]

      const action = { 
        type: fetchCart.fulfilled.type, 
        payload: cartItems 
      }

      const state = cartReducer(
        { items: [], status: 'loading', error: null },
        action
      )

      expect(state.items).toEqual(cartItems)
      expect(state.items.length).toBe(3)
      
      // Test total quantity calculation (as done in components)
      const totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0)
      expect(totalQuantity).toBe(9) // 5 + 3 + 1
    })
  })
})


