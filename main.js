// --- Dropdown: open history page on click ---
const historyBtn = document.getElementById('historyBtn');
if (historyBtn) {
    historyBtn.addEventListener('click', () => {
        window.location.href = 'history.html';
        closeMenu();
    });
}
let cityClockInterval;
const favoriteIcon = document.getElementById('favoriteIcon');
let favoritedCities = JSON.parse(localStorage.getItem('favoritedCities')) || [];

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

// --- Function to update the favorite icon for the current city ---
function updateFavoriteIconState(cityName) {
    if (!favoriteIcon) return; // Guard against element not existing

    // Check if the current city is in the favoritedCities array
    const isFavorited = favoritedCities.includes(cityName);

    if (isFavorited) {
        favoriteIcon.src = 'images/favorite_full.png';
        favoriteIcon.alt = 'Remove from Favorites';
    } else {
        favoriteIcon.src = 'images/favorite_trans.png';
        favoriteIcon.alt = 'Add to Favorites';
    }
}

// --- Event listener for the favorite icon ---
favoriteIcon.addEventListener('click', () => {
    const currentCityName = document.getElementById('cityName').textContent;

    // Guard against empty city name
    if (!currentCityName) return;

    const index = favoritedCities.indexOf(currentCityName);

    if (index > -1) {
        // City is already favorited, so remove it
        favoritedCities.splice(index, 1);
    } else {
        // City is not favorited, so add it
        favoritedCities.push(currentCityName);
    }

    // Save the updated list back to localStorage
    localStorage.setItem('favoritedCities', JSON.stringify(favoritedCities));

    // Update the icon to reflect the new state
    updateFavoriteIconState(currentCityName);

    // Optional: Log to console for debugging
    console.log("Favorited cities:", favoritedCities);
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
