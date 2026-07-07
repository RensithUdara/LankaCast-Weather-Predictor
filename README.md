# 🌦️ LankaCast

> A creative machine-learning weather forecast web app for Sri Lanka.

LankaCast predicts district-level weather conditions using a trained ML model, a FastAPI backend, and a modern React + Vite frontend. Pick a Sri Lankan district, choose a date, and get a clean forecast for temperature, rainfall, wind, elevation, daylight, and a seven-day forecast window.

---

## ✨ What This Project Does

LankaCast is built to make weather forecasting feel simple, visual, and local.

It provides:

- 🌡️ Temperature predictions in Celsius and Fahrenheit
- 🌧️ Rainfall prediction in millimeters
- 💨 Wind speed prediction in km/h
- 🏔️ Elevation-aware district forecasting
- 🌅 Sunrise and sunset display
- 📅 Previous day, today, and next day controls
- 🧠 ML-powered predictions from a trained model
- 🗺️ Forecasts for 27 Sri Lankan districts
- 📊 Seven-day forecast timeline around the selected date
- 🚀 Vercel-ready frontend and serverless API setup

---

## 🖼️ App Preview

The frontend is a polished weather dashboard with:

- A visual hero section
- District and date controls
- Current forecast summary
- Weather metric cards
- Daylight panel
- Seven-day forecast timeline
- Responsive layout for desktop and mobile

The app entry point is:

```text
weatherApp/src/App.jsx
```

---

## 🧱 Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19 + Vite |
| Styling | CSS |
| Icons | lucide-react |
| API Client | Axios |
| Backend | FastAPI |
| Server | Uvicorn |
| ML/Data | pandas, NumPy, scikit-learn |
| Package Manager | npm + uv |
| Deployment | Vercel |

---

## 📁 Project Structure

```text
WeatherLK-main/
├── api/
│   └── index.py              # Vercel serverless API entry
├── weatherApp/
│   ├── public/
│   │   ├── weather-bg.png
│   │   └── weather_background.png
│   ├── src/
│   │   ├── App.jsx           # Main React weather dashboard
│   │   ├── App.css           # App styling and animations
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── locationData.csv          # City coordinates and elevation data
├── weatherData.csv           # Historical/source weather dataset
├── weather_model.pkl         # Trained ML prediction model
├── WheatherApp.ipynb         # Notebook used for experimentation/training
├── main.py                   # FastAPI backend
├── package.json              # Root scripts
├── pyproject.toml            # Python dependencies
├── vercel.json               # Vercel routing/build config
└── README.md
```

---

## 🧠 How It Works

1. The user selects a district and forecast date in the React app.
2. The frontend sends a request to the prediction API.
3. FastAPI loads:
   - `weather_model.pkl`
   - `locationData.csv`
4. The backend finds the selected district's:
   - latitude
   - longitude
   - elevation
5. The date is converted into:
   - month
   - day of year
6. The ML model predicts:
   - temperature
   - rainfall
   - wind speed
7. The frontend renders the result as a weather dashboard.

---

## 🌍 Supported Districts / Cities

The frontend currently supports:

```text
Colombo, Gampaha, Kalutara, Kandy, Matale, Nuwara Eliya,
Galle, Matara, Hambantota, Jaffna, Kilinochchi, Mannar,
Vavuniya, Mullaitivu, Batticaloa, Ampara, Trincomalee,
Kurunegala, Puttalam, Anuradhapura, Polonnaruwa, Badulla,
Moneragala, Ratnapura, Kegalle, Welimada, Bandarawela
```

The backend matches these names against `locationData.csv`.

---

## ⚙️ Prerequisites

Install these before running the project:

- 🟢 Node.js
- 📦 npm
- 🐍 Python 3.13 or newer
- ⚡ uv Python package manager

Check versions:

```bash
node --version
npm --version
python --version
uv --version
```

---

## 🚀 Quick Start

### 1. Clone the project

```bash
git clone <your-repository-url>
cd WeatherLK-main
```

### 2. Install root Node dependencies

```bash
npm install
```

### 3. Install frontend dependencies

```bash
npm install --prefix weatherApp
```

### 4. Install Python dependencies

```bash
uv sync
```

### 5. Start the full app

```bash
npm run start
```

This runs both:

- Backend: `http://127.0.0.1:8000`
- Frontend: Vite local development URL, usually `http://localhost:5173`

---

## 🧪 Run Frontend and Backend Separately

### Backend only

```bash
npm run backend
```

or:

```bash
uv run main.py
```

Backend URL:

```text
http://127.0.0.1:8000
```

### Frontend only

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

## 🔌 API Reference

### Predict Weather

```http
GET /api/predict?city=Colombo&date=2026-03-15
```

Local backend also supports:

```http
GET /predict?city=Colombo&date=2026-03-15
```

### Query Parameters

| Name | Type | Required | Example | Description |
| --- | --- | --- | --- | --- |
| `city` | string | Yes | `Colombo` | District/city name |
| `date` | string | Yes | `2026-03-15` | Forecast date in `YYYY-MM-DD` format |

### Example Response

```json
{
  "city": "Colombo",
  "temperature_c": 29.42,
  "rain_mm": 4.18,
  "wind_kmh": 12.77,
  "sunrise": "06:15 AM",
  "sunset": "06:45 PM",
  "elevation_m": 7.0
}
```

### Error Responses

```json
{
  "error": "City not found"
}
```

```json
{
  "error": "Invalid date format. Use YYYY-MM-DD"
}
```

---

## 🧭 Environment Configuration

The frontend reads the API URL from:

```text
VITE_API_URL
```

If this variable is not set, it defaults to:

```text
/api/predict
```

For local frontend development against the local backend, create:

```text
weatherApp/.env
```

Example:

```env
VITE_API_URL=http://127.0.0.1:8000/api/predict
```

---

## 🏗️ Build

Build the frontend:

```bash
npm run build
```

This runs:

```bash
npm install --prefix weatherApp
npm run build --prefix weatherApp
```

The production build is created in:

```text
weatherApp/dist
```

---

## ☁️ Vercel Deployment

This project includes `vercel.json` for deployment.

Vercel configuration:

- Builds the React app from `weatherApp`
- Outputs static files to `weatherApp/dist`
- Uses `api/index.py` as the serverless API entry
- Includes `weather_model.pkl` and `locationData.csv` in the API function
- Excludes large development/runtime files from deployment
- Rewrites `/api/*` and `/predict` to the Python API
- Rewrites all other routes to the frontend app

Deploy command:

```bash
vercel
```

Production deploy:

```bash
vercel --prod
```

---

## 📦 Important Data Files

| File | Purpose |
| --- | --- |
| `weather_model.pkl` | Trained model used for prediction |
| `locationData.csv` | District latitude, longitude, and elevation |
| `weatherData.csv` | Weather dataset used for model work |
| `WheatherApp.ipynb` | Notebook for model/data exploration |

⚠️ `weather_model.pkl` is a large binary file. Make sure your deployment platform supports the file size before deploying.

---

## 🛠️ Useful Scripts

### Root scripts

| Command | Description |
| --- | --- |
| `npm run start` | Run backend and frontend together |
| `npm run backend` | Run FastAPI backend |
| `npm run dev` | Run Vite frontend |
| `npm run build` | Build frontend for production |

### Frontend scripts

Run these inside `weatherApp` or with `--prefix weatherApp`.

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build frontend |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 🧯 Troubleshooting

### ❌ Server connection failed

Make sure the backend is running:

```bash
uv run main.py
```

Then test:

```text
http://127.0.0.1:8000/api/predict?city=Colombo&date=2026-03-15
```

### ❌ City not found

Check that the city exists in `locationData.csv` and matches the frontend city list.

### ❌ Invalid date format

Use this format:

```text
YYYY-MM-DD
```

Example:

```text
2026-03-15
```

### ❌ Model file error

Confirm this file exists in the project root:

```text
weather_model.pkl
```

### ❌ Frontend cannot find backend locally

Create `weatherApp/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000/api/predict
```

Restart the Vite dev server after editing `.env`.

---

## 💡 Future Improvements

- 🌤️ Add real sunrise/sunset calculations
- 📍 Add map-based district selection
- 📈 Add forecast charts
- 🧪 Add automated tests for API and UI
- 🧾 Add model training documentation
- 🌐 Add Sinhala and Tamil language support
- 🔐 Restrict CORS origins for production
- 📱 Improve mobile-first weather interactions

---

## 🤝 Contributing

Contributions are welcome.

Suggested workflow:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test frontend and backend locally
5. Submit a pull request

---

## 📜 License

Add your preferred license here, for example:

```text
MIT License
```

---

## 🌦️ Final Note

LankaCast combines Sri Lankan location data, machine learning, and a clean web experience to make weather forecasting more local, visual, and fun.

Made with ☁️, data, and a little sunshine.
