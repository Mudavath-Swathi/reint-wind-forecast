import express from 'express'
import { fetchActualGeneration } from '../services/elexonService.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const { startTime, endTime } = req.query
    if (!startTime || !endTime) {
      return res.status(400).json({ error: 'startTime and endTime are required' })
    }
    const data = await fetchActualGeneration(startTime, endTime)
    res.json(data)
  } catch (error) {
    console.error('Error fetching actual:', error.message)
    res.status(500).json({ error: 'Failed to fetch actual generation data' })
  }
})

export default router