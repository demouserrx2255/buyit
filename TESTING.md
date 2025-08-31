# Testing Guide for BuyIt E-commerce Application

This document provides comprehensive information about the testing setup and guidelines for the BuyIt project.

## Testing Stack

- **Jest**: JavaScript testing framework
- **React Testing Library**: Testing utilities for React components
- **@testing-library/jest-dom**: Custom Jest matchers for DOM elements
- **@testing-library/user-event**: User interaction utilities

## Project Structure

```
src/
├── __tests__/
│   ├── components/
│   │   └── Header.test.js
│   ├── lib/
│   │   ├── api.test.js
│   │   ├── config.test.js
│   │   └── utils.test.js
│   ├── store/
│   │   ├── authSlice.test.js
│   │   └── cartSlice.test.js
│   └── utils/
│       └── test-utils.js
├── jest.config.js
└── jest.setup.js
```

## Available Test Scripts

```bash
# Run all tests once
npm test

# Run tests in watch mode (reruns when files change)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests in CI environment
npm run test:ci
```

## Test Configuration

### Jest Configuration (`jest.config.js`)

- **Environment**: jsdom (simulates browser environment)
- **Setup**: `jest.setup.js` for global test configuration
- **Module Mapping**: `@/` maps to `src/` directory
- **Coverage**: Collects coverage from all source files
- **Thresholds**: 70% coverage requirement for branches, functions, lines, and statements

### Test Setup (`jest.setup.js`)

- Imports `@testing-library/jest-dom` for custom matchers
- Mocks Next.js modules (`next/router`, `next/navigation`, `next/image`)
- Mocks browser APIs (`localStorage`, `matchMedia`)
- Configures console.error handling for cleaner test output

## Test Categories

### 1. Utility Function Tests (`src/__tests__/lib/`)

**utils.test.js**: Tests for utility functions
- `getImageUrl()`: URL building and validation
- `formatPrice()`: Price formatting with different currencies
- `truncateText()`: Text truncation with various edge cases

**config.test.js**: Tests for configuration module
- Default configuration validation
- Environment variable handling
- Named exports verification

**api.test.js**: Tests for API client
- Axios instance configuration
- Authentication token handling
- Request/response interceptors
- HTTP method testing

### 2. Redux Store Tests (`src/__tests__/store/`)

**authSlice.test.js**: Authentication state management
- Initial state validation
- Login/register async thunks
- Logout action
- Error handling
- Token persistence

**cartSlice.test.js**: Shopping cart state management
- Cart fetching, adding, and removing items
- State transitions (pending, fulfilled, rejected)
- Cart calculations and edge cases

### 3. Component Tests (`src/__tests__/components/`)

**Header.test.js**: Header component functionality
- Rendering with different user states (logged in/out, admin/user)
- Navigation functionality
- Cart count display
- User interactions (logout, cart navigation)
- Accessibility features

## Test Utilities (`src/__tests__/utils/test-utils.js`)

### Custom Render Function

```javascript
import { renderWithProviders } from '../__tests__/utils/test-utils'

// Render component with Redux store
const { store } = renderWithProviders(<YourComponent />, {
  initialState: {
    auth: { user: mockUser },
    cart: { items: mockCartItems }
  }
})
```

### Mock Data

- `mockUsers`: Sample user data (regular user, admin)
- `mockProducts`: Sample product data
- `mockCartItems`: Sample cart items
- `mockOrders`: Sample order data
- `mockApiResponses`: Predefined API response mocks

### Helper Functions

- `createMockStore()`: Creates Redux store with initial state
- `waitFor()`: Utility for async operations
- `renderWithProviders()`: Renders components with Redux Provider

## Writing Tests

### Best Practices

1. **Test Structure**: Follow AAA pattern (Arrange, Act, Assert)
2. **Descriptive Names**: Use clear, descriptive test names
3. **Isolation**: Each test should be independent
4. **Mocking**: Mock external dependencies (API calls, localStorage)
5. **Coverage**: Aim for high code coverage but focus on critical paths

### Component Testing Example

```javascript
import { renderWithProviders } from '../utils/test-utils'
import YourComponent from '../../components/YourComponent'

describe('YourComponent', () => {
  it('should render with user data', () => {
    const { getByText } = renderWithProviders(<YourComponent />, {
      initialState: {
        auth: { user: { name: 'John Doe' } }
      }
    })
    
    expect(getByText('John Doe')).toBeInTheDocument()
  })
})
```

### Redux Testing Example

```javascript
import reducer, { someAction } from '../../store/slices/yourSlice'

describe('Your Slice', () => {
  it('should handle action correctly', () => {
    const initialState = { value: 0 }
    const action = someAction(5)
    const newState = reducer(initialState, action)
    
    expect(newState.value).toBe(5)
  })
})
```

## Coverage Reports

After running `npm run test:coverage`, you'll find coverage reports in:
- **Terminal**: Summary coverage table
- **coverage/lcov-report/index.html**: Detailed HTML report
- **coverage/lcov.info**: LCOV format for CI/CD integration

## Continuous Integration

The test suite is configured to run in CI environments:
- Uses `--ci` flag for optimized CI performance
- Generates coverage reports
- Fails build if coverage thresholds aren't met
- Runs without file watching (`--watchAll=false`)

## Troubleshooting

### Common Issues

1. **Mock Issues**: Ensure mocks are properly configured in `jest.setup.js`
2. **Async Tests**: Use `await` and proper async/await patterns
3. **Redux State**: Use `renderWithProviders` for components that need Redux
4. **Environment Variables**: Mock environment variables in test files when needed

### Debugging Tests

```bash
# Run specific test file
npm test -- Header.test.js

# Run tests matching pattern
npm test -- --testNamePattern="should render"

# Run tests in verbose mode
npm test -- --verbose
```

## Future Enhancements

- **E2E Testing**: Consider adding Cypress or Playwright
- **Visual Regression**: Add screenshot testing
- **Performance Testing**: Add performance benchmarks
- **Integration Tests**: Add more API integration tests
- **Accessibility Testing**: Enhance a11y testing coverage

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://testing-library.com/docs/guiding-principles/)
- [Redux Testing Guide](https://redux.js.org/usage/writing-tests)


