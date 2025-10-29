// History Management
class HistoryManager {
    constructor() {
        this.history = JSON.parse(localStorage.getItem('history')) || [];
        this.isDedicatedPage = window.location.pathname.includes('history.html');
        this.initializeElements();
        this.initializeEventListeners();
        if (this.isDedicatedPage) this.renderHistoryPage();
    }

    initializeElements() {
        if (this.isDedicatedPage) {
            this.historyGrid = document.getElementById('historyGrid');
            this.historySearch = document.getElementById('historySearch');
            this.historySort = document.getElementById('historySort');
            this.clearHistoryFab = document.getElementById('clearHistoryFab');
            this.totalHistory = document.getElementById('totalHistory');
            this.warmestHistoryCity = document.getElementById('warmestHistoryCity');
            this.coldestHistoryCity = document.getElementById('coldestHistoryCity');
            this.lastSearched = document.getElementById('lastSearched');
        }
    }

    initializeEventListeners() {
        if (this.isDedicatedPage) {
            this.historySearch.addEventListener('input', () => this.filterHistory());
            this.historySort.addEventListener('change', () => this.sortHistory());
            this.clearHistoryFab.addEventListener('click', () => this.clearHistory());
        }
    }

    addHistory(city) {
        const name = city.name.trim();
        const entry = { ...city, name, timestamp: new Date().toISOString() };
        this.history.unshift(entry);
        localStorage.setItem('history', JSON.stringify(this.history));
        if (this.isDedicatedPage) this.renderHistoryPage();
    }

    clearHistory() {
        this.history = [];
        localStorage.setItem('history', JSON.stringify(this.history));
        this.renderHistoryPage();
    }

    filterHistory() {
        const query = this.historySearch.value.toLowerCase();
        const filtered = this.history.filter(h => h.name.toLowerCase().includes(query));
        this.renderHistoryGrid(filtered);
    }

    sortHistory() {
        const sortBy = this.historySort.value;
        if (sortBy === 'name') {
            this.history.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'recent') {
            this.history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        }
        this.renderHistoryGrid(this.history);
    }

    renderHistoryPage() {
        this.totalHistory.textContent = this.history.length;
        if (this.history.length === 0) {
            this.historyGrid.innerHTML = document.querySelector('.empty-favorites').outerHTML;
            this.warmestHistoryCity.textContent = '--';
            this.coldestHistoryCity.textContent = '--';
            this.lastSearched.textContent = '--';
            return;
        }
        this.renderHistoryGrid(this.history);
        // Stats
        let warmest = this.history[0], coldest = this.history[0];
        this.history.forEach(h => {
            if (parseFloat(h.temp) > parseFloat(warmest.temp)) warmest = h;
            if (parseFloat(h.temp) < parseFloat(coldest.temp)) coldest = h;
        });
        this.warmestHistoryCity.textContent = warmest.name;
        this.coldestHistoryCity.textContent = coldest.name;
        this.lastSearched.textContent = new Date(this.history[0].timestamp).toLocaleString();
    }

    renderHistoryGrid(historyArr) {
        if (!historyArr.length) {
            this.historyGrid.innerHTML = document.querySelector('.empty-favorites').outerHTML;
            return;
        }
        this.historyGrid.innerHTML = historyArr.map(h => `
            <div class="favorite-card history-card" data-city="${h.name.replace(/"/g, '&quot;')}">
                <div class="favorite-header">
                    <span class="favorite-city">${h.name}</span>
                    <img src="images/${this.getWeatherIconName(h.condition)}.png" alt="${h.condition}" class="favorite-weather-icon">
                </div>
                <div class="favorite-temp">${h.temp}°C</div>
                <div class="favorite-details">
                    <div class="detail-item">
                        <i class="fas fa-cloud"></i>
                        <span>${h.condition}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-clock"></i>
                        <span>${this.formatDate(h.timestamp)}</span>
                    </div>
                </div>
            </div>
        `).join('');
        // Add click event to each card to update city in main view
        setTimeout(() => {
            document.querySelectorAll('.history-card').forEach(card => {
                card.addEventListener('click', () => {
                    const city = card.getAttribute('data-city');
                    if (city) {
                        window.location.href = `main.html?city=${encodeURIComponent(city)}`;
                    }
                });
            });
        }, 0);
    }

    // Returns the icon file name (without extension) for a given condition, matching favorites.js
    getWeatherIconName(condition) {
        const iconMap = {
            'clear sky': 'sun',
            'few clouds': 'cloudy',
            'scattered clouds': 'cloud',
            'broken clouds': 'cloud',
            'shower rain': 'rainy',
            'rain': 'rainy',
            'thunderstorm': 'rainy',
            'snow': 'rainy',
            'mist': 'rainy'
        };
        return iconMap[condition] || 'cloud';
    }

    // Format date as in favorites.js (e.g., 10/29/2025)
    formatDate(timestamp) {
        const d = new Date(timestamp);
        return d.toLocaleDateString();
    }

    getWeatherIcon(condition) {
        // Simple icon mapping for demo; you can expand this
        const iconMap = {
            'clear sky': '<i class="fas fa-sun" style="color:#FFD600"></i>',
            'few clouds': '<i class="fas fa-cloud-sun" style="color:#90CAF9"></i>',
            'scattered clouds': '<i class="fas fa-cloud" style="color:#90CAF9"></i>',
            'broken clouds': '<i class="fas fa-cloud" style="color:#90CAF9"></i>',
            'shower rain': '<i class="fas fa-cloud-showers-heavy" style="color:#2196f3"></i>',
            'rain': '<i class="fas fa-cloud-rain" style="color:#2196f3"></i>',
            'thunderstorm': '<i class="fas fa-bolt" style="color:#FFD600"></i>',
            'snow': '<i class="fas fa-snowflake" style="color:#90CAF9"></i>',
            'mist': '<i class="fas fa-smog" style="color:#B0BEC5"></i>'
        };
        return iconMap[condition] || '<i class="fas fa-cloud" style="color:#90CAF9"></i>';
    }
}

// Initialize on page load
if (window.location.pathname.includes('history.html')) {
    window.historyManager = new HistoryManager();
}
