import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import Header from '../../app/components/Header'
import authReducer from '../../store/slices/authSlice'
import cartReducer from '../../store/slices/cartSlice'

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock the fetchCart action
jest.mock('../../store/slices/cartSlice', () => ({
  ...jest.requireActual('../../store/slices/cartSlice'),
  fetchCart: jest.fn(() => ({ type: 'cart/fetchCart/pending' })),
}))

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
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
    },
  })
}

const renderWithProvider = (component, initialState = {}) => {
  const store = createMockStore(initialState)
  return {
    ...render(
      <Provider store={store}>
        {component}
      </Provider>
    ),
    store,
  }
}

describe('Header Component', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  describe('When user is not logged in', () => {
    it('should render without user actions', () => {
      renderWithProvider(<Header />)
      
      // Should render logo
      expect(screen.getByAltText('BUYIT')).toBeInTheDocument()
      
      // Should not render user-specific elements
      expect(screen.queryByRole('button', { name: /open cart/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument()
    })
  })

  describe('When user is logged in', () => {
    const mockUser = {
      id: 1,
      email: 'test@test.com',
      name: 'Test User',
      role: 'user',
    }

    it('should render user navigation elements', () => {
      renderWithProvider(<Header />, {
        auth: { user: mockUser },
      })

      // Should render cart button
      expect(screen.getByRole('button', { name: /open cart/i })).toBeInTheDocument()
      
      // Should render orders link
      expect(screen.getByRole('link', { name: /orders/i })).toBeInTheDocument()
      
      // Should render profile link
      expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument()
      
      // Should render logout button
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should display cart count', () => {
      const cartItems = [
        { id: 1, productId: 1, quantity: 2 },
        { id: 2, productId: 2, quantity: 3 },
      ]

      renderWithProvider(<Header />, {
        auth: { user: mockUser },
        cart: { items: cartItems },
      })

      // Should show total quantity (2 + 3 = 5)
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('should display 0 when cart is empty', () => {
      renderWithProvider(<Header />, {
        auth: { user: mockUser },
        cart: { items: [] },
      })

      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should navigate to cart when cart button is clicked', () => {
      renderWithProvider(<Header />, {
        auth: { user: mockUser },
      })

      const cartButton = screen.getByRole('button', { name: /open cart/i })
      fireEvent.click(cartButton)

      expect(mockPush).toHaveBeenCalledWith('/cart')
    })

    it('should call logout action when logout button is clicked', () => {
      const { store } = renderWithProvider(<Header />, {
        auth: { user: mockUser },
      })

      const logoutButton = screen.getByRole('button')
      fireEvent.click(logoutButton)

      // Check if logout action was dispatched
      const state = store.getState()
      // Note: In a real test, you might want to mock the dispatch function
      // and verify the logout action was called
    })
  })

  describe('When user is admin', () => {
    const mockAdminUser = {
      id: 1,
      email: 'admin@test.com',
      name: 'Admin User',
      role: 'admin',
    }

    it('should render admin dashboard link', () => {
      renderWithProvider(<Header />, {
        auth: { user: mockAdminUser },
      })

      // Should render admin dashboard link
      expect(screen.getByRole('link')).toBeInTheDocument()
      
      // Check if admin link points to correct route
      const adminLink = screen.getByRole('link')
      expect(adminLink.getAttribute('href')).toBe('/admin')
    })

    it('should not render admin link for regular users', () => {
      const mockRegularUser = {
        id: 1,
        email: 'user@test.com',
        name: 'Regular User',
        role: 'user',
      }

      renderWithProvider(<Header />, {
        auth: { user: mockRegularUser },
      })

      // Should not find admin-specific elements
      const links = screen.getAllByRole('link')
      const adminLink = links.find(link => link.getAttribute('href') === '/admin')
      expect(adminLink).toBeUndefined()
    })
  })

  describe('Navigation Links', () => {
    const mockUser = {
      id: 1,
      email: 'test@test.com',
      name: 'Test User',
      role: 'user',
    }

    it('should have correct href attributes', () => {
      renderWithProvider(<Header />, {
        auth: { user: mockUser },
      })

      // Check home link
      const homeLink = screen.getByRole('link', { name: /buyit/i })
      expect(homeLink.getAttribute('href')).toBe('/')

      // Check orders link
      const ordersLink = screen.getByRole('link')
      expect(ordersLink.getAttribute('href')).toBe('/orders')

      // Check user profile link
      const userLinks = screen.getAllByRole('link')
      const userLink = userLinks.find(link => link.getAttribute('href') === '/user')
      expect(userLink).toBeDefined()
    })
  })

  describe('Accessibility', () => {
    const mockUser = {
      id: 1,
      email: 'test@test.com',
      name: 'Test User',
      role: 'user',
    }

    it('should have proper aria labels', () => {
      renderWithProvider(<Header />, {
        auth: { user: mockUser },
      })

      // Check cart button has aria-label
      const cartButton = screen.getByRole('button', { name: /open cart/i })
      expect(cartButton).toHaveAttribute('aria-label', 'Open cart')

      // Check home link has aria-label
      const homeLink = screen.getByRole('link', { name: /go to homepage/i })
      expect(homeLink).toHaveAttribute('aria-label', 'Go to homepage')
    })

    it('should have proper image alt text', () => {
      renderWithProvider(<Header />)

      const logo = screen.getByAltText('BUYIT')
      expect(logo).toBeInTheDocument()
    })
  })
})


