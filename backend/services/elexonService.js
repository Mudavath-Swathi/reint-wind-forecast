import axios from 'axios'


const BASE = 'https://data.elexon.co.uk/bmrs/api/v1'

function parseResponse(data) {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.data)) return data.data
  if (typeof data === 'string') {
    
    const lines = data.trim().split('\n')
    const results = []
    for (const line of lines) {
      try { results.push(JSON.parse(line.trim())) } catch { }
    }
    return results
  }
  return []
}

export async function fetchActualGeneration(startTime, endTime) {
  try {
    const response = await axios.get(`${BASE}/datasets/FUELHH/stream`, {
      params: {
        settlementDateFrom: startTime.split('T')[0],
        settlementDateTo:   endTime.split('T')[0],
        fuelType: 'WIND',
      }
    })
    const raw = parseResponse(response.data)
    console.log(`Actual records: ${raw.length}`)
    if (raw.length > 0) console.log('Sample:', JSON.stringify(raw[0]))

    return raw
      .filter(item => !item.fuelType || item.fuelType === 'WIND')
      .map(item => ({ startTime: item.startTime, generation: item.generation }))
      .filter(d => d.startTime && d.generation !== undefined)

  } catch (err) {
    console.error('fetchActualGeneration error:', err.message)
    return []
  }
}

export async function fetchForecastGeneration(startTime, endTime, horizon = 4) {
  try {
    const response = await axios.get(`${BASE}/datasets/WINDFOR/stream`, {
      params: {
        publishDateTimeFrom: startTime,
        publishDateTimeTo:   endTime,
      }
    })
    const raw = parseResponse(response.data)
    console.log(`Forecast records: ${raw.length}`)
    if (raw.length > 0) console.log('Sample:', JSON.stringify(raw[0]))

    const grouped = {}
    for (const item of raw) {
      const targetTime  = item.startTime
      const publishTime = item.publishTime
      if (!targetTime || !publishTime) continue
      const diffHours = (new Date(targetTime) - new Date(publishTime)) / (1000 * 60 * 60)
      if (diffHours >= horizon) {
        const existing = grouped[targetTime]
        if (!existing || new Date(publishTime) > new Date(existing.publishTime)) {
          grouped[targetTime] = { startTime: targetTime, publishTime, generation: item.generation }
        }
      }
    }

    const result = Object.values(grouped).map(({ startTime, generation }) => ({ startTime, generation }))
    console.log(`Forecast after horizon filter: ${result.length}`)
    return result

  } catch (err) {
    console.error('fetchForecastGeneration error:', err.message)
    return []
  }
}