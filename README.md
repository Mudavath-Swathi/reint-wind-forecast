# REint AI — Wind Forecast Monitoring

A full-stack web application to monitor UK wind power generation forecasts vs actuals, built for the REint AI Full Stack SWE challenge.

## Live Demo
🔗 [Deployed App](https://reint-wind-forecast-liard.vercel.app/)

## Demo Video
🎬 [YouTube Demo]((https://youtu.be/_SyUV9psodg))

## GitHub
💻 [Repository](https://github.com/Mudavath-Swathi/reint-wind-forecast)

---

## Project Structure

```
reint-wind-forecast/
├── frontend/               # React + Vite frontend
│   ├── public/
│   │   └── reint-logo.png  # REint AI logo
│   └── src/
│       ├── App.jsx         # Main dashboard component
│       └── index.css       # All styles
├── backend/                # Node.js + Express API
│   ├── server.js           # Express server
│   ├── routes/
│   │   ├── actual.js       # GET /api/actual
│   │   └── forecast.js     # GET /api/forecast
│   └── services/
│       └── elexonService.js  # Elexon API calls + horizon logic
├── analysis/
│   └── wind_forecast_analysis.ipynb  # Part 2 Jupyter analysis
└── README.md
```

---

## How to Run Locally

### Prerequisites
- Node.js v18+
- Python 3.9+ with pip

### Backend
```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

### Jupyter Notebook (Part 2)
```bash
cd analysis
pip install pandas numpy matplotlib requests jupyter
jupyter notebook wind_forecast_analysis.ipynb
```

---

## Features

### Part 1 — Web App
- Date range picker (start/end datetime)
- Forecast horizon slider (0–48 hours)
- Live line chart: actual wind (blue) vs forecast (green)
- Horizon logic: shows latest forecast published ≥ N hours before each target time
- Metric cards: Avg Error, Max Error, Coverage, Data Range
- Download chart as PNG
- Mobile responsive
- Data source: Elexon UK BMRS API (FUELHH + WINDFOR datasets)

### Part 2 — Analysis Notebook
- Error characteristics: mean, median, MAE, RMSE, P99
- Error vs forecast horizon (1h to 48h)
- Error by time of day (hourly breakdown)
- Historical actual generation statistics (P10, P25, P75, P90)
- Reliable MW recommendation with reasoning

---

## Data Sources
- **Actual**: `https://data.elexon.co.uk/bmrs/api/v1/datasets/FUELHH/stream` (fuelType=WIND)
- **Forecast**: `https://data.elexon.co.uk/bmrs/api/v1/datasets/WINDFOR/stream`
- Period: January 2024

---

## Tech Stack
- **Frontend**: React.js, Recharts, Vite, CSS
- **Backend**: Node.js, Express.js, Axios
- **Analysis**: Python, Pandas, NumPy, Matplotlib, Jupyter
- **Deploy**: Vercel (frontend), Render (backend)

---

## Deployment
- **Frontend**: Vercel — https://reint-wind-forecast-liard.vercel.app/
- **Backend**: Render — https://reint-wind-forecast-backend.onrender.com

---

## Submission
- **Author**: Swathi Chauhan
- **Email**: swathichauhan22@gmail.com
- **Submitted to**: hiring@reint.ai
