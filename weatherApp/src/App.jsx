import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  AlertCircle,
  Calendar,
  CloudRain,
  Compass,
  Droplets,
  Gauge,
  Loader2,
  MapPin,
  Mountain,
  RefreshCw,
  Search,
  Sparkles,
  Sunrise,
  Sunset,
  Thermometer,
  Waves,
  Wind,
} from "lucide-react";
import "./App.css";

const CITIES = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Matale",
  "Nuwara Eliya",
  "Galle",
  "Matara",
  "Hambantota",
  "Jaffna",
  "Kilinochchi",
  "Mannar",
  "Vavuniya",
  "Mullaitivu",
  "Batticaloa",
  "Ampara",
  "Trincomalee",
  "Kurunegala",
  "Puttalam",
  "Anuradhapura",
  "Polonnaruwa",
  "Badulla",
  "Moneragala",
  "Ratnapura",
  "Kegalle",
  "Welimada",
  "Bandarawela",
];

const API_URL = import.meta.env.VITE_API_URL ?? "/api/predict";

function App() {
  const [city, setCity] = useState("Colombo");
  const [date, setDate] = useState("2026-03-15");
  const [unit, setUnit] = useState("c");
  const [data, setData] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = async (targetCity = city, targetDate = date) => {
    setLoading(true);
    setError(null);

    try {
      const mainRes = await axios.get(API_URL, {
        params: { city: targetCity, date: targetDate },
      });

      if (mainRes.data.error) {
        setError(mainRes.data.error);
        setData(null);
        setForecast([]);
        return;
      }

      setData(mainRes.data);

      const baseDate = new Date(`${targetDate}T00:00:00`);
      const forecastRequests = [-3, -2, -1, 0, 1, 2, 3].map((offset) => {
        const nextDate = new Date(baseDate);
        nextDate.setDate(baseDate.getDate() + offset);
        const dateStr = nextDate.toISOString().split("T")[0];

        if (offset === 0) {
          return Promise.resolve({ ...mainRes.data, dateStr, offset });
        }

        return axios
          .get(API_URL, { params: { city: targetCity, date: dateStr } })
          .then((res) => ({ ...res.data, dateStr, offset }));
      });

      setForecast(await Promise.all(forecastRequests));
    } catch (err) {
      setError("Server connection failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather("Colombo", "2026-03-15");
  }, []);

  const tempStatus = useMemo(
    () => getTempStatus(data?.temperature_c),
    [data?.temperature_c],
  );

  const rainStatus = useMemo(
    () => getRainStatus(data?.rain_mm),
    [data?.rain_mm],
  );

  const bestDay = useMemo(() => {
    if (!forecast.length) return null;

    return [...forecast].sort((a, b) => {
      const aScore = Math.abs(a.temperature_c - 27) * 0.7 + a.rain_mm;
      const bScore = Math.abs(b.temperature_c - 27) * 0.7 + b.rain_mm;
      return aScore - bScore;
    })[0];
  }, [forecast]);

  const handleCityChange = (e) => {
    const nextCity = e.target.value;
    setCity(nextCity);
    fetchWeather(nextCity, date);
  };

  const handleDateChange = (e) => {
    const nextDate = e.target.value;
    setDate(nextDate);
    fetchWeather(city, nextDate);
  };

  const jumpDate = (days) => {
    const nextDate = addDays(date, days);
    setDate(nextDate);
    fetchWeather(city, nextDate);
  };

  const useToday = () => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
    fetchWeather(city, today);
  };

  const metrics = [
    {
      icon: <Droplets size={20} />,
      label: "Rainfall",
      value: data ? `${data.rain_mm} mm` : "--",
      note: rainStatus,
    },
    {
      icon: <Wind size={20} />,
      label: "Wind",
      value: data ? `${data.wind_kmh} km/h` : "--",
      note: getWindStatus(data?.wind_kmh),
    },
    {
      icon: <Thermometer size={20} />,
      label: "Feels Like",
      value: data ? formatTemp(data.temperature_c + 2, unit) : "--",
      note: tempStatus.label,
    },
    {
      icon: <Mountain size={20} />,
      label: "Elevation",
      value: data ? `${data.elevation_m} m` : "--",
      note: "Local terrain",
    },
  ];

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <div className="brand-mark">
            <Sparkles size={18} />
            <span>LankaCast</span>
          </div>
          <h1>LankaCast weather intelligence</h1>
          <p>
            Machine-learning forecasts for temperature, rainfall, wind, and
            daylight across 27 districts.
          </p>
        </div>

        <form className="control-bar" onSubmit={(event) => event.preventDefault()}>
          <label className="field">
            <span>
              <Search size={16} />
              District
            </span>
            <select value={city} onChange={handleCityChange}>
              {CITIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>
              <Calendar size={16} />
              Forecast Date
            </span>
            <input type="date" value={date} onChange={handleDateChange} />
          </label>

          <button
            className="refresh-button"
            type="button"
            onClick={() => fetchWeather(city, date)}
            disabled={loading}
            title="Refresh forecast"
          >
            {loading ? <Loader2 size={20} /> : <RefreshCw size={20} />}
          </button>

          <div className="quick-actions">
            <button type="button" onClick={() => jumpDate(-1)}>
              Prev day
            </button>
            <button type="button" onClick={useToday}>
              Today
            </button>
            <button type="button" onClick={() => jumpDate(1)}>
              Next day
            </button>
            <div className="unit-toggle" aria-label="Temperature unit">
              <button
                type="button"
                className={unit === "c" ? "is-active" : ""}
                onClick={() => setUnit("c")}
              >
                °C
              </button>
              <button
                type="button"
                className={unit === "f" ? "is-active" : ""}
                onClick={() => setUnit("f")}
              >
                °F
              </button>
            </div>
          </div>
        </form>
      </section>

      {error && (
        <div className="status-banner" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <section className="content-grid">
        <article className="current-panel" key={`${city}-${date}-${unit}`}>
          <div className="current-panel__header">
            <div>
              <span className="eyebrow">Selected forecast</span>
              <h2>{city}</h2>
            </div>
            <div className="location-chip">
              <MapPin size={16} />
              Sri Lanka
            </div>
          </div>

          <div className="condition-display">
            <div className="weather-emblem" aria-hidden="true">
              <CloudRain size={68} />
            </div>
            <div className="temperature-stack">
              <span className="temperature">
                {data ? formatTemp(data.temperature_c, unit) : "--"}
              </span>
              <span className="condition-label">{tempStatus.label}</span>
            </div>
          </div>

          <div className="summary-row">
            <SummaryItem
              icon={<Calendar size={18} />}
              label="Date"
              value={formatLongDate(date)}
            />
            <SummaryItem
              icon={<Gauge size={18} />}
              label="Outlook"
              value={rainStatus}
            />
            <SummaryItem
              icon={<Compass size={18} />}
              label="Model"
              value="ML forecast"
            />
            <SummaryItem
              icon={<Sparkles size={18} />}
              label="Best Nearby Day"
              value={bestDay ? formatShortDate(bestDay.dateStr) : "--"}
            />
          </div>
        </article>

        <aside className="sun-panel">
          <div className="panel-title">
            <Waves size={19} />
            <span>Daylight</span>
          </div>
          <div className="sun-track">
            <div className="sun-line">
              <span />
            </div>
            <div className="sun-times">
              <SummaryItem
                icon={<Sunrise size={18} />}
                label="Sunrise"
                value={data?.sunrise ?? "--"}
              />
              <SummaryItem
                icon={<Sunset size={18} />}
                label="Sunset"
                value={data?.sunset ?? "--"}
              />
            </div>
          </div>
        </aside>
      </section>

      <section className="metrics-grid">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="timeline-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Seven day window</span>
            <h2>Forecast timeline</h2>
          </div>
          {loading && (
            <span className="loading-pill">
              <Loader2 size={15} />
              Updating
            </span>
          )}
        </div>

        <div className="forecast-timeline">
          {forecast.map((item) => (
            <ForecastCard
              key={item.dateStr}
              item={item}
              unit={unit}
              selected={item.offset === 0}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function MetricCard({ icon, label, value, note }) {
  return (
    <article className="metric-card">
      <div className="metric-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </article>
  );
}

function SummaryItem({ icon, label, value }) {
  return (
    <div className="summary-item">
      <div className="summary-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function ForecastCard({ item, selected, unit }) {
  return (
    <article className={selected ? "forecast-day is-selected" : "forecast-day"}>
      <span className="forecast-day__name">{selected ? "Selected" : weekday(item.dateStr)}</span>
      <span className="forecast-day__date">{formatShortDate(item.dateStr)}</span>
      <CloudRain size={24} />
      <strong>{formatTemp(item.temperature_c, unit)}</strong>
      <small>{item.rain_mm} mm rain</small>
    </article>
  );
}

function getTempStatus(temp) {
  if (temp == null) return { label: "Waiting" };
  if (temp <= 15) return { label: "Cool" };
  if (temp <= 25) return { label: "Comfortable" };
  if (temp <= 32) return { label: "Warm" };
  return { label: "Hot" };
}

function getRainStatus(rain) {
  if (rain == null) return "Pending";
  if (rain < 1) return "Mostly dry";
  if (rain < 8) return "Light showers";
  if (rain < 25) return "Rain likely";
  return "Heavy rain";
}

function getWindStatus(wind) {
  if (wind == null) return "Pending";
  if (wind < 12) return "Calm";
  if (wind < 25) return "Breezy";
  return "Gusty";
}

function formatLongDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatShortDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
}

function weekday(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
  });
}

function formatTemp(temp, unit) {
  if (temp == null) return "--";
  if (unit === "f") return `${Math.round((temp * 9) / 5 + 32)}°F`;
  return `${Math.round(temp)}°C`;
}

function addDays(dateStr, days) {
  const nextDate = new Date(`${dateStr}T00:00:00`);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate.toISOString().split("T")[0];
}

export default App;
