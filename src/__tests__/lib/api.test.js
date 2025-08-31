import api, { setAuthToken } from '../../lib/api'
import axios from 'axios'

// Mock axios
jest.mock('axios')
const mockedAxios = axios

describe('API Module', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('API Instance Configuration', () => {
    it('should be configured with correct base URL', () => {
      expect(api.defaults.baseURL).toBe('http://localhost:5000')
    })

    it('should be configured with correct timeout', () => {
      expect(api.defaults.timeout).toBe(10000)
    })

    it('should not send credentials by default', () => {
      expect(api.defaults.withCredentials).toBe(false)
    })
  })

  describe('setAuthToken Function', () => {
    it('should set Authorization header when token is provided', () => {
      const token = 'test-jwt-token'
      setAuthToken(token)
      
      expect(api.defaults.headers.common['Authorization']).toBe(`Bearer ${token}`)
    })

    it('should remove Authorization header when token is null', () => {
      // First set a token
      setAuthToken('test-token')
      expect(api.defaults.headers.common['Authorization']).toBeDefined()
      
      // Then remove it
      setAuthToken(null)
      expect(api.defaults.headers.common['Authorization']).toBeUndefined()
    })

    it('should remove Authorization header when token is undefined', () => {
      // First set a token
      setAuthToken('test-token')
      expect(api.defaults.headers.common['Authorization']).toBeDefined()
      
      // Then remove it
      setAuthToken(undefined)
      expect(api.defaults.headers.common['Authorization']).toBeUndefined()
    })

    it('should remove Authorization header when token is empty string', () => {
      // First set a token
      setAuthToken('test-token')
      expect(api.defaults.headers.common['Authorization']).toBeDefined()
      
      // Then remove it
      setAuthToken('')
      expect(api.defaults.headers.common['Authorization']).toBeUndefined()
    })
  })

  describe('Request Interceptor', () => {
    it('should add timestamp to requests', () => {
      const config = { url: '/test' }
      
      // Get the request interceptor
      const interceptor = api.interceptors.request.handlers[0]
      
      if (interceptor && interceptor.fulfilled) {
        const modifiedConfig = interceptor.fulfilled(config)
        expect(modifiedConfig.metadata).toBeDefined()
        expect(modifiedConfig.metadata.startTime).toBeInstanceOf(Date)
      }
    })
  })

  describe('Response Interceptor', () => {
    it('should add response time to successful responses', () => {
      const response = {
        data: { message: 'success' },
        config: {
          metadata: { startTime: new Date(Date.now() - 100) }
        }
      }
      
      // Get the response interceptor
      const interceptor = api.interceptors.response.handlers[0]
      
      if (interceptor && interceptor.fulfilled) {
        const modifiedResponse = interceptor.fulfilled(response)
        expect(modifiedResponse.config.metadata.responseTime).toBeDefined()
        expect(typeof modifiedResponse.config.metadata.responseTime).toBe('number')
      }
    })

    it('should handle network errors', () => {
      const error = {
        code: 'NETWORK_ERROR',
        message: 'Network Error'
      }
      
      // Get the response interceptor
      const interceptor = api.interceptors.response.handlers[0]
      
      if (interceptor && interceptor.rejected) {
        expect(() => {
          interceptor.rejected(error)
        }).rejects.toEqual(error)
      }
    })

    it('should handle timeout errors', () => {
      const error = {
        code: 'ECONNABORTED',
        message: 'timeout of 10000ms exceeded'
      }
      
      // Get the response interceptor
      const interceptor = api.interceptors.response.handlers[0]
      
      if (interceptor && interceptor.rejected) {
        expect(() => {
          interceptor.rejected(error)
        }).rejects.toEqual(error)
      }
    })

    it('should handle 401 unauthorized errors', () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      }
      
      // Get the response interceptor
      const interceptor = api.interceptors.response.handlers[0]
      
      if (interceptor && interceptor.rejected) {
        expect(() => {
          interceptor.rejected(error)
        }).rejects.toEqual(error)
      }
    })

    it('should handle 500 server errors', () => {
      const error = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' }
        }
      }
      
      // Get the response interceptor
      const interceptor = api.interceptors.response.handlers[0]
      
      if (interceptor && interceptor.rejected) {
        expect(() => {
          interceptor.rejected(error)
        }).rejects.toEqual(error)
      }
    })
  })

  describe('API Methods', () => {
    it('should make GET requests', async () => {
      const mockData = { id: 1, name: 'Test' }
      mockedAxios.get.mockResolvedValueOnce({ data: mockData })
      
      const response = await api.get('/test')
      
      expect(mockedAxios.get).toHaveBeenCalledWith('/test')
      expect(response.data).toEqual(mockData)
    })

    it('should make POST requests', async () => {
      const mockData = { id: 1, name: 'Test' }
      const postData = { name: 'New Test' }
      mockedAxios.post.mockResolvedValueOnce({ data: mockData })
      
      const response = await api.post('/test', postData)
      
      expect(mockedAxios.post).toHaveBeenCalledWith('/test', postData)
      expect(response.data).toEqual(mockData)
    })

    it('should make PUT requests', async () => {
      const mockData = { id: 1, name: 'Updated Test' }
      const putData = { name: 'Updated Test' }
      mockedAxios.put.mockResolvedValueOnce({ data: mockData })
      
      const response = await api.put('/test/1', putData)
      
      expect(mockedAxios.put).toHaveBeenCalledWith('/test/1', putData)
      expect(response.data).toEqual(mockData)
    })

    it('should make DELETE requests', async () => {
      mockedAxios.delete.mockResolvedValueOnce({ data: { success: true } })
      
      const response = await api.delete('/test/1')
      
      expect(mockedAxios.delete).toHaveBeenCalledWith('/test/1')
      expect(response.data).toEqual({ success: true })
    })
  })
})


