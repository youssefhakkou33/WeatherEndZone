// WeatherEndZone - Main JavaScript File
// Version 2.0 - News section removed for better performance

class WeatherApp {
    constructor() {
        // API URLs - Open-Meteo is completely free and doesn't require API keys!
        this.WEATHER_BASE_URL = 'https://api.open-meteo.com/v1';
        this.GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1';
        this.TIMEZONE_BASE_URL = 'https://worldtimeapi.org/api/timezone';
        
        // App state
        this.cities = JSON.parse(localStorage.getItem('weatherapp_cities')) || [];
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderCities();
        this.updateAllData();
        
        // Auto-refresh every 10 minutes
        setInterval(() => this.updateAllData(), 600000);
    }

    bindEvents() {
        // Settings modal
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.openSettingsModal();
        });

        document.getElementById('close-settings-modal').addEventListener('click', this.closeSettingsModal);
        document.getElementById('cancel-settings').addEventListener('click', this.closeSettingsModal);
        
        document.getElementById('save-settings').addEventListener('click', () => {
            this.saveSettings();
        });

        document.getElementById('clear-settings').addEventListener('click', () => {
            this.clearSettings();
        });

        // Add city modal
        document.getElementById('add-city-btn').addEventListener('click', () => {
            document.getElementById('add-city-modal').classList.remove('hidden');
            document.getElementById('add-city-modal').classList.add('flex');
            document.getElementById('city-input').focus();
        });

        // Close modal events
        document.getElementById('close-modal').addEventListener('click', this.closeModal);
        document.getElementById('cancel-modal').addEventListener('click', this.closeModal);
        
        // Modal backdrop click
        document.getElementById('add-city-modal').addEventListener('click', (e) => {
            if (e.target.id === 'add-city-modal') {
                this.closeModal();
            }
        });

        document.getElementById('settings-modal').addEventListener('click', (e) => {
            if (e.target.id === 'settings-modal') {
                this.closeSettingsModal();
            }
        });

        // Add city form
        document.getElementById('add-city-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addCity();
        });

        // Refresh button
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.updateAllData();
            // Add visual feedback
            const btn = document.getElementById('refresh-btn');
            const icon = btn.querySelector('i');
            icon.style.animation = 'spin 1s linear';
            setTimeout(() => {
                icon.style.animation = '';
            }, 1000);
        });

        // Add touch feedback for mobile
        this.addTouchFeedback();

        // Close modals on backdrop click
        document.getElementById('add-city-modal').addEventListener('click', (e) => {
            if (e.target.id === 'add-city-modal') {
                this.closeModal();
            }
        });

        document.getElementById('settings-modal').addEventListener('click', (e) => {
            if (e.target.id === 'settings-modal') {
                this.closeSettingsModal();
            }
        });

        // Prevent form submission on enter in city input
        document.getElementById('city-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addCity();
            }
        });

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeSettingsModal();
            }
        });
    }

    closeModal() {
        document.getElementById('add-city-modal').classList.add('hidden');
        document.getElementById('add-city-modal').classList.remove('flex');
        document.getElementById('city-input').value = '';
    }

    addTouchFeedback() {
        // Add touch feedback for buttons
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('touchstart', () => {
                button.style.transform = 'scale(0.95)';
                button.style.transition = 'transform 0.1s ease';
            });
            
            button.addEventListener('touchend', () => {
                setTimeout(() => {
                    button.style.transform = '';
                }, 150);
            });
        });
    }

    openSettingsModal() {
        const modal = document.getElementById('settings-modal');
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    closeSettingsModal() {
        document.getElementById('settings-modal').classList.add('hidden');
        document.getElementById('settings-modal').classList.remove('flex');
        document.getElementById('show-api-key').checked = false;
    }

    saveSettings() {
        alert('Settings saved!');
        this.closeSettingsModal();
        
        // Refresh data
        if (this.cities.length > 0) {
            this.updateAllData();
        }
    }

    clearSettings() {
        if (confirm('Are you sure you want to clear all settings?')) {
            alert('Settings cleared!');
        }
    }

    async addCity() {
        const cityName = document.getElementById('city-input').value.trim();
        if (!cityName) return;

        this.showLoading();
        
        try {
            // Check if city already exists
            if (this.cities.some(city => city.name.toLowerCase() === cityName.toLowerCase())) {
                alert('City already added!');
                this.closeModal();
                return;
            }

            console.log('Adding city:', cityName);
            
            // Get city coordinates
            const geoData = await this.fetchGeoData(cityName);
            if (!geoData || geoData.length === 0) {
                alert('City not found! Please check the spelling.');
                return;
            }

            const city = {
                id: Date.now(),
                name: geoData[0].name,
                country: geoData[0].country,
                lat: geoData[0].latitude,
                lon: geoData[0].longitude,
                state: geoData[0].admin1 || ''
            };

            console.log('Created city object:', city);

            this.cities.push(city);
            this.saveCities();
            
            // Update city data with timeout to prevent hanging
            const updatePromise = this.updateCityData(city);
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), 30000)
            );
            
            await Promise.race([updatePromise, timeoutPromise]);
            
            this.renderCities();
            this.closeModal();
            
            console.log('Successfully added city:', city.name);
            
        } catch (error) {
            console.error('Error adding city:', error);
            
            // Show user-friendly error message
            if (error.message === 'Request timeout') {
                alert('Request timed out. Please check your internet connection and try again.');
            } else if (error.message.includes('API error')) {
                alert('Weather service is temporarily unavailable. Please try again later.');
            } else {
                alert('Error adding city. Please try again.');
            }
            
            // Remove the city if it was added but failed to load data
            if (this.cities.length > 0) {
                const lastCity = this.cities[this.cities.length - 1];
                if (lastCity.name === cityName || !lastCity.weather) {
                    this.cities.pop();
                    this.saveCities();
                }
            }
        } finally {
            // Always hide loading, even if there's an error
            this.hideLoading();
        }
    }

    async fetchGeoData(cityName) {
        try {
            console.log('Fetching geo data for:', cityName);
            const response = await fetch(
                `${this.GEOCODING_BASE_URL}/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
            );
            
            if (!response.ok) {
                console.error('Geocoding API error:', response.status, response.statusText);
                throw new Error(`Geocoding API error: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Geo data received:', data);
            return data.results || [];
        } catch (error) {
            console.error('Error in fetchGeoData:', error);
            throw error;
        }
    }

    async fetchWeatherData(lat, lon) {
        try {
            console.log('Fetching weather data for:', lat, lon);
            // Get current weather and forecast in one API call
            const response = await fetch(
                `${this.WEATHER_BASE_URL}/forecast?latitude=${lat}&longitude=${lon}` +
                `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,is_day` +
                `&hourly=temperature_2m,weather_code,precipitation_probability` +
                `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant` +
                `&timezone=auto&forecast_days=7`
            );
            
            if (!response.ok) {
                console.error('Weather API error:', response.status, response.statusText);
                throw new Error(`Weather API error: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Weather data received for', lat, lon);
            return data;
        } catch (error) {
            console.error('Error in fetchWeatherData:', error);
            throw error;
        }
    }

    async fetchForecastData(lat, lon) {
        // This is now combined with fetchWeatherData for Open-Meteo
        // Return null as it's handled in fetchWeatherData
        return null;
    }

    async fetchTimezoneData(lat, lon) {
        try {
            console.log('Fetching timezone data for:', lat, lon);
            
            // Try WorldTimeAPI first (more reliable and free)
            try {
                const response = await fetch(`https://worldtimeapi.org/api/timezone`);
                if (response.ok) {
                    const timezones = await response.json();
                    // Use a simple approach - just get the current timezone
                    const fallbackResponse = await fetch(`https://worldtimeapi.org/api/ip`);
                    if (fallbackResponse.ok) {
                        const data = await fallbackResponse.json();
                        console.log('Timezone data received via WorldTimeAPI');
                        return {
                            timezone: data.timezone,
                            date_time: data.datetime
                        };
                    }
                }
            } catch (error) {
                console.log('WorldTimeAPI failed, trying fallback');
            }
            
        } catch (error) {
            console.log('Using browser timezone fallback');
        }
        
        // Fallback: use browser's timezone
        console.log('Using browser timezone as fallback');
        return {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            date_time: new Date().toISOString()
        };
    }

    async updateCityData(city) {
        try {
            console.log('Updating city data for:', city.name);
            
            const [weatherData, timezoneData] = await Promise.all([
                this.fetchWeatherData(city.lat, city.lon),
                this.fetchTimezoneData(city.lat, city.lon)
            ]);

            city.weather = weatherData;
            city.timezone = timezoneData;
            city.lastUpdated = new Date().toISOString();
            
            console.log('Successfully updated city data for:', city.name);

        } catch (error) {
            console.error(`Error updating data for ${city.name}:`, error);
            // Set error state for the city
            city.error = error.message;
            throw error; // Re-throw to be handled by calling function
        }
    }

    async updateAllData() {
        if (this.cities.length === 0) return;
        
        this.showLoading();
        
        try {
            console.log('Updating all city data...');
            
            // Add timeout to prevent hanging
            const updatePromises = this.cities.map(city => {
                const updatePromise = this.updateCityData(city);
                const timeoutPromise = new Promise((resolve) => 
                    setTimeout(() => {
                        console.warn(`Timeout updating ${city.name}, using cached data`);
                        resolve(); // Resolve instead of reject to continue with other cities
                    }, 15000)
                );
                return Promise.race([updatePromise, timeoutPromise]);
            });
            
            await Promise.allSettled(updatePromises);
            
            this.saveCities();
            this.renderCities();
            
            console.log('Finished updating all cities');
            
        } catch (error) {
            console.error('Error updating all data:', error);
            // Still render cities with cached data
            this.renderCities();
        } finally {
            this.hideLoading();
        }
    }

    renderCities() {
        const container = document.getElementById('cities-container');
        const noCitiesDiv = document.getElementById('no-cities');
        
        if (this.cities.length === 0) {
            container.style.display = 'none';
            noCitiesDiv.style.display = 'block';
            return;
        }
        
        container.style.display = 'grid';
        noCitiesDiv.style.display = 'none';
        
        // Add staggered animation
        container.innerHTML = this.cities.map((city, index) => {
            const card = this.renderCityCard(city);
            return `<div style="animation-delay: ${index * 0.1}s">${card}</div>`;
        }).join('');
        
        // Add intersection observer for scroll animations
        this.addScrollAnimations();
    }

    renderCityCard(city) {
        // Show error state if there's an error
        if (city.error && !city.weather) {
            return `
                <div class="glass-effect rounded-2xl p-6 bounce-in hover-lift shadow-xl border-2 border-red-200">
                    <div class="text-center">
                        <div class="text-6xl mb-4">⚠️</div>
                        <h3 class="text-lg font-semibold text-gray-800 mb-2">${city.name}</h3>
                        <p class="text-red-600 font-medium mb-4">Failed to load weather data</p>
                        <button onclick="app.reloadCity(${city.id})" class="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl transition-all duration-300 hover-lift shadow-lg text-sm">
                            <i class="fas fa-retry mr-2"></i>Try Again
                        </button>
                    </div>
                </div>
            `;
        }
        
        // Show loading state if no weather data
        if (!city.weather) {
            return `
                <div class="glass-effect rounded-2xl p-6 bounce-in hover-lift shadow-xl">
                    <div class="text-center">
                        <div class="relative mb-4">
                            <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 mx-auto"></div>
                            <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 mx-auto absolute inset-0"></div>
                        </div>
                        <p class="text-gray-600 font-medium">Loading ${city.name}...</p>
                        <div class="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div class="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>
            `;
        }

        try {
            const currentTime = this.formatLocalTime(city.timezone);
            const current = city.weather.current;
            const weatherIcon = this.getWeatherIcon(current.weather_code, current.is_day);
            const temp = Math.round(current.temperature_2m);
            const feelsLike = Math.round(current.apparent_temperature);
            
            return `
                <div class="glass-effect rounded-2xl overflow-hidden fade-in hover-lift shadow-xl border border-white/20">
                    <!-- City Header -->
                    <div class="gradient-animated text-white p-6 relative overflow-hidden">
                        <div class="absolute inset-0 bg-black/10"></div>
                        <div class="relative z-10">
                            <div class="flex justify-between items-start mb-4">
                                <div class="flex-1">
                                    <h2 class="text-xl md:text-2xl font-bold mb-1">${city.name}</h2>
                                    <p class="text-white/90 text-sm md:text-base">${city.state ? city.state + ', ' : ''}${city.country}</p>
                                    <div class="flex items-center space-x-2 mt-2">
                                        <i class="fas fa-clock text-white/80 text-sm"></i>
                                        <p class="text-white/90 text-sm font-medium">${currentTime}</p>
                                    </div>
                                </div>
                                <button onclick="app.removeCity(${city.id})" class="text-white/80 hover:text-red-300 transition-all duration-200 hover:bg-white/10 rounded-full p-2 hover:scale-110">
                                    <i class="fas fa-times text-lg"></i>
                                </button>
                            </div>
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-4">
                                    <div class="text-5xl md:text-6xl weather-icon">${weatherIcon}</div>
                                    <div>
                                        <div class="text-3xl md:text-4xl font-bold">${temp}°C</div>
                                        <div class="text-sm text-white/80">Feels like ${feelsLike}°C</div>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <div class="text-lg font-semibold capitalize mb-1">
                                        ${this.getWeatherDescription(current.weather_code)}
                                    </div>
                                    <div class="text-sm text-white/80">
                                        <i class="fas fa-tint mr-1"></i>${current.relative_humidity_2m}% humidity
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Weather Section -->
                    <div class="p-6">
                        <!-- Weather Details Grid -->
                        <div class="grid grid-cols-2 gap-3 md:gap-4 mb-6">
                            <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 hover:shadow-md transition-all duration-300">
                                <div class="flex items-center space-x-3 mb-2">
                                    <div class="bg-blue-500 rounded-full p-2">
                                        <i class="fas fa-wind text-white text-sm"></i>
                                    </div>
                                    <span class="text-sm font-semibold text-gray-700">Wind Speed</span>
                                </div>
                                <div class="text-xl font-bold text-gray-800">${current.wind_speed_10m} km/h</div>
                            </div>
                            <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 hover:shadow-md transition-all duration-300">
                                <div class="flex items-center space-x-3 mb-2">
                                    <div class="bg-purple-500 rounded-full p-2">
                                        <i class="fas fa-cloud text-white text-sm"></i>
                                    </div>
                                    <span class="text-sm font-semibold text-gray-700">Cloud Cover</span>
                                </div>
                                <div class="text-xl font-bold text-gray-800">${current.cloud_cover}%</div>
                            </div>
                            <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 hover:shadow-md transition-all duration-300">
                                <div class="flex items-center space-x-3 mb-2">
                                    <div class="bg-green-500 rounded-full p-2">
                                        <i class="fas fa-thermometer-half text-white text-sm"></i>
                                    </div>
                                    <span class="text-sm font-semibold text-gray-700">Pressure</span>
                                </div>
                                <div class="text-xl font-bold text-gray-800">${Math.round(current.pressure_msl)} hPa</div>
                            </div>
                            <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 hover:shadow-md transition-all duration-300">
                                <div class="flex items-center space-x-3 mb-2">
                                    <div class="bg-orange-500 rounded-full p-2">
                                        <i class="fas fa-eye text-white text-sm"></i>
                                    </div>
                                    <span class="text-sm font-semibold text-gray-700">Wind Gusts</span>
                                </div>
                                <div class="text-xl font-bold text-gray-800">${current.wind_gusts_10m} km/h</div>
                            </div>
                        </div>

                        <!-- 7-Day Forecast -->
                        <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 md:p-6">
                            <h3 class="text-lg md:text-xl font-bold mb-4 flex items-center text-gray-800">
                                <div class="bg-blue-500 rounded-full p-2 mr-3">
                                    <i class="fas fa-calendar-alt text-white text-sm"></i>
                                </div>
                                7-Day Forecast
                            </h3>
                            <div class="space-y-3 max-h-80 overflow-y-auto scrollbar-thin">
                                ${this.renderForecast(city.weather)}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error rendering city card:', error);
            return `
                <div class="glass-effect rounded-2xl p-6 bounce-in hover-lift shadow-xl border-2 border-red-200">
                    <div class="text-center">
                        <div class="text-6xl mb-4">⚠️</div>
                        <h3 class="text-lg font-semibold text-gray-800 mb-2">${city.name}</h3>
                        <p class="text-red-600 font-medium mb-4">Error displaying weather data</p>
                        <button onclick="app.removeCity(${city.id})" class="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl transition-all duration-300 hover-lift shadow-lg text-sm">
                            <i class="fas fa-trash mr-2"></i>Remove
                        </button>
                    </div>
                </div>
            `;
        }
    }

    renderForecast(weatherData) {
        if (!weatherData || !weatherData.daily) return '<p class="text-gray-500 text-center py-4">Forecast not available</p>';

        const daily = weatherData.daily;
        
        return daily.time.slice(0, 7).map((date, index) => {
            const dayDate = new Date(date);
            const dayName = dayDate.toLocaleDateString('en', { weekday: 'short' });
            const monthDay = dayDate.toLocaleDateString('en', { month: 'short', day: 'numeric' });
            const maxTemp = Math.round(daily.temperature_2m_max[index]);
            const minTemp = Math.round(daily.temperature_2m_min[index]);
            const weatherCode = daily.weather_code[index];
            const icon = this.getWeatherIcon(weatherCode, 1);
            const description = this.getWeatherDescription(weatherCode);
            
            const isToday = index === 0;
            const cardClasses = isToday ? 
                'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 
                'bg-white hover:bg-gray-50';
            
            return `
                <div class="${cardClasses} rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-100">
                    <div class="flex items-center justify-between">
                        <div class="flex-1">
                            <div class="font-bold text-sm md:text-base">
                                ${isToday ? 'Today' : dayName}
                            </div>
                            <div class="text-xs ${isToday ? 'text-white/80' : 'text-gray-500'} mt-1">
                                ${monthDay}
                            </div>
                        </div>
                        <div class="flex items-center space-x-3 flex-1 justify-center">
                            <span class="text-2xl weather-icon">${icon}</span>
                            <div class="text-center flex-1">
                                <div class="text-xs ${isToday ? 'text-white/90' : 'text-gray-600'} capitalize leading-tight">
                                    ${description}
                                </div>
                            </div>
                        </div>
                        <div class="text-right flex-1">
                            <div class="font-bold text-lg">
                                <span class="${isToday ? 'text-white' : 'text-gray-800'}">${maxTemp}°</span>
                                <span class="mx-1 ${isToday ? 'text-white/60' : 'text-gray-400'}">/</span>
                                <span class="${isToday ? 'text-white/80' : 'text-gray-500'} text-base">${minTemp}°</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    addScrollAnimations() {
        // Intersection Observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe all city cards
        document.querySelectorAll('#cities-container > div').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.6s ease-out';
            observer.observe(card);
        });
    }

    getWeatherIcon(weatherCode, isDay = 1) {
        // Open-Meteo uses WMO weather codes
        const iconMap = {
            // Clear sky
            0: isDay ? '☀️' : '🌙',
            
            // Mainly clear, partly cloudy, and overcast
            1: isDay ? '🌤️' : '🌙',
            2: '⛅',
            3: '☁️',
            
            // Fog and depositing rime fog
            45: '🌫️',
            48: '🌫️',
            
            // Drizzle: Light, moderate, and dense intensity
            51: '🌦️',
            53: '🌦️',
            55: '🌧️',
            
            // Freezing Drizzle: Light and dense intensity
            56: '🌧️',
            57: '🌧️',
            
            // Rain: Slight, moderate and heavy intensity
            61: '🌧️',
            63: '🌧️',
            65: '🌧️',
            
            // Freezing Rain: Light and heavy intensity
            66: '🌧️',
            67: '🌧️',
            
            // Snow fall: Slight, moderate, and heavy intensity
            71: '🌨️',
            73: '❄️',
            75: '❄️',
            
            // Snow grains
            77: '❄️',
            
            // Rain showers: Slight, moderate, and violent
            80: '🌦️',
            81: '🌧️',
            82: '🌧️',
            
            // Snow showers slight and heavy
            85: '🌨️',
            86: '❄️',
            
            // Thunderstorm: Slight or moderate
            95: '⛈️',
            
            // Thunderstorm with slight and heavy hail
            96: '⛈️',
            99: '⛈️'
        };
        
        return iconMap[weatherCode] || '�️';
    }

    getWeatherDescription(weatherCode) {
        const descriptions = {
            0: 'Clear sky',
            1: 'Mainly clear',
            2: 'Partly cloudy',
            3: 'Overcast',
            45: 'Fog',
            48: 'Depositing rime fog',
            51: 'Light drizzle',
            53: 'Moderate drizzle',
            55: 'Dense drizzle',
            56: 'Light freezing drizzle',
            57: 'Dense freezing drizzle',
            61: 'Slight rain',
            63: 'Moderate rain',
            65: 'Heavy rain',
            66: 'Light freezing rain',
            67: 'Heavy freezing rain',
            71: 'Slight snow fall',
            73: 'Moderate snow fall',
            75: 'Heavy snow fall',
            77: 'Snow grains',
            80: 'Slight rain showers',
            81: 'Moderate rain showers',
            82: 'Violent rain showers',
            85: 'Slight snow showers',
            86: 'Heavy snow showers',
            95: 'Thunderstorm',
            96: 'Thunderstorm with slight hail',
            99: 'Thunderstorm with heavy hail'
        };
        
        return descriptions[weatherCode] || 'Unknown';
    }

    formatLocalTime(timezoneData) {
        try {
            if (timezoneData && timezoneData.timezone) {
                const now = new Date();
                return now.toLocaleString('en-US', {
                    timeZone: timezoneData.timezone,
                    weekday: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });
            }
        } catch (error) {
            console.error('Error formatting time:', error);
        }
        
        // Fallback to local time
        return new Date().toLocaleString('en-US', {
            weekday: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    async reloadCity(cityId) {
        const city = this.cities.find(c => c.id === cityId);
        if (!city) return;
        
        console.log('Reloading city:', city.name);
        
        // Clear error state
        delete city.error;
        
        // Re-render to show loading state
        this.renderCities();
        
        try {
            await this.updateCityData(city);
            this.saveCities();
            this.renderCities();
        } catch (error) {
            console.error('Error reloading city:', error);
            city.error = error.message;
            this.renderCities();
        }
    }

    removeCity(cityId) {
        if (confirm('Are you sure you want to remove this city?')) {
            this.cities = this.cities.filter(city => city.id !== cityId);
            this.saveCities();
            this.renderCities();
        }
    }

    saveCities() {
        localStorage.setItem('weatherapp_cities', JSON.stringify(this.cities));
    }

    showLoading() {
        const loading = document.getElementById('loading');
        loading.classList.remove('hidden');
        loading.classList.add('flex');
        
        // Add pulse animation to the loading screen
        setTimeout(() => {
            const loadingDiv = loading.querySelector('div');
            if (loadingDiv) {
                loadingDiv.style.animation = 'pulse 2s ease-in-out infinite';
            }
        }, 100);
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        // Fade out animation
        loading.style.opacity = '0';
        setTimeout(() => {
            loading.classList.add('hidden');
            loading.classList.remove('flex');
            loading.style.opacity = '1';
        }, 300);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new WeatherApp();
});

// Service Worker for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
