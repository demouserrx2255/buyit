import { getImageUrl, formatPrice, truncateText } from '../../lib/utils'

// Mock the config module
jest.mock('../../lib/config', () => ({
  api: {
    baseURL: 'http://localhost:5000'
  }
}))

describe('Utils Functions', () => {
  describe('getImageUrl', () => {
    it('should return null for null or undefined input', () => {
      expect(getImageUrl(null)).toBeNull()
      expect(getImageUrl(undefined)).toBeNull()
      expect(getImageUrl('')).toBeNull()
    })

    it('should return full URL as is if already complete', () => {
      const httpUrl = 'http://example.com/image.jpg'
      const httpsUrl = 'https://example.com/image.jpg'
      
      expect(getImageUrl(httpUrl)).toBe(httpUrl)
      expect(getImageUrl(httpsUrl)).toBe(httpsUrl)
    })

    it('should build full URL from relative path', () => {
      const relativePath = 'images/product.jpg'
      const expected = 'http://localhost:5000/images/product.jpg'
      
      expect(getImageUrl(relativePath)).toBe(expected)
    })

    it('should handle paths with leading slash', () => {
      const pathWithSlash = '/images/product.jpg'
      const expected = 'http://localhost:5000/images/product.jpg'
      
      expect(getImageUrl(pathWithSlash)).toBe(expected)
    })

    it('should handle paths without leading slash', () => {
      const pathWithoutSlash = 'images/product.jpg'
      const expected = 'http://localhost:5000/images/product.jpg'
      
      expect(getImageUrl(pathWithoutSlash)).toBe(expected)
    })
  })

  describe('formatPrice', () => {
    it('should return empty string for null or undefined price', () => {
      expect(formatPrice(null)).toBe('')
      expect(formatPrice(undefined)).toBe('')
    })

    it('should format price with default USD currency', () => {
      expect(formatPrice(10.99)).toBe('$10.99')
      expect(formatPrice(0)).toBe('$0.00')
      expect(formatPrice(1000)).toBe('$1,000.00')
    })

    it('should format price with custom currency', () => {
      expect(formatPrice(10.99, 'EUR')).toBe('€10.99')
      expect(formatPrice(10.99, 'GBP')).toBe('£10.99')
    })

    it('should handle zero price', () => {
      expect(formatPrice(0)).toBe('$0.00')
    })

    it('should handle large numbers', () => {
      expect(formatPrice(1234567.89)).toBe('$1,234,567.89')
    })

    it('should handle decimal prices', () => {
      expect(formatPrice(19.99)).toBe('$19.99')
      expect(formatPrice(5.5)).toBe('$5.50')
    })
  })

  describe('truncateText', () => {
    it('should return original text if shorter than maxLength', () => {
      const shortText = 'Short text'
      expect(truncateText(shortText, 100)).toBe(shortText)
    })

    it('should return original text if equal to maxLength', () => {
      const text = 'A'.repeat(50)
      expect(truncateText(text, 50)).toBe(text)
    })

    it('should truncate text longer than maxLength', () => {
      const longText = 'A'.repeat(150)
      const result = truncateText(longText, 100)
      
      expect(result).toBe('A'.repeat(100) + '...')
      expect(result.length).toBe(103) // 100 + 3 dots
    })

    it('should use default maxLength of 100', () => {
      const longText = 'A'.repeat(150)
      const result = truncateText(longText)
      
      expect(result).toBe('A'.repeat(100) + '...')
    })

    it('should handle null or undefined text', () => {
      expect(truncateText(null)).toBe(null)
      expect(truncateText(undefined)).toBe(undefined)
    })

    it('should handle empty string', () => {
      expect(truncateText('')).toBe('')
    })

    it('should truncate with custom maxLength', () => {
      const text = 'This is a test string'
      const result = truncateText(text, 10)
      
      expect(result).toBe('This is a ...')
    })
  })
})


