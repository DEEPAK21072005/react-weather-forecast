import React, { useEffect, useState } from "react";
import { getCurrentWeather, getForecastWeather } from "../services/WeatherService";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function WeatherChart() {
  const [city, setCity] = useState("Delhi");
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rawCurrent, setRawCurrent] = useState(null);
  const [rawForecast, setRawForecast] = useState(null);

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, []);

  const fetchAll = async (useCity = city) => {
    setLoading(true);
    setError(null);
    setForecast([]);
    setCurrent(null);
    setRawCurrent(null);
    setRawForecast(null);

    try {
      console.log("[UI] fetching current for", useCity);
      const cur = await getCurrentWeather(useCity);
      console.log("[UI] current result:", cur);
      setRawCurrent(cur);
      if (!cur || !cur.main) throw new Error("Invalid current data");

      setCurrent(cur);

      console.log("[UI] fetching forecast for", useCity);
      const f = await getForecastWeather(useCity);
      console.log("[UI] forecast result:", f);
      setRawForecast(f);

      // build simple daily forecast from 3-hour list: take one item per day (every 8th)
      const daily = [];
      if (f && f.list && f.list.length > 0) {
        for (let i = 0; i < f.list.length; i += 8) {
          const item = f.list[i];
          daily.push({ dt: item.dt, temp: item.main.temp, desc: item.weather[0].description });
        }
      }
      setForecast(daily);
    } catch (err) {
      console.error("[UI] fetch error:", err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: forecast.map(d => new Date(d.dt * 1000).toLocaleDateString()),
    datasets: [
      {
        label: "Temp (°C)",
        data: forecast.map(d => d.temp),
        borderColor: "rgb(33, 150, 243)",
        tension: 0.2,
      }
    ]
  };

  return (
    <div style={{ maxWidth: 720, margin: "30px auto", fontFamily: "sans-serif" }}>
      <h2>Weather — debug mode</h2>

      <div style={{ marginBottom: 10 }}>
        <input
          value={city}
          onChange={e => setCity(e.target.value)}
          placeholder="City name (e.g., Delhi, London)"
          style={{ padding: 8, width: 220, marginRight: 8 }}
        />
        <button onClick={() => fetchAll(city)} style={{ padding: "8px 12px" }}>Fetch</button>
      </div>

      <div style={{ marginBottom: 12 }}>
        {loading && <strong>Loading...</strong>}
        {error && <div style={{ color: "red" }}>Error: {error}</div>}
      </div>

      <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 6 }}>
        <h3>Summary</h3>
        <p><strong>City:</strong> {city}</p>
        {current ? (
          <div>
            <p><strong>Current Temp:</strong> {current.main.temp} °C</p>
            <p><strong>Desc:</strong> {current.weather[0].description}</p>
            <p><strong>Coords:</strong> {current.coord.lat}, {current.coord.lon}</p>
          </div>
        ) : (
          <p>No current data yet.</p>
        )}
      </div>

      <div style={{ marginTop: 18 }}>
        <h3>Forecast Chart (one datapoint per day)</h3>
        {forecast.length > 0 ? <Line data={chartData} /> : <p>No forecast chart yet.</p>}
      </div>

      <details style={{ marginTop: 18 }}>
        <summary>Raw API responses (debug)</summary>
        <pre style={{ maxHeight: 300, overflow: "auto", background: "#f7f7f7", padding: 10 }}>
          <strong>Current:</strong>
          {rawCurrent ? JSON.stringify(rawCurrent, null, 2) : " (none)"}
          {"\n\n"}
          <strong>Forecast:</strong>
          {rawForecast ? JSON.stringify(rawForecast, null, 2) : " (none)"}
        </pre>
      </details>
    </div>
  );
}
