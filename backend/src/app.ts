import express from 'express'
import cors from 'cors'
import publicRoutes from './routes/public'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api', publicRoutes)

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
