import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import xss from 'xss-clean'
import rateLimit from 'express-rate-limit'
import publicRoutes from './routes/public'

const app = express()

// Security middleware
app.use(helmet())

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { success: false, error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api', limiter)

// Body parser with size limit
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// XSS sanitization
app.use(xss())

// Logging
app.use(morgan('combined'))

// Routes
app.use('/api', publicRoutes)

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() })
})

// basic error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err)
  if (err?.issues) {
    // zod validation
    return res.status(400).json({ success: false, error: err.issues })
  }
  res.status(500).json({ success: false, error: err?.message || 'Internal server error' })
})

export default app
