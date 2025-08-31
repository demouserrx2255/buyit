import config, { api, app, features, pagination, images } from '../../lib/config'

describe('Config Module', () => {
  beforeEach(() => {
    // Reset environment variables
    delete process.env.NEXT_PUBLIC_API_URL
    delete process.env.NODE_ENV
    delete process.env.NEXT_PUBLIC_ENABLE_ANALYTICS
  })

  describe('Default Configuration', () => {
    it('should have correct default API configuration', () => {
      expect(config.api).toEqual({
        baseURL: 'http://localhost:5000',
        timeout: 10000,
        withCredentials: false,
      })
    })

    it('should have correct app configuration', () => {
      expect(config.app).toEqual({
        name: 'Ecommerce Store',
        version: '1.0.0',
        environment: 'development',
      })
    })

    it('should have correct feature flags', () => {
      expect(config.features).toEqual({
        enableAnalytics: false,
        enableDebugMode: true,
      })
    })

    it('should have correct pagination settings', () => {
      expect(config.pagination).toEqual({
        defaultPageSize: 12,
        maxPageSize: 50,
      })
    })

    it('should have correct image configuration', () => {
      expect(config.images).toEqual({
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        uploadEndpoint: '/api/upload',
      })
    })
  })

  describe('Environment Variables', () => {
    it('should use custom API URL from environment', () => {
      process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com'
      
      // Re-import the module to get updated env values
      jest.resetModules()
      const updatedConfig = require('../../lib/config').default
      
      expect(updatedConfig.api.baseURL).toBe('https://api.example.com')
    })

    it('should enable analytics when env variable is set', () => {
      process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = 'true'
      
      jest.resetModules()
      const updatedConfig = require('../../lib/config').default
      
      expect(updatedConfig.features.enableAnalytics).toBe(true)
    })

    it('should disable debug mode in production', () => {
      process.env.NODE_ENV = 'production'
      
      jest.resetModules()
      const updatedConfig = require('../../lib/config').default
      
      expect(updatedConfig.features.enableDebugMode).toBe(false)
    })
  })

  describe('Named Exports', () => {
    it('should export individual config sections', () => {
      expect(api).toBeDefined()
      expect(app).toBeDefined()
      expect(features).toBeDefined()
      expect(pagination).toBeDefined()
      expect(images).toBeDefined()
    })

    it('should have consistent values with main config', () => {
      expect(api).toEqual(config.api)
      expect(app).toEqual(config.app)
      expect(features).toEqual(config.features)
      expect(pagination).toEqual(config.pagination)
      expect(images).toEqual(config.images)
    })
  })

  describe('Config Validation', () => {
    it('should have valid image file size', () => {
      expect(config.images.maxFileSize).toBeGreaterThan(0)
      expect(typeof config.images.maxFileSize).toBe('number')
    })

    it('should have valid pagination values', () => {
      expect(config.pagination.defaultPageSize).toBeGreaterThan(0)
      expect(config.pagination.maxPageSize).toBeGreaterThan(config.pagination.defaultPageSize)
    })

    it('should have valid API timeout', () => {
      expect(config.api.timeout).toBeGreaterThan(0)
      expect(typeof config.api.timeout).toBe('number')
    })

    it('should have valid allowed image types', () => {
      expect(Array.isArray(config.images.allowedTypes)).toBe(true)
      expect(config.images.allowedTypes.length).toBeGreaterThan(0)
      config.images.allowedTypes.forEach(type => {
        expect(type).toMatch(/^image\//)
      })
    })
  })
})


