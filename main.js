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

// --- Menu actions ---
document.getElementById('aboutUsLink').href = GITHUB_URL;

const favoritesBtn = document.getElementById('favoritesBtn');
const historyBtn = document.getElementById('historyBtn');
const changeUserBtn = document.getElementById('changeUserBtn');

const favoritesModal = document.getElementById('favoritesModal');
const favoritesListEl = document.getElementById('favoritesList');
const closeFavorites = document.getElementById('closeFavorites');



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

// --- Simple clock & date sample to look live (updates every second) ---
function updateClock() {
  const now = new Date();
  const hh = now.getHours().toString().padStart(2,'0');
  const mm = now.getMinutes().toString().padStart(2,'0');
  document.getElementById('clock').textContent = `${hh}:${mm}`;

  const options = { weekday: 'long', day: 'numeric', month: 'short' };
  document.getElementById('date').textContent = now.toLocaleDateString(undefined, options);
}
updateClock();
setInterval(updateClock, 1000);

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
const searchBox = document.querySelector(".nav-center input");


async function checkWeather(city) {
  const response = await fetch(apiUrl + city + `&appid=${apiKey}`);
  var data = await response.json();
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
}



searchBox.addEventListener("keydown", (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); 
        checkWeather(searchBox.value);
    }
});


