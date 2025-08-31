import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../../store/slices/authSlice'
import cartReducer from '../../store/slices/cartSlice'
import productsReducer from '../../store/slices/productsSlice'
import ordersReducer from '../../store/slices/ordersSlice'

/**
 * Creates a mock store with the provided initial state
 * @param {Object} initialState - Initial state for the store
 * @returns {Store} Configured Redux store
 */
export const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
      products: productsReducer,
      orders: ordersReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        status: 'idle',
        error: null,
        token: null,
        ...initialState.auth,
      },
      cart: {
        items: [],
        status: 'idle',
        error: null,
        ...initialState.cart,
      },
      products: {
        list: [],
        featured: [],
        categories: [],
        status: 'idle',
        error: null,
        ...initialState.products,
      },
      orders: {
        list: [],
        status: 'idle',
        error: null,
        ...initialState.orders,
      },
    },
  })
}

/**
 * Renders component wrapped with Redux Provider
 * @param {ReactElement} ui - Component to render
 * @param {Object} options - Render options
 * @param {Object} options.initialState - Initial Redux state
 * @param {Store} options.store - Custom store (optional)
 * @param {Object} options.renderOptions - Additional render options
 * @returns {Object} Render result with store
 */
export const renderWithProviders = (
  ui,
  {
    initialState = {},
    store = createMockStore(initialState),
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }) => (
    <Provider store={store}>{children}</Provider>
  )

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}

/**
 * Mock user data for testing
 */
export const mockUsers = {
  regular: {
    id: 1,
    email: 'user@test.com',
    name: 'Test User',
    role: 'user',
  },
  admin: {
    id: 2,
    email: 'admin@test.com',
    name: 'Admin User',
    role: 'admin',
  },
}

/**
 * Mock product data for testing
 */
export const mockProducts = [
  {
    id: 1,
    name: 'Test Product 1',
    price: 19.99,
    description: 'A test product for unit testing',
    image: '/images/product1.jpg',
    category: 'electronics',
    stock: 10,
  },
  {
    id: 2,
    name: 'Test Product 2',
    price: 29.99,
    description: 'Another test product',
    image: '/images/product2.jpg',
    category: 'clothing',
    stock: 5,
  },
  {
    id: 3,
    name: 'Out of Stock Product',
    price: 39.99,
    description: 'Product that is out of stock',
    image: '/images/product3.jpg',
    category: 'electronics',
    stock: 0,
  },
]

/**
 * Mock cart items for testing
 */
export const mockCartItems = [
  {
    id: 1,
    productId: 1,
    quantity: 2,
    product: mockProducts[0],
  },
  {
    id: 2,
    productId: 2,
    quantity: 1,
    product: mockProducts[1],
  },
]

/**
 * Mock order data for testing
 */
export const mockOrders = [
  {
    id: 1,
    userId: 1,
    status: 'completed',
    total: 69.97,
    items: [
      {
        id: 1,
        productId: 1,
        quantity: 2,
        price: 19.99,
        product: mockProducts[0],
      },
      {
        id: 2,
        productId: 2,
        quantity: 1,
        price: 29.99,
        product: mockProducts[1],
      },
    ],
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    userId: 1,
    status: 'pending',
    total: 19.99,
    items: [
      {
        id: 3,
        productId: 1,
        quantity: 1,
        price: 19.99,
        product: mockProducts[0],
      },
    ],
    createdAt: '2023-01-02T00:00:00.000Z',
    updatedAt: '2023-01-02T00:00:00.000Z',
  },
]

/**
 * Utility to wait for async operations in tests
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after specified time
 */
export const waitFor = (ms = 100) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Mock API responses for testing
 */
export const mockApiResponses = {
  login: {
    success: {
      user: mockUsers.regular,
      token: 'mock-jwt-token',
    },
    failure: {
      message: 'Invalid credentials',
    },
  },
  register: {
    success: {
      user: mockUsers.regular,
      token: 'mock-jwt-token',
    },
    failure: {
      message: 'Email already exists',
    },
  },
  products: {
    success: {
      products: mockProducts,
      total: mockProducts.length,
    },
    failure: {
      message: 'Failed to fetch products',
    },
  },
  cart: {
    success: {
      cart: mockCartItems,
    },
    failure: {
      message: 'Failed to fetch cart',
    },
  },
  orders: {
    success: {
      orders: mockOrders,
    },
    failure: {
      message: 'Failed to fetch orders',
    },
  },
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'

// Override render method with our custom renderWithProviders
export { renderWithProviders as render }


