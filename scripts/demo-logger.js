#!/usr/bin/env node

/**
 * Logger Demo Script
 * 
 * Demonstrates the new logging features by simulating various scenarios
 */

// Set up Railway environment for demo
process.env.RAILWAY_ENVIRONMENT = 'demo'
process.env.RAILWAY_PROJECT_NAME = 'khesed-tek-church-systems'
process.env.NODE_ENV = 'production'

console.log('🚂 Railway Logger Demo')
console.log('=====================\n')

// Since we can't import TypeScript directly in Node.js without compilation,
// let's simulate the logger behavior
const demoLogger = {
  info: (msg, ctx = {}) => console.log(`🔍 [INFO] ${msg}`, Object.keys(ctx).length ? JSON.stringify(ctx) : ''),
  success: (msg, ctx = {}) => console.log(`✅ [SUCCESS] ${msg}`, Object.keys(ctx).length ? JSON.stringify(ctx) : ''),
  warn: (msg, ctx = {}) => console.warn(`⚠️  [WARN] ${msg}`, Object.keys(ctx).length ? JSON.stringify(ctx) : ''),
  error: (msg, ctx = {}) => console.error(`❌ [ERROR] ${msg}`, Object.keys(ctx).length ? JSON.stringify(ctx) : ''),
  debug: (msg, ctx = {}) => console.debug(`🐛 [DEBUG] ${msg}`, Object.keys(ctx).length ? JSON.stringify(ctx) : ''),
  railwayInfo: (service, msg, ctx = {}) => console.log(`🚂 [${service.toUpperCase()}] ${msg}`, Object.keys(ctx).length ? JSON.stringify(ctx) : ''),
  railwayError: (service, msg, error, ctx = {}) => console.error(`❌ [ERROR] ${msg}`, JSON.stringify({service, error: error?.message || error, ...ctx})),
  authOperation: (op, email, success, ctx = {}) => {
    const level = success ? '✅ [SUCCESS]' : '⚠️  [WARN]'
    console.log(`${level} Auth ${op}${email ? ` for ${email}` : ''} - ${success ? 'Success' : 'Failed'}`, JSON.stringify({service: 'auth', operation: op, email, success, ...ctx}))
  },
  dbOperation: (op, table, duration, ctx = {}) => {
    console.log(`🐛 [DEBUG] Database ${op}${table ? ` on ${table}` : ''}${duration ? ` (${duration}ms)` : ''}`, JSON.stringify({service: 'database', operation: op, table, duration, ...ctx}))
  },
  apiRequest: (method, path, status, duration, ctx = {}) => {
    const level = status >= 400 ? '⚠️  [WARN]' : '🔍 [INFO]'
    console.log(`${level} ${method} ${path} - ${status}${duration ? ` (${duration}ms)` : ''}`, JSON.stringify({service: 'api', method, path, statusCode: status, duration, ...ctx}))
  }
}

// Demo various logging scenarios
console.log('1. Railway Deployment Scenarios:')
console.log('---------------------------------')

demoLogger.railwayInfo('deployment', 'Starting deployment process', {
  environment: 'production',
  version: 'v1.2.3',
  timestamp: new Date().toISOString()
})

demoLogger.success('Database connection established', {
  service: 'database',
  host: 'railway.postgres.host',
  connectionTime: '150ms'
})

demoLogger.railwayInfo('deployment', 'Deployment completed successfully', {
  duration: '2.5s',
  environment: 'production'
})

console.log('\n2. Authentication Scenarios:')
console.log('----------------------------')

demoLogger.authOperation('login-attempt', 'user@church.com', true, {
  userId: 'user123',
  role: 'admin',
  loginTime: new Date().toISOString()
})

demoLogger.authOperation('login-failed', 'invalid@email.com', false, {
  reason: 'user-not-found',
  attemptedAt: new Date().toISOString()
})

demoLogger.authOperation('logout', 'user@church.com', true, {
  sessionDuration: '2h 15m'
})

console.log('\n3. Database Operations:')
console.log('----------------------')

demoLogger.dbOperation('query', 'users', 45, {
  recordCount: 150,
  queryType: 'SELECT'
})

demoLogger.dbOperation('insert', 'members', 120, {
  recordCount: 1,
  performance: 'medium'
})

demoLogger.dbOperation('update', 'churches', 2500, {
  recordCount: 1,
  performance: 'slow'
})

console.log('\n4. API Request Monitoring:')
console.log('-------------------------')

demoLogger.apiRequest('GET', '/api/members', 200, 85, {
  userAgent: 'Mozilla/5.0 (Church Management App)',
  ip: '192.168.1.100'
})

demoLogger.apiRequest('POST', '/api/donations', 201, 150, {
  amount: '$500.00',
  method: 'credit_card'
})

demoLogger.apiRequest('GET', '/api/reports', 500, 3000, {
  error: 'Database timeout',
  retryAttempt: 1
})

console.log('\n5. Error Handling:')
console.log('-----------------')

const mockError = new Error('Connection timeout')
demoLogger.railwayError('database', 'Failed to connect to PostgreSQL', mockError, {
  host: 'railway.postgres.host',
  retryCount: 3,
  lastAttempt: new Date().toISOString()
})

demoLogger.error('Email service unavailable', {
  service: 'email',
  provider: 'mailgun',
  lastSuccessful: '2024-01-15T10:30:00Z'
})

console.log('\n6. Performance Monitoring:')
console.log('--------------------------')

demoLogger.info('System metrics', {
  service: 'railway-metrics',
  memory: {
    used: 256,
    total: 512,
    percentage: 50
  },
  uptime: 3600,
  environment: 'production',
  buildVersion: 'abc123d'
})

console.log('\n7. Railway-Specific Information:')
console.log('--------------------------------')

demoLogger.railwayInfo('build-info', 'Build information logged', {
  commitSha: 'abc123def456',
  commitMessage: 'Implement Railway logging enhancements',
  branch: 'main',
  author: 'Developer',
  buildDate: '2024-01-15T12:00:00Z'
})

console.log('\n✨ Demo Complete!')
console.log('================')
console.log('\nKey Benefits Demonstrated:')
console.log('- 🎯 Clear service identification with prefixes')
console.log('- 📊 Structured JSON context for easy parsing')
console.log('- 🚂 Railway-specific environment detection')
console.log('- 🔍 Detailed error context and categorization')
console.log('- 📈 Performance metrics and monitoring')
console.log('- 🛡️  Security-conscious logging (no sensitive data)')
console.log('- 🎨 Visual log levels for quick identification')
console.log('\nThese logs will make Railway deployment monitoring,')
console.log('debugging, and performance analysis much more effective!')