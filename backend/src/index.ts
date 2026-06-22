import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import { initDb } from './db'
import usersRouter from './routes/users'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api/users', usersRouter)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.message)
  res.status(500).json({ error: 'Internal server error' })
})

initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`Backend running on port ${PORT}`))
  })
  .catch((err) => {
    console.error('DB init failed:', err)
    process.exit(1)
  })
