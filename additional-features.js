// DOM Elements
const initialSearch = document.getElementById('initialSearch');
const navbar = document.getElementById('navbar');
const mainSearchBar = document.getElementById('mainSearchBar');
const locationBtn = document.getElementById('locationBtn');
const weatherDashboard = document.getElementById('wrap');
const tempUnitToggle = document.querySelectorAll('input[name="tempUnit"]');
const alertsBtn = document.getElementById('alertsBtn');
const alertsModal = document.getElementById('alertsModal');
const closeAlerts = document.getElementById('closeAlerts');
const saveAlerts = document.getElementById('saveAlerts');

// Initial state
let currentTemp = 0;
let isCelsius = true;
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let alertSettings = JSON.parse(localStorage.getItem('alertSettings')) || {
    rain: false,
    temperature: {
        enabled: false,
        min: null,
        max: null
    },
    wind: {
        enabled: false,
        speed: null
    }
};

// Load alert settings
function loadAlertSettings() {
    document.getElementById('rainAlert').checked = alertSettings.rain;
    document.getElementById('tempAlert').checked = alertSettings.temperature.enabled;
    document.getElementById('minTemp').value = alertSettings.temperature.min || '';
    document.getElementById('maxTemp').value = alertSettings.temperature.max || '';
    document.getElementById('windAlert').checked = alertSettings.wind.enabled;
    document.getElementById('windSpeed').value = alertSettings.wind.speed || '';
}

// Save alert settings
function saveAlertSettings() {
    alertSettings = {
        rain: document.getElementById('rainAlert').checked,
        temperature: {
            enabled: document.getElementById('tempAlert').checked,
            min: parseFloat(document.getElementById('minTemp').value),
            max: parseFloat(document.getElementById('maxTemp').value)
        },
        wind: {
            enabled: document.getElementById('windAlert').checked,
            speed: parseFloat(document.getElementById('windSpeed').value)
        }
    };
    localStorage.setItem('alertSettings', JSON.stringify(alertSettings));
}

// Show weather alert
function showWeatherAlert(message) {
    const alert = document.createElement('div');
    alert.className = 'weather-alert';
    alert.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(alert);
    setTimeout(() => {
        alert.style.animation = 'slideIn 0.3s reverse';
        setTimeout(() => alert.remove(), 300);
    }, 5000);
}

// Check weather conditions against alert settings
function checkWeatherAlerts(weatherData) {
    if (alertSettings.rain && weatherData.condition.toLowerCase().includes('rain')) {
        showWeatherAlert('Rain is expected in your area');
    }

    if (alertSettings.temperature.enabled) {
        const temp = isCelsius ? weatherData.temp : celsiusToFahrenheit(weatherData.temp);
        if (temp < alertSettings.temperature.min) {
            showWeatherAlert(`Temperature is below your minimum threshold (${alertSettings.temperature.min}°${isCelsius ? 'C' : 'F'})`);
        }
        if (temp > alertSettings.temperature.max) {
            showWeatherAlert(`Temperature is above your maximum threshold (${alertSettings.temperature.max}°${isCelsius ? 'C' : 'F'})`);
        }
    }

    if (alertSettings.wind.enabled && weatherData.windSpeed > alertSettings.wind.speed) {
        showWeatherAlert(`High wind speed alert: ${weatherData.windSpeed} km/h`);
    }
}

// Temperature conversion functions
function celsiusToFahrenheit(celsius) {
    return (celsius * 9/5) + 32;
}

function fahrenheitToCelsius(fahrenheit) {
    return (fahrenheit - 32) * 5/9;
}

// Update temperature display
function updateTemperatureDisplay() {
    const tempElements = document.querySelectorAll('.temp-val, .feels, .li-temp, .pill-temp');
    tempElements.forEach(el => {
        const tempText = el.textContent;
        const tempMatch = tempText.match(/(-?\d+(\.\d+)?)/);
        if (tempMatch) {
            const temp = parseFloat(tempMatch[0]);
            const newTemp = !isCelsius ? 
                celsiusToFahrenheit(temp) : 
                fahrenheitToCelsius(temp);
            
            // Update the number and the unit
            const newText = el.textContent.replace(
                tempMatch[0], 
                Math.round(newTemp)
            ).replace(/°[CF]/, `°${isCelsius ? 'C' : 'F'}`);
            
            el.textContent = newText;
        }
    });
}

// Event Listeners
mainSearchBar.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && mainSearchBar.value.trim()) {
        initialSearch.style.display = 'none';
        navbar.style.display = 'flex';
        weatherDashboard.style.display = 'grid';
        // Here you would call your existing weather fetch function
        // fetchWeatherData(mainSearchBar.value);
    }
});

locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Here you would call your existing weather fetch function with coordinates
                // fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
                initialSearch.style.display = 'none';
                navbar.style.display = 'flex';
                weatherDashboard.style.display = 'grid';
            },
            (error) => {
                console.error('Error getting location:', error);
                showWeatherAlert('Unable to get your location. Please try searching for a city instead.');
            }
        );
    } else {
        showWeatherAlert('Geolocation is not supported by your browser');
    }
});

tempUnitToggle.forEach(radio => {
    radio.addEventListener('change', () => {
        isCelsius = radio.value === 'C';
        updateTemperatureDisplay();
    });
});

alertsBtn.addEventListener('click', () => {
    loadAlertSettings();
    alertsModal.classList.add('show');
});

closeAlerts.addEventListener('click', () => {
    alertsModal.classList.remove('show');
});

saveAlerts.addEventListener('click', () => {
    saveAlertSettings();
    alertsModal.classList.remove('show');
    showWeatherAlert('Weather alert settings saved successfully');
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Show initial search view
    initialSearch.style.display = 'flex';
    navbar.style.display = 'none';
    weatherDashboard.style.display = 'none';
    
    // Load saved settings
    loadAlertSettings();
});