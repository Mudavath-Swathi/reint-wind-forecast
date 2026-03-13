import { useState, useEffect, useRef } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid,Tooltip, ResponsiveContainer} from 'recharts'
import axios from 'axios'

const API_BASE = 'https://reint-wind-forecast-backend.onrender.com/api'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload[0]?.value != null && (
          <p className="tooltip-actual">Actual: {Number(payload[0].value).toLocaleString()} MW</p>
        )}
        {payload[1]?.value != null && (
          <p className="tooltip-forecast">Forecast: {Number(payload[1].value).toLocaleString()} MW</p>
        )}
      </div>
    )
  }
  return null
}

export default function App() {
  const [startTime, setStartTime] = useState('2024-01-15T08:00')
  const [endTime,   setEndTime]   = useState('2024-01-16T08:00')
  const [horizon,   setHorizon]   = useState(4)
  const [chartData, setChartData] = useState([])
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const sliderRef  = useRef(null)
  const chartRef   = useRef(null)

  const handleDownload = () => {
    const svg = chartRef.current?.querySelector('svg')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas  = document.createElement('canvas')
    const rect    = svg.getBoundingClientRect()
    canvas.width  = rect.width  || 1200
    canvas.height = rect.height || 400
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const img = new Image()
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    img.onload = () => {
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      const a = document.createElement('a')
      a.download = `wind-forecast-${startTime.slice(0,10)}.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
    }
    img.src = url
  }

  const [metrics, setMetrics] = useState({
    avgError: null, maxError: null,
    coverage: null, dataRange: 'Jan 01 – Jan 31, 2024'
  })

  const updateSliderBg = (val) => {
    const pct = (val / 48) * 100
    if (sliderRef.current) {
      sliderRef.current.style.background =
        `linear-gradient(to right, #2563eb ${pct}%, #e5e7eb ${pct}%)`
    }
  }

  useEffect(() => { updateSliderBg(horizon) }, [horizon])

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const start = new Date(startTime).toISOString()
      const end   = new Date(endTime).toISOString()

      const [actualRes, forecastRes] = await Promise.all([
        axios.get(`${API_BASE}/actual`,   { params: { startTime: start, endTime: end } }),
        axios.get(`${API_BASE}/forecast`, { params: { startTime: start, endTime: end, horizon } })
      ])

      const actualMap = {}
      for (const item of actualRes.data) actualMap[item.startTime] = item.generation

      const forecastMap = {}
      for (const item of forecastRes.data) forecastMap[item.startTime] = item.generation

      const allTimes = [
        ...new Set([...Object.keys(actualMap), ...Object.keys(forecastMap)])
      ].sort()

      const merged = allTimes.map(time => ({
        time,
        label:    new Date(time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        actual:   actualMap[time]   ?? null,
        forecast: forecastMap[time] ?? null,
      }))

      setChartData(merged)
      computeMetrics(merged)
    } catch (err) {
      console.error(err)
      setError('Failed to fetch data. Make sure the backend is running on port 5000.')
    } finally {
      setLoading(false)
    }
  }

  const computeMetrics = (data) => {
    const paired = data.filter(d => d.actual != null && d.forecast != null)
    if (!paired.length) return
    const errors   = paired.map(d => d.forecast - d.actual)
    const avgErr   = errors.reduce((a, b) => a + b, 0) / errors.length
    const maxErr   = errors.reduce((a, b) => Math.abs(b) > Math.abs(a) ? b : a, 0)
    const coverage = (paired.length / data.length) * 100
    setMetrics({
      avgError:  avgErr.toFixed(0),
      maxError:  maxErr.toFixed(0),
      coverage:  coverage.toFixed(1),
      dataRange: 'Jan 01 – Jan 31, 2024'
    })
  }

  useEffect(() => { fetchData() }, [])

  const avgColor = Number(metrics.avgError) >= 0 ? 'orange' : 'blue'
  const maxColor = Number(metrics.maxError) >= 0 ? 'orange' : 'blue'

  return (
    <div>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="navbar-logo-wrap">
            <img src="/reint-logo.png" alt="REint AI" style={{height:'36px', width:'auto', objectFit:'contain'}} />
          </div>
          <div className="navbar-divider" />
          <span className="navbar-title">Forecast Monitoring</span>
        </div>
        <div className="navbar-actions">
          <button className="btn-icon" onClick={fetchData} title="Refresh">↻</button>
          <button className="btn-icon" title="Settings">⊙</button>
          <button className="btn-download" onClick={handleDownload}>⬇ Download</button>
        </div>
      </nav>

      {/* PAGE BODY */}
      <div className="page-body">

        {error && <div className="error-box">{error}</div>}

        {/* CONTROLS */}
        <div className="card">
          <div className="controls-grid">

            <div className="control-group">
              <label className="control-label">Start Time</label>
              <input
                className="input-box"
                type="datetime-local"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
              />
            </div>

            <div className="control-group">
              <label className="control-label">End Time</label>
              <input
                className="input-box"
                type="datetime-local"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
              />
            </div>

            <div className="horizon-group">
              <div className="horizon-header">
                <label className="control-label">Forecast Horizon</label>
                <span className="horizon-badge">{horizon}h</span>
              </div>
              <input
                ref={sliderRef}
                className="slider"
                type="range"
                min="0" max="48" step="1"
                value={horizon}
                onChange={e => {
                  const v = Number(e.target.value)
                  setHorizon(v)
                  updateSliderBg(v)
                }}
              />
              <div className="slider-labels">
                <span>0</span>
                <span>48 hrs</span>
              </div>
            </div>

            <button className="primary-btn" onClick={fetchData}>
              Update Chart
            </button>

          </div>
        </div>

        {/* CHART */}
        <div className="chart-card" ref={chartRef}>
          <div className="chart-header">
            <span className="chart-title">Wind Power Generation (MW)</span>
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-dot-blue" /> Actual Generation
              </div>
              <div className="legend-item">
                <div className="legend-dot-green" /> Forecasted Generation
              </div>
            </div>
          </div>

          <div className="chart-body">
          {loading ? (
          <div className="loading-box">Loading data...</div>
          ) : chartData.length === 0 ? (
            <div className="loading-box">No data for selected range.</div>
          ) : (
          <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    tickLine={false}
                    axisLine={false}
                    label={{
                      value: 'Power (MW)', angle: -90,
                      position: 'insideLeft', offset: 10,
                      style: { fontSize: 11, fill: '#9ca3af' }
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="actual"   stroke="#2563eb" strokeWidth={2.5} dot={false} name="Actual"   connectNulls={false} />
                  <Line type="monotone" dataKey="forecast" stroke="#16a34a" strokeWidth={2.5} dot={false} name="Forecast" connectNulls={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* METRICS */}
        <div className="metrics-grid">

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-icon-blue">⟳</span> Avg Forecast Error
            </div>
            <div className={`metric-value ${avgColor}`}>
              {metrics.avgError !== null
                ? `${Number(metrics.avgError) > 0 ? '+' : ''}${Number(metrics.avgError).toLocaleString()} MW`
                : '—'}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-icon-red">⊙</span> Max Error
            </div>
            <div className={`metric-value ${maxColor}`}>
              {metrics.maxError !== null
                ? `${Number(metrics.maxError) > 0 ? '+' : ''}${Number(metrics.maxError).toLocaleString()} MW`
                : '—'}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-icon-green">✓</span> Coverage
            </div>
            <div className="metric-value green">
              {metrics.coverage !== null ? `${metrics.coverage}%` : '—'}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-icon-gray">▦</span> Data Range
            </div>
            <div className="metric-value dark">{metrics.dataRange}</div>
          </div>

        </div>
      </div>
    </div>
  )
}