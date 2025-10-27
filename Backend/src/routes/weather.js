import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/", async (req, res) => {
  const city = req.query.city;
  if (!city) return res.status(400).json({ error: "Please enter a city name" });
  try {
    const apiKey = process.env.WEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&APPID=${apiKey}&units=metric`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (err) {
    if (err.response && err.response.status === 404) {
      res.status(404).json({ error: "Invalid city name. Please check the spelling and try again." });
    } else {
      console.error("Weather API error:", err.message);
      res.status(500).json({ error: "Unable to fetch weather data. Please try again later." });
    }
  }
});

// 5-day forecast (3-hour steps) condensed into daily summary and hourly list
router.get("/forecast", async (req, res) => {
  const city = req.query.city;
  if (!city) return res.status(400).json({ error: "City name required" });
  try {
    const apiKey = process.env.WEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&APPID=${apiKey}&units=metric`;
    const response = await axios.get(url);
    const data = response.data; // contains list[] of 3-hour forecasts and city info

    // Build hourly (next 12 items) and daily (group by date)
    const hourly = data.list.slice(0, 12).map(item => ({
      dt: item.dt,
      dt_txt: item.dt_txt,
      temp: item.main.temp,
      weather: item.weather[0]
    }));

    const daysMap = {};
    data.list.forEach(item => {
      const day = item.dt_txt.split(' ')[0];
      if (!daysMap[day]) daysMap[day] = [];
      daysMap[day].push(item);
    });

    const daily = Object.keys(daysMap).slice(0, 5).map(day => {
      const items = daysMap[day];
      // find min/max temp and use midday weather
      const temps = items.map(i => i.main.temp);
      const min = Math.min(...temps);
      const max = Math.max(...temps);
      const midday = items[Math.floor(items.length/2)];
      return {
        date: day,
        temp_min: Math.round(min),
        temp_max: Math.round(max),
        weather: midday.weather[0]
      };
    });

    res.json({ city: data.city, hourly, daily });
  } catch (err) {
    console.error('Forecast API error:', err.message);
    if (err.response && err.response.status === 404) return res.status(404).json({ error: 'City not found' });
    res.status(500).json({ error: 'Forecast fetch failed' });
  }
});

export default router;
