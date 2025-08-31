// Configuration file for the ecommerce frontend application

const config = {
  // API Configuration
  api: {
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://buyitbe.onrender.com',
    timeout: 10000,
    withCredentials: false,
  },
  
  // App Configuration
  app: {
    name: 'Ecommerce Store',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },
  
  // Feature Flags
  features: {
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    enableDebugMode: process.env.NODE_ENV === 'development',
  },
  
  // Pagination
  pagination: {
    defaultPageSize: 12,
    maxPageSize: 50,
  },
  
  // Image Configuration
  images: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    uploadEndpoint: '/api/upload',
  },
};

export default config;

// Export individual config sections for specific use cases
export const { api, app, features, pagination, images } = config;
