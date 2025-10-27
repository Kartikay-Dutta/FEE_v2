let cityClockInterval;

// --- Config ---
const GITHUB_URL = "https://github.com/Kartikay-Dutta/FEE_v2";

// --- Menu dropdown ---
const menuBtn = document.getElementById('menuBtn');
const menuDropdown = document.getElementById('menuDropdown');

function closeMenu() {
  menuDropdown.classList.remove('show');
  menuDropdown.setAttribute('aria-hidden', 'true');
  menuBtn.setAttribute('aria-expanded', 'false');
}
function openMenu() {
  menuDropdown.classList.add('show');
  menuDropdown.setAttribute('aria-hidden', 'false');
  menuBtn.setAttribute('aria-expanded', 'true');
}

menuBtn.addEventListener('click', (e) => {
  const isOpen = menuDropdown.classList.contains('show');
  if (isOpen) closeMenu();
  else openMenu();
});

// close when clicking outside
document.addEventListener('click', (e) => {
  if (!menuBtn.contains(e.target) && !menuDropdown.contains(e.target)) {
    closeMenu();
  }
});


// === Theme Toggle Functionality ===
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Load saved theme if available
if (localStorage.getItem('theme') === 'light') {
  body.classList.add('light-mode');
  themeToggle.textContent = '🌙 Dark Mode';
}

themeToggle.addEventListener('click', () => {
  body.classList.toggle('light-mode');

  if (body.classList.contains('light-mode')) {
    themeToggle.textContent = '🌙 Dark Mode';
    localStorage.setItem('theme', 'light');
  } else {
    themeToggle.textContent = '☀️ Light Mode';
    localStorage.setItem('theme', 'dark');
  }
});



// --- Accessibility: keyboard support for menu ---
menuBtn.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu();
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    const isOpen = menuDropdown.classList.contains('show');
    if (isOpen) closeMenu(); else openMenu();
  }
});


// API KEY
const apiKey = "2ba7dd79b4bde9f946abab213a551ac9";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?units=metric&q=";
const searchBox = document.querySelector(".nav-center input");
const fiveDayListEl = document.getElementById('fiveDayList');


function updateCityClock(timezoneOffsetSeconds) {
    if (cityClockInterval) {
        clearInterval(cityClockInterval);
    }

    const tick = () => {
        const now = new Date();
        const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000); 

        const cityTime = new Date(utcTime + (timezoneOffsetSeconds * 1000));

        const hh = cityTime.getHours().toString().padStart(2, '0');
        const mm = cityTime.getMinutes().toString().padStart(2, '0');
        document.getElementById('clock').textContent = `${hh}:${mm}`;

        const options = { weekday: 'long', day: 'numeric', month: 'short' };
        document.getElementById('date').textContent = cityTime.toLocaleDateString(undefined, options);
        
    };

    tick();
    cityClockInterval = setInterval(tick, 1000);
}
function getLocalIconPath(iconCode) {
    const iconMap = {
        '01d': 'sun.png', 
        '01n': 'sun.png', 
        '02d': 'cloudy.png',
        '02n': 'cloud.png', 
        '03d': 'cloud.png',
        '03n': 'cloud.png',
        '04d': 'cloud.png',
        '04n': 'cloud.png',
        '09d': 'rainy.png',
        '09n': 'rainy.png',
        '10d': 'rainy.png',
        '10n': 'rainy.png',
        '11d': 'rainy.png',
        '11n': 'rainy.png',
        '13d': 'rainy.png',
        '13n': 'rainy.png',
        '50d': 'rainy.png',
        '50n': 'rainy.png'
    };
    return `images/${iconMap[iconCode] || 'default.png'}`; 
}

async function checkFiveDayForecast(city) {
    if (!city || !fiveDayListEl) return;

    const response = await fetch(forecastUrl + city + `&appid=${apiKey}`);
    
    if (!response.ok) {

        fiveDayListEl.innerHTML = '<li>Could not load forecast.</li>';
        return; 
    }


    const data = await response.json();
    const forecastList = data.list; 
    const dailyForecasts = {};

    forecastList.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        const tempMax = item.main.temp_max;
        const dateTime = new Date(item.dt * 1000); 
        const dayString = dateTime.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
        const iconCode = item.weather[0].icon;

        if (!dailyForecasts[date]) {
            dailyForecasts[date] = { 
                max: tempMax, 
                icon: iconCode, 
                day: dayString 
            };
        } else {
            dailyForecasts[date].max = Math.max(dailyForecasts[date].max, tempMax);
        }
    });

    fiveDayListEl.innerHTML = ''; 
    const daysToShow = Object.keys(dailyForecasts).slice(1, 6); 
    
    daysToShow.forEach(dateKey => {
        const dayData = dailyForecasts[dateKey];
        
        const iconSrc = getLocalIconPath(dayData.icon); 
        
        const maxTemp = Math.round(dayData.max);

        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <img src="${iconSrc}" alt="${dayData.day}" class="li-icon">
            <span class="li-temp">${maxTemp}°C</span>
            <span class="li-date">${dayData.day}</span>
        `;
        fiveDayListEl.appendChild(listItem);
    });
}
// hourly function

const hoursRowEl = document.getElementById('hoursRow');

async function checkHourlyForecast(city) {
    if (!city || !hoursRowEl) return;

    const response = await fetch(forecastUrl + city + `&appid=${apiKey}`);
    
    if (!response.ok) {
        hoursRowEl.innerHTML = '<div>Could not load hourly forecast.</div>';
        return; 
    }

    const data = await response.json();
    const forecastList = data.list; 

    hoursRowEl.innerHTML = ''; 

    for (let i = 0; i < Math.min(forecastList.length, 7); i++) {
        const item = forecastList[i];
        
        const dateTime = new Date(item.dt * 1000); 
        const timeString = dateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        
        const temp = Math.round(item.main.temp);
        const iconCode = item.weather[0].icon;
        
        const windSpeedKmh = Math.round(item.wind.speed * 3.6); 

        const iconSrc = getLocalIconPath(iconCode); 

        const hourPill = document.createElement('div');
        hourPill.className = 'hour-pill';
        
        hourPill.innerHTML = `
            <div class="pill-time">${timeString}</div>
            <img src="${iconSrc}" alt="weather icon" class="pill-icon">
            <div class="pill-temp">${temp}°C</div>
            <img src="images/wind_speed.png" alt="wind icon" class="pill-icon">
            <div class="pill-wind">${windSpeedKmh} km/h</div>
        `;
        hoursRowEl.appendChild(hourPill);
    }
}


async function checkWeather(city) {
  const response = await fetch(apiUrl + city + `&appid=${apiKey}`);
  var data = await response.json();
  checkHourlyForecast(city);
  console.log(data);
  document.querySelector(".city").innerHTML = data.name;
  document.querySelector(".temp-val").innerHTML = Math.round(data.main.temp) + "°C";
  document.querySelector(".feels").innerHTML = "Feels like " +Math.round(data.main.feels_like); "°C";
  document.getElementById("humidity").innerHTML = data.main.humidity + "%";
  const windSpeedKmh = Math.round(data.wind.speed * 3.6);
  document.getElementById("wind").innerHTML = windSpeedKmh + " km/h";
  const visibilityKm = (data.visibility / 1000); 
  document.getElementById("visibility").innerHTML = visibilityKm + " km";
  document.getElementById("pressure").innerHTML = data.main.pressure + " hPa";

  const sunriseTimestamp = data.sys.sunrise * 1000; 
  const sunriseTime = new Date(sunriseTimestamp).toLocaleTimeString('en-US', {
        
        hour12: false,
        minute: '2-digit',
        hour: '2-digit'
    });
    document.getElementById("sunrise").innerHTML = sunriseTime;
    const sunsetTimestamp = data.sys.sunset * 1000; 
    const sunsetTime = new Date(sunsetTimestamp).toLocaleTimeString('en-US', {
        hour12: false,
        minute: '2-digit',
        hour: '2-digit' 
    });
    document.getElementById("sunset").innerHTML = sunsetTime;
    checkFiveDayForecast(city);
     checkHourlyForecast(city);
     updateCityClock(data.timezone);
}



searchBox.addEventListener("keydown", (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); 
        checkWeather(searchBox.value);
    }
});


