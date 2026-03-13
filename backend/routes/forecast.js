import express from 'express'
import { fetchForecastGeneration } from '../services/elexonService.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const { startTime, endTime, horizon = 4 } = req.query
    if (!startTime || !endTime) {
      return res.status(400).json({ error: 'startTime and endTime are required' })
    }
    const data = await fetchForecastGeneration(startTime, endTime, Number(horizon))
    res.json(data)
  } catch (error) {
    console.error('Error fetching forecast:', error.message)
    res.status(500).json({ error: 'Failed to fetch forecast data' })
  }
})

export default router

