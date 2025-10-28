// Favorites Management
class FavoritesManager {
    constructor() {
        this.favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        // normalize any stored favorites so comparisons are consistent
        this.favorites = this.favorites.map(f => ({ ...f, name: this.normalizeName(f.name) }));
        this.isDedicatedPage = window.location.pathname.includes('favorites.html');
        
        // Initialize UI elements
        this.initializeElements();
        this.initializeEventListeners();
        
        // Initial render
        this.isDedicatedPage ? this.renderFavoritesPage() : this.renderFavoritesModal();
        // Ensure the favorite icon on the main view reflects stored state
        try {
            const currentCity = document.getElementById('cityName')?.textContent || '';
            if (currentCity) this.updateFavoriteIcon(this.normalizeName(currentCity));
        } catch (e) {
            // ignore when elements are not present
        }
    }

    initializeElements() {
        if (this.isDedicatedPage) {
            this.favoritesGrid = document.getElementById('favoritesGrid');
            this.favoritesSearch = document.getElementById('favoritesSearch');
            this.favoritesSort = document.getElementById('favoritesSort');
            this.refreshFab = document.getElementById('refreshFab');
            this.refreshModal = document.getElementById('refreshModal');
            this.totalFavorites = document.getElementById('totalFavorites');
            this.warmestCity = document.getElementById('warmestCity');
            this.coldestCity = document.getElementById('coldestCity');
            this.lastUpdated = document.getElementById('lastUpdated');
        } else {
            this.favoritesModal = document.getElementById('favoritesModal');
            this.favoritesList = document.getElementById('favoritesList');
            this.closeFavorites = document.getElementById('closeFavorites');
        }
    }

    initializeEventListeners() {
        if (this.isDedicatedPage) {
            // Favorites page event listeners
            this.favoritesSearch.addEventListener('input', () => this.filterFavorites());
            this.favoritesSort.addEventListener('change', () => this.sortFavorites());
            this.refreshFab.addEventListener('click', () => this.showRefreshModal());
            
            document.getElementById('confirmRefresh').addEventListener('click', () => this.refreshAllWeather());
            document.getElementById('cancelRefresh').addEventListener('click', () => {
                this.refreshModal.classList.remove('show');
            });
        } else {
            // Modal event listeners
            this.closeFavorites.addEventListener('click', () => this.hideModal());
            
            // Star button in the main weather view (now a button with an <i> icon)
            const favoriteBtn = document.getElementById('favoriteIcon');
            if (favoriteBtn) {
                favoriteBtn.addEventListener('click', (e) => {
                    const cityName = document.getElementById('cityName').textContent;
                    const currentTemp = document.getElementById('tempVal').textContent;
                    const condition = document.getElementById('condition').textContent;
                    
                    // normalize the city name before checking/storing
                    const normalized = this.normalizeName(cityName);
                    const icon = favoriteBtn.querySelector('i');

                    if (this.isFavorite(normalized)) {
                        this.removeFavorite(normalized);
                        if (icon) { icon.classList.remove('fas'); icon.classList.add('far'); }
                        favoriteBtn.setAttribute('aria-pressed', 'false');
                        favoriteBtn.classList.remove('active');
                    } else {
                        this.addFavorite({
                            name: normalized,
                            temp: currentTemp,
                            condition: condition,
                            timestamp: new Date().toISOString()
                        });
                        if (icon) { icon.classList.remove('far'); icon.classList.add('fas'); }
                        favoriteBtn.setAttribute('aria-pressed', 'true');
                        favoriteBtn.classList.add('active');
                    }
                    // keep icon in sync with stored favorites
                    this.updateFavoriteIcon(normalized);
                });
            }

            // Keep the favorite icon in sync when the displayed city changes
            const cityEl = document.getElementById('cityName');
            if (cityEl) {
                const mo = new MutationObserver(() => {
                    const name = this.normalizeName(cityEl.textContent || '');
                    if (name) this.updateFavoriteIcon(name);
                });
                mo.observe(cityEl, { characterData: true, childList: true, subtree: true });
            }
        }
    }

    showModal() {
        this.favoritesModal.classList.add('show');
        this.renderFavoritesModal();
    }

    hideModal() {
        this.favoritesModal.classList.remove('show');
    }

    addFavorite(city) {
        const name = this.normalizeName(city.name);
        if (!this.isFavorite(name)) {
            const toStore = { ...city, name };
            this.favorites.push(toStore);
            this.saveFavorites();
            this.isDedicatedPage ? this.renderFavoritesPage() : this.renderFavoritesModal();
            this.showToast(`Added ${city.name} to favorites`);
        }
    }

    removeFavorite(cityName) {
        const name = this.normalizeName(cityName);
        this.favorites = this.favorites.filter(city => this.normalizeName(city.name) !== name);
        this.saveFavorites();
        this.isDedicatedPage ? this.renderFavoritesPage() : this.renderFavoritesModal();
        this.showToast(`Removed ${cityName} from favorites`);
    }

    isFavorite(cityName) {
        const name = this.normalizeName(cityName);
        return this.favorites.some(city => this.normalizeName(city.name) === name);
    }

    normalizeName(name) {
        if (!name) return '';
        return String(name).trim().toLowerCase();
    }

    saveFavorites() {
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
        if (this.isDedicatedPage) {
            this.updateSummary();
        }
    }

    filterFavorites() {
        const searchTerm = this.favoritesSearch.value.toLowerCase();
        const filteredFavorites = this.favorites.filter(city => 
            city.name.toLowerCase().includes(searchTerm)
        );
        this.renderFavoritesList(filteredFavorites);
    }

    sortFavorites() {
        const sortType = this.favoritesSort.value;
        let sortedFavorites = [...this.favorites];

        switch (sortType) {
            case 'name':
                sortedFavorites.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'temp':
                sortedFavorites.sort((a, b) => parseFloat(b.temp) - parseFloat(a.temp));
                break;
            case 'recent':
                sortedFavorites.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                break;
        }

        this.renderFavoritesList(sortedFavorites);
    }

    renderFavoritesModal() {
        if (this.favorites.length === 0) {
            this.favoritesList.innerHTML = `
                <div class="empty-favorites">
                    <i class="fas fa-star empty-star"></i>
                    <p>No favorites yet</p>
                    <p class="empty-subtitle">Search for cities and star them to add to favorites</p>
                </div>
            `;
            return;
        }
        this.renderFavoritesList(this.favorites);
    }

    renderFavoritesPage() {
        this.updateSummary();
        if (this.favorites.length === 0) {
            this.favoritesGrid.innerHTML = `
                <div class="empty-favorites">
                    <i class="fas fa-star empty-star"></i>
                    <p>No favorites yet</p>
                    <p class="empty-subtitle">Search for cities and star them to add to favorites</p>
                    <a href="main.html" class="add-favorites-btn">
                        <i class="fas fa-plus"></i> Add Cities
                    </a>
                </div>
            `;
            return;
        }
        this.renderFavoritesList(this.favorites);
    }

    renderFavoritesList(cities) {
        const container = this.isDedicatedPage ? this.favoritesGrid : this.favoritesList;
        container.innerHTML = cities.map(city => this.createFavoriteCard(city)).join('');
    }

    createFavoriteCard(city) {
        return `
            <div class="favorite-card" data-city="${city.name}">
                <div class="favorite-header">
                    <span class="favorite-city">${city.name}</span>
                    <img src="images/${this.getWeatherIcon(city.condition)}.png" 
                         alt="${city.condition}" 
                         class="favorite-weather-icon">
                </div>
                <div class="favorite-temp">${city.temp}°C</div>
                <div class="favorite-details">
                    <div class="detail-item">
                        <i class="fas fa-cloud"></i>
                        <span>${city.condition}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-clock"></i>
                        <span>${this.formatDate(city.timestamp)}</span>
                    </div>
                </div>
                <div class="favorite-actions">
                    <button class="btn btn-danger" onclick="favoritesManager.removeFavorite('${city.name}')">
                        <i class="fas fa-trash-alt"></i> Remove
                    </button>
                    <button class="btn btn-primary" onclick="loadWeatherData('${city.name}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                </div>
            </div>
        `;
    }

    updateSummary() {
        if (!this.isDedicatedPage) return;

        this.totalFavorites.textContent = this.favorites.length;

        if (this.favorites.length > 0) {
            const sortedByTemp = [...this.favorites].sort((a, b) => parseFloat(b.temp) - parseFloat(a.temp));
            this.warmestCity.textContent = `${sortedByTemp[0].name} (${sortedByTemp[0].temp}°C)`;
            this.coldestCity.textContent = `${sortedByTemp[sortedByTemp.length - 1].name} (${sortedByTemp[sortedByTemp.length - 1].temp}°C)`;
        } else {
            this.warmestCity.textContent = '--';
            this.coldestCity.textContent = '--';
        }

        this.lastUpdated.textContent = new Date().toLocaleString();
    }

    showRefreshModal() {
        this.refreshModal.classList.add('show');
    }

    async refreshAllWeather() {
        this.refreshModal.classList.remove('show');
        this.refreshFab.classList.add('updating');

        try {
            for (let city of this.favorites) {
                const data = await weatherManager.getWeatherByCity(city.name);
                const index = this.favorites.findIndex(f => f.name === city.name);
                if (index !== -1) {
                    this.favorites[index] = {
                        ...this.favorites[index],
                        temp: data.temp,
                        condition: data.condition,
                        timestamp: new Date().toISOString()
                    };
                }
            }

            this.saveFavorites();
            this.renderFavoritesPage();
            this.showToast('Weather data updated for all cities');
        } catch (error) {
            this.showToast('Error updating weather data');
        } finally {
            this.refreshFab.classList.remove('updating');
        }
    }

    getWeatherIcon(condition) {
        condition = condition.toLowerCase();
        if (condition.includes('rain')) return 'rainy';
        if (condition.includes('cloud')) return 'cloudy';
        if (condition.includes('sun')) return 'sun';
        if (condition.includes('clear')) return 'sun';
        return 'cloudy';
    }

    formatDate(timestamp) {
        return new Date(timestamp).toLocaleDateString();
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'weather-alert';
        toast.innerHTML = `
            <i class="fas fa-star"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    updateFavoriteIcon(cityName) {
        const favoriteBtn = document.getElementById('favoriteIcon');
        if (favoriteBtn) {
            const icon = favoriteBtn.querySelector('i');
            if (this.isFavorite(cityName)) {
                if (icon) { icon.classList.remove('far'); icon.classList.add('fas'); }
                favoriteBtn.setAttribute('aria-pressed', 'true');
                favoriteBtn.classList.add('active');
            } else {
                if (icon) { icon.classList.remove('fas'); icon.classList.add('far'); }
                favoriteBtn.setAttribute('aria-pressed', 'false');
                favoriteBtn.classList.remove('active');
            }
        }
    }
}

// Initialize Favorites Manager
const favoritesManager = new FavoritesManager();

// Add event listener for favorites button in the navbar
const favoritesBtn = document.getElementById('favoritesBtn');
if (favoritesBtn) {
    favoritesBtn.addEventListener('click', () => {
        window.location.href = 'favorites.html';
    });
}