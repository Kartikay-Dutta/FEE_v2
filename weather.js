// Weather Data Manager
class WeatherDataManager {
    constructor() {
        this.apiKey = '2ba7dd79b4bde9f946abab213a551ac9'; 
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    }

    // Get weather by geolocation
    async getWeatherByLocation(latitude, longitude) {
        try {
            // Get current weather
            const weatherResponse = await fetch(`${this.baseUrl}/weather?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=metric`);
            if (!weatherResponse.ok) throw new Error('Weather data not available');
            const weatherData = await weatherResponse.json();

            // Get 5-day forecast
            const forecastResponse = await fetch(`${this.baseUrl}/forecast?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=metric`);
            if (!forecastResponse.ok) throw new Error('Forecast data not available');
            const forecastData = await forecastResponse.json();

            // Format and combine the data
            const formattedWeather = this.formatWeatherData(weatherData);
            this.updateForecasts(forecastData);
            return formattedWeather;
        } catch (error) {
            this.showError('Could not fetch weather data for your location');
            throw error;
        }
    }

    // Get weather by city name
    async getWeatherByCity(city) {
        try {
            // Get current weather
            const weatherResponse = await fetch(`${this.baseUrl}/weather?q=${city}&appid=${this.apiKey}&units=metric`);
            if (!weatherResponse.ok) throw new Error('City not found');
            const weatherData = await weatherResponse.json();

            // Get 5-day forecast
            const forecastResponse = await fetch(`${this.baseUrl}/forecast?q=${city}&appid=${this.apiKey}&units=metric`);
            if (!forecastResponse.ok) throw new Error('Forecast data not available');
            const forecastData = await forecastResponse.json();

            // Format and combine the data
            const formattedWeather = this.formatWeatherData(weatherData);
            this.updateForecasts(forecastData);
            return formattedWeather;
        } catch (error) {
            this.showError('Could not find weather data for this city');
            throw error;
        }
    }

    // Format weather data
    formatWeatherData(data) {
        return {
            city: data.name,
            country: data.sys.country,
            temp: Math.round(data.main.temp),
            feelsLike: Math.round(data.main.feels_like),
            condition: data.weather[0].main,
            conditionDescription: data.weather[0].description,
            icon: data.weather[0].icon,
            humidity: data.main.humidity,
            wind: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
            pressure: data.main.pressure,
            visibility: Math.round(data.visibility / 1000), // Convert m to km
            sunrise: this.formatTime(data.sys.sunrise * 1000),
            sunset: this.formatTime(data.sys.sunset * 1000)
        };
    }

    // Format time from timestamp
    formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }

    // Show error message
    showError(message) {
        const toast = document.createElement('div');
        toast.className = 'weather-alert';
        toast.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Update UI with weather data
    updateUI(data) {
        // Update main weather info
        document.getElementById('cityName').textContent = `${data.city}, ${data.country}`;
        document.getElementById('tempVal').textContent = data.temp;
        document.getElementById('feelsLike').textContent = `${data.feelsLike}°C`;
        document.getElementById('condition').textContent = data.conditionDescription;
        document.getElementById('humidity').textContent = `${data.humidity}%`;
        document.getElementById('wind').textContent = `${data.wind} km/h`;
        document.getElementById('pressure').textContent = `${data.pressure} hPa`;
        document.getElementById('visibility').textContent = `${data.visibility} Km`;
        document.getElementById('sunrise').textContent = data.sunrise;
        document.getElementById('sunset').textContent = data.sunset;

        // Update weather icon
        const iconElement = document.getElementById('bigIcon');
        const iconMapping = {
            '01d': 'sun.png',
            '01n': 'moon.png',
            '02d': 'cloudy.png',
            '02n': 'cloudy.png',
            '03d': 'cloud.png',
            '03n': 'cloud.png',
            '04d': 'cloudy.png',
            '04n': 'cloudy.png',
            '09d': 'rainy.png',
            '09n': 'rainy.png',
            '10d': 'rainy.png',
            '10n': 'rainy.png',
            '11d': 'thunder.png',
            '11n': 'thunder.png',
            '13d': 'snowy.png',
            '13n': 'snowy.png',
            '50d': 'mist.png',
            '50n': 'mist.png'
        };
        iconElement.src = `images/${iconMapping[data.icon] || 'cloudy.png'}`;
        iconElement.alt = data.conditionDescription;

        // Update date and time
        this.updateDateTime();

        // Update small activity suggestion under the city/time card
        try {
            const suggestionEl = document.getElementById('activitySuggestion');
            if (suggestionEl) {
                const suggestion = this.getActivitySuggestion(data.condition, data.temp);
                // Put the suggestion in quotes and italic
                suggestionEl.innerHTML = `&ldquo;<em>${suggestion}</em>&rdquo;`;
            }
        } catch (e) {
            // Non-fatal — don't break UI if suggestion fails
            console.warn('Could not set activity suggestion', e);
        }

        // Check if this city is in favorites
        if (window.favoritesManager) {
            favoritesManager.updateFavoriteIcon(data.city);
        }

        // Remove any loading states
        document.querySelectorAll('.loading').forEach(el => el.classList.remove('loading'));
    }

    // Update date and time
    updateDateTime() {
        const now = new Date();
        document.getElementById('clock').textContent = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        document.getElementById('date').textContent = now.toLocaleDateString('en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'short'
        });
    }

    // Update forecast data
    updateForecasts(forecastData) {
        // Process 5-day forecast
        const dailyForecasts = this.processDailyForecasts(forecastData.list);
        const fiveDayList = document.getElementById('fiveDayList');
        if (!fiveDayList) return;

        fiveDayList.innerHTML = dailyForecasts.map(forecast => `
            <li class="forecast-day">
                <div class="forecast-date">${forecast.date}</div>
                <img src="images/${this.getIconForCode(forecast.icon)}" alt="${forecast.description}" class="forecast-icon">
                <div class="forecast-temp">${Math.round(forecast.temp)}°C</div>
                <div class="forecast-desc">${forecast.description}</div>
            </li>
        `).join('');

        // Process hourly forecast
        const hourlyForecasts = forecastData.list.slice(0, 8); // Next 24 hours (3-hour intervals)
        const hoursRow = document.getElementById('hoursRow');
        if (!hoursRow) return;

        hoursRow.innerHTML = hourlyForecasts.map(hour => {
            const time = new Date(hour.dt * 1000).toLocaleTimeString('en-US', {
                hour: '2-digit',
                hour12: false
            });
            return `
                <div class="hour">
                    <div class="hour-time">${time}:00</div>
                    <img src="images/${this.getIconForCode(hour.weather[0].icon)}" alt="${hour.weather[0].description}" class="hour-icon">
                    <div class="hour-temp">${Math.round(hour.main.temp)}°C</div>
                </div>
            `;
        }).join('');
    }

    // Process daily forecasts from 3-hour interval data
    processDailyForecasts(forecastList) {
        const dailyData = {};
        
        forecastList.forEach(item => {
            const date = new Date(item.dt * 1000).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
            
            if (!dailyData[date] || item.main.temp > dailyData[date].temp) {
                dailyData[date] = {
                    date: date,
                    temp: item.main.temp,
                    icon: item.weather[0].icon,
                    description: item.weather[0].description
                };
            }
        });

        return Object.values(dailyData).slice(0, 5);
    }

    // Get icon filename based on weather code
    getIconForCode(code) {
        const iconMapping = {
            '01d': 'sun.png',
            '01n': 'moon.png',
            '02d': 'cloudy.png',
            '02n': 'cloudy.png',
            '03d': 'cloud.png',
            '03n': 'cloud.png',
            '04d': 'cloudy.png',
            '04n': 'cloudy.png',
            '09d': 'rainy.png',
            '09n': 'rainy.png',
            '10d': 'rainy.png',
            '10n': 'rainy.png',
            '11d': 'thunder.png',
            '11n': 'thunder.png',
            '13d': 'snowy.png',
            '13n': 'snowy.png',
            '50d': 'mist.png',
            '50n': 'mist.png'
        };
        return iconMapping[code] || 'cloudy.png';
    }

    // Return a short 3-sentence activity suggestion string based on condition and temp
    getActivitySuggestion(condition, temp) {
        // normalize
        const cond = (condition || '').toLowerCase();
        const t = Number(temp);

        const suggestions = {
            clear: [
                "A clear day — perfect for a picnic in the park.",
                "Great time for a jog or bike ride; enjoy the sunshine.",
                "Bring sunglasses and a camera for bright, scenic shots."
            ],
            clouds: [
                "Cloudy skies — a calm walk will be pleasant.",
                "Good day for a coffee outdoors under light cloud cover.",
                "Light layering is ideal; a sweater should do."
            ],
            rain: [
                "Rainy weather — a cozy day for indoor reading or a cafe visit.",
                "Carry an umbrella if you need to step out; puddles likely.",
                "Perfect excuse to watch a movie or try a new recipe at home."
            ],
            drizzle: [
                "Drizzle outside — a short walk with a light jacket is fine.",
                "Great day for a museum or indoor stroll.",
                "Keep shoes dry and plan indoor activities if possible."
            ],
            thunderstorm: [
                "Thunderstorms — best to stay indoors and stay safe.",
                "Avoid outdoor activities and unplug sensitive electronics.",
                "Check local alerts and reschedule any open-air plans."
            ],
            snow: [
                "Snowy conditions — great for making snowmen or sledding.",
                "Bundle up warmly; layers and a good coat are recommended.",
                "If travelling, allow extra time and drive carefully."
            ],
            mist: [
                "Misty morning — a peaceful time for a short walk.",
                "Drive carefully as visibility may be reduced.",
                "Warm drink inside sounds lovely while the mist clears."
            ],
            default: [
                "Nice day to be mindful — pick an activity you love.",
                "Check the forecast details and plan accordingly.",
                "Layer up if temperatures are variable throughout the day."
            ]
        };

        // pick base group by condition keywords
        let key = 'default';
        if (cond.includes('clear') || cond.includes('sun')) key = 'clear';
        else if (cond.includes('cloud')) key = 'clouds';
        else if (cond.includes('rain')) key = 'rain';
        else if (cond.includes('drizzle')) key = 'drizzle';
        else if (cond.includes('thunder')) key = 'thunderstorm';
        else if (cond.includes('snow') || cond.includes('sleet')) key = 'snow';
        else if (cond.includes('mist') || cond.includes('fog')) key = 'mist';

        const lines = suggestions[key] || suggestions.default;

        // If it's very cold or very hot, prepend a temp-specific sentence
        let tempNote = '';
        if (!Number.isNaN(t)) {
            if (t <= 5) tempNote = 'It is quite cold; dress warmly.';
            else if (t >= 30) tempNote = 'It is very hot; stay hydrated and avoid prolonged sun.';
        }

        // Join three sentences: temp note (if any) + two from the chosen list (or three if no temp note)
        const chosen = tempNote ? [tempNote].concat(lines.slice(0, 2)) : lines.slice(0, 3);
        return chosen.join(' ');
    }
}

// Initialize Weather Data Manager
const weatherManager = new WeatherDataManager();

// Event Listeners for Search and Location
document.getElementById('mainSearchBar').addEventListener('keypress', async (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
        try {
            // Show loading state
            document.querySelectorAll('.card').forEach(card => card.classList.add('loading'));
            
            const data = await weatherManager.getWeatherByCity(e.target.value.trim());
            weatherManager.updateUI(data);
            
            // Update navbar search bar and show dashboard
            document.getElementById('searchBar').value = e.target.value;
            document.getElementById('initialSearch').style.display = 'none';
            document.getElementById('navbar').style.display = 'flex';
            document.getElementById('wrap').style.display = 'grid';
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    }
});

document.getElementById('locationBtn').addEventListener('click', async () => {
    if (navigator.geolocation) {
        try {
            // Show loading state
            document.querySelectorAll('.card').forEach(card => card.classList.add('loading'));
            
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            
            const data = await weatherManager.getWeatherByLocation(
                position.coords.latitude,
                position.coords.longitude
            );
            
            weatherManager.updateUI(data);
            
            // Update search bar and show dashboard
            document.getElementById('searchBar').value = data.city;
            document.getElementById('initialSearch').style.display = 'none';
            document.getElementById('navbar').style.display = 'flex';
            document.getElementById('wrap').style.display = 'grid';
        } catch (error) {
            console.error('Error getting location:', error);
            weatherManager.showError('Unable to get your location. Please try searching for a city instead.');
        }
    } else {
        weatherManager.showError('Geolocation is not supported by your browser');
    }
});

// Handle navbar search
document.getElementById('searchBar').addEventListener('keypress', async (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
        try {
            document.querySelectorAll('.card').forEach(card => card.classList.add('loading'));
            const data = await weatherManager.getWeatherByCity(e.target.value.trim());
            weatherManager.updateUI(data);
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    }
});

// If the page was opened with a `city` query parameter (for example, from favorites.html),
// load that city's weather immediately and ensure the dashboard is visible.
(function loadCityFromQuery() {
    try {
        const params = new URLSearchParams(window.location.search);
        const city = params.get('city');
        if (city && city.trim()) {
            (async () => {
                try {
                    document.querySelectorAll('.card').forEach(card => card.classList.add('loading'));
                    const data = await weatherManager.getWeatherByCity(city.trim());
                    weatherManager.updateUI(data);

                    // Show the main UI (mirrors search and location flows)
                    const initial = document.getElementById('initialSearch');
                    const navbar = document.getElementById('navbar');
                    const wrap = document.getElementById('wrap');
                    if (initial) initial.style.display = 'none';
                    if (navbar) navbar.style.display = 'flex';
                    if (wrap) wrap.style.display = 'grid';

                    // Keep the navbar search in sync
                    const sb = document.getElementById('searchBar') || document.getElementById('mainSearchBar');
                    if (sb) sb.value = city.trim();
                } catch (err) {
                    console.error('Could not load city from query param:', err);
                }
            })();
        }
    } catch (e) {
        console.warn('Error parsing city query param', e);
    }
})();