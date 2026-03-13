import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import actualRoutes from './routes/actual.js'
import forecastRoutes from './routes/forecast.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.use('/api/actual', actualRoutes)
app.use('/api/forecast', forecastRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'REint Wind Forecast API running' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})