// WeatherEndZone - Main JavaScript File

class WeatherApp {
    constructor() {
        // API URLs - Open-Meteo is completely free and doesn't require API keys!
        this.WEATHER_BASE_URL = 'https://api.open-meteo.com/v1';
        this.GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1';
        this.TIMEZONE_BASE_URL = 'https://worldtimeapi.org/api/timezone';
        this.NEWS_BASE_URL = 'https://newsapi.org/v2';
        
        // NewsAPI key - your actual API key
        this.NEWS_API_KEY = '0a6cabfd23d54a0bb9f30efb8919e69c';
        
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

        document.getElementById('show-api-key').addEventListener('change', (e) => {
            const input = document.getElementById('newsapi-input');
            input.type = e.target.checked ? 'text' : 'password';
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

    openSettingsModal() {
        const modal = document.getElementById('settings-modal');
        const input = document.getElementById('newsapi-input');
        
        // Load current API key
        const currentKey = localStorage.getItem('newsapi_key') || '';
        input.value = currentKey;
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        input.focus();
    }

    closeSettingsModal() {
        document.getElementById('settings-modal').classList.add('hidden');
        document.getElementById('settings-modal').classList.remove('flex');
        document.getElementById('show-api-key').checked = false;
        document.getElementById('newsapi-input').type = 'password';
    }

    saveSettings() {
        const apiKey = document.getElementById('newsapi-input').value.trim();
        
        if (apiKey) {
            localStorage.setItem('newsapi_key', apiKey);
            this.NEWS_API_KEY = apiKey;
            alert('Settings saved! Your NewsAPI key has been updated.');
        } else {
            localStorage.removeItem('newsapi_key');
            this.NEWS_API_KEY = '';
            alert('Settings saved! NewsAPI key removed - will use mock news data.');
        }
        
        this.closeSettingsModal();
        
        // Refresh data to use new API key
        if (this.cities.length > 0) {
            this.updateAllData();
        }
    }

    clearSettings() {
        if (confirm('Are you sure you want to clear all settings? This will remove your NewsAPI key.')) {
            localStorage.removeItem('newsapi_key');
            localStorage.removeItem('newsapi_prompted');
            this.NEWS_API_KEY = '';
            document.getElementById('newsapi-input').value = '';
            alert('Settings cleared! Will use mock news data.');
        }
    }

    async addCity() {
        const cityName = document.getElementById('city-input').value.trim();
        if (!cityName) return;

        this.showLoading(true);
        
        try {
            // Check if city already exists
            if (this.cities.some(city => city.name.toLowerCase() === cityName.toLowerCase())) {
                alert('City already added!');
                this.closeModal();
                this.showLoading(false);
                return;
            }

            // Get city coordinates
            const geoData = await this.fetchGeoData(cityName);
            if (!geoData || geoData.length === 0) {
                alert('City not found! Please check the spelling.');
                this.showLoading(false);
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

            this.cities.push(city);
            this.saveCities();
            await this.updateCityData(city);
            this.renderCities();
            this.closeModal();
            
        } catch (error) {
            console.error('Error adding city:', error);
            alert('Error adding city. Please try again.');
        }
        
        this.showLoading(false);
    }

    async fetchGeoData(cityName) {
        const response = await fetch(
            `${this.GEOCODING_BASE_URL}/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
        );
        
        if (!response.ok) {
            throw new Error('Geocoding API error');
        }
        
        const data = await response.json();
        return data.results || [];
    }

    async fetchWeatherData(lat, lon) {
        // Get current weather and forecast in one API call
        const response = await fetch(
            `${this.WEATHER_BASE_URL}/forecast?latitude=${lat}&longitude=${lon}` +
            `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m` +
            `&hourly=temperature_2m,weather_code,precipitation_probability` +
            `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant` +
            `&timezone=auto&forecast_days=7`
        );
        
        if (!response.ok) {
            throw new Error('Weather API error');
        }
        
        return await response.json();
    }

    async fetchForecastData(lat, lon) {
        // This is now combined with fetchWeatherData for Open-Meteo
        // Return null as it's handled in fetchWeatherData
        return null;
    }

    async fetchTimezoneData(lat, lon) {
        try {
            // Using a more reliable approach for timezone detection
            const response = await fetch(`https://api.ipgeolocation.io/timezone?apiKey=free&lat=${lat}&long=${lon}`);
            
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.log('Using fallback timezone method');
        }
        
        // Fallback: use browser's timezone
        return {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            date_time: new Date().toISOString()
        };
    }

    async fetchNewsData(cityName, countryCode) {
        try {
            // Try to fetch real news data from NewsAPI using hardcoded key
            if (this.NEWS_API_KEY) {
                const queries = [
                    `${cityName}`,
                    `${countryCode}`,
                    'weather'
                ];
                
                // Try each query until we get results
                for (const query of queries) {
                    try {
                        const response = await fetch(
                            `${this.NEWS_BASE_URL}/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=5&apiKey=${this.NEWS_API_KEY}`
                        );
                        
                        if (response.ok) {
                            const data = await response.json();
                            if (data.articles && data.articles.length > 0) {
                                // Filter out articles with null titles or descriptions
                                const validArticles = data.articles.filter(article => 
                                    article.title && 
                                    article.description && 
                                    article.title !== '[Removed]' &&
                                    article.description !== '[Removed]'
                                );
                                
                                if (validArticles.length > 0) {
                                    return { articles: validArticles };
                                }
                            }
                        }
                    } catch (error) {
                        console.log(`Failed to fetch news for query: ${query}`);
                        continue;
                    }
                }
            }
            
            // Fallback to mock news data
            return this.getMockNews(cityName);
            
        } catch (error) {
            console.error('News API error:', error);
            return this.getMockNews(cityName);
        }
    }

    getMockNews(cityName) {
        const mockNews = [
            {
                title: `Weather Update for ${cityName}`,
                description: 'Stay updated with the latest weather conditions and forecasts for your area. Check current temperature, humidity, and wind conditions.',
                publishedAt: new Date().toISOString(),
                source: { name: 'Weather Service' },
                url: '#'
            },
            {
                title: `${cityName} Local Development News`,
                description: 'Latest updates on city infrastructure, development projects, and community initiatives in your area.',
                publishedAt: new Date(Date.now() - 3600000).toISOString(),
                source: { name: 'Local News' },
                url: '#'
            },
            {
                title: 'Global Weather Patterns',
                description: 'Current climate trends and weather developments affecting regions worldwide. Stay informed about global weather patterns.',
                publishedAt: new Date(Date.now() - 7200000).toISOString(),
                source: { name: 'Climate News' },
                url: '#'
            },
            {
                title: 'Environmental Updates',
                description: 'Environmental news and sustainability initiatives. Learn about local and global environmental developments.',
                publishedAt: new Date(Date.now() - 10800000).toISOString(),
                source: { name: 'Environmental Today' },
                url: '#'
            }
        ];

        return { articles: mockNews };
    }

    async updateCityData(city) {
        try {
            const [weatherData, timezoneData, newsData] = await Promise.all([
                this.fetchWeatherData(city.lat, city.lon),
                this.fetchTimezoneData(city.lat, city.lon),
                this.fetchNewsData(city.name, city.country)
            ]);

            city.weather = weatherData;
            city.timezone = timezoneData;
            city.news = newsData;
            city.lastUpdated = new Date().toISOString();

        } catch (error) {
            console.error(`Error updating data for ${city.name}:`, error);
        }
    }

    async updateAllData() {
        if (this.cities.length === 0) return;
        
        this.showLoading(true);
        
        try {
            await Promise.all(this.cities.map(city => this.updateCityData(city)));
            this.saveCities();
            this.renderCities();
        } catch (error) {
            console.error('Error updating all data:', error);
        }
        
        this.showLoading(false);
    }

    renderCities() {
        const container = document.getElementById('cities-container');
        const noCitiesMessage = document.getElementById('no-cities');
        
        if (this.cities.length === 0) {
            container.innerHTML = '';
            noCitiesMessage.classList.remove('hidden');
            return;
        }
        
        noCitiesMessage.classList.add('hidden');
        container.innerHTML = this.cities.map(city => this.renderCityCard(city)).join('');
    }

    renderCityCard(city) {
        if (!city.weather) {
            return `
                <div class="bg-white rounded-xl shadow-lg p-6 fade-in">
                    <div class="text-center">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        <p class="mt-2 text-gray-600">Loading ${city.name}...</p>
                    </div>
                </div>
            `;
        }

        const currentTime = this.formatLocalTime(city.timezone);
        const current = city.weather.current;
        const weatherIcon = this.getWeatherIcon(current.weather_code, current.is_day);
        const temp = Math.round(current.temperature_2m);
        const feelsLike = Math.round(current.apparent_temperature);
        
        return `
            <div class="bg-white rounded-xl shadow-lg overflow-hidden fade-in">
                <!-- City Header -->
                <div class="gradient-blue text-white p-6">
                    <div class="flex justify-between items-start">
                        <div>
                            <h2 class="text-xl font-bold">${city.name}</h2>
                            <p class="text-blue-100">${city.state ? city.state + ', ' : ''}${city.country}</p>
                            <p class="text-blue-100 text-sm mt-1">${currentTime}</p>
                        </div>
                        <button onclick="app.removeCity(${city.id})" class="text-white hover:text-red-200 transition-colors">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <!-- Weather Section -->
                <div class="p-6">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center space-x-4">
                            <div class="text-5xl">${weatherIcon}</div>
                            <div>
                                <div class="text-3xl font-bold text-gray-800">${temp}°C</div>
                                <div class="text-sm text-gray-600">Feels like ${feelsLike}°C</div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-lg font-semibold text-gray-800 capitalize">
                                ${this.getWeatherDescription(current.weather_code)}
                            </div>
                            <div class="text-sm text-gray-600">
                                ${current.relative_humidity_2m}% humidity
                            </div>
                        </div>
                    </div>

                    <!-- Weather Details -->
                    <div class="grid grid-cols-2 gap-4 mb-6">
                        <div class="bg-gray-50 rounded-lg p-3">
                            <div class="flex items-center space-x-2">
                                <i class="fas fa-wind text-blue-500"></i>
                                <span class="text-sm font-medium">Wind</span>
                            </div>
                            <div class="text-lg font-semibold">${current.wind_speed_10m} km/h</div>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-3">
                            <div class="flex items-center space-x-2">
                                <i class="fas fa-cloud text-blue-500"></i>
                                <span class="text-sm font-medium">Cloud Cover</span>
                            </div>
                            <div class="text-lg font-semibold">${current.cloud_cover}%</div>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-3">
                            <div class="flex items-center space-x-2">
                                <i class="fas fa-thermometer-half text-red-500"></i>
                                <span class="text-sm font-medium">Pressure</span>
                            </div>
                            <div class="text-lg font-semibold">${Math.round(current.pressure_msl)} hPa</div>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-3">
                            <div class="flex items-center space-x-2">
                                <i class="fas fa-eye text-blue-500"></i>
                                <span class="text-sm font-medium">Wind Gusts</span>
                            </div>
                            <div class="text-lg font-semibold">${current.wind_gusts_10m} km/h</div>
                        </div>
                    </div>

                    <!-- 7-Day Forecast -->
                    <div class="mb-6">
                        <h3 class="text-lg font-semibold mb-3 flex items-center">
                            <i class="fas fa-calendar-alt text-blue-500 mr-2"></i>
                            7-Day Forecast
                        </h3>
                        <div class="space-y-2">
                            ${this.renderForecast(city.weather)}
                        </div>
                    </div>

                    <!-- News Section -->
                    <div>
                        <h3 class="text-lg font-semibold mb-3 flex items-center">
                            <i class="fas fa-newspaper text-green-500 mr-2"></i>
                            Local News
                        </h3>
                        <div class="space-y-3 max-h-60 overflow-y-auto scrollbar-thin">
                            ${this.renderNews(city.news)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderForecast(weatherData) {
        if (!weatherData || !weatherData.daily) return '<p class="text-gray-500">Forecast not available</p>';

        const daily = weatherData.daily;
        
        return daily.time.slice(0, 7).map((date, index) => {
            const dayDate = new Date(date);
            const dayName = dayDate.toLocaleDateString('en', { weekday: 'short' });
            const maxTemp = Math.round(daily.temperature_2m_max[index]);
            const minTemp = Math.round(daily.temperature_2m_min[index]);
            const weatherCode = daily.weather_code[index];
            const icon = this.getWeatherIcon(weatherCode, 1); // Assume day for daily forecast
            const description = this.getWeatherDescription(weatherCode);
            
            return `
                <div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <span class="font-medium text-gray-700 w-12">${dayName}</span>
                    <span class="text-xl">${icon}</span>
                    <span class="text-gray-600 capitalize flex-1 text-center text-sm">
                        ${description}
                    </span>
                    <span class="font-semibold text-gray-800">${maxTemp}°/${minTemp}°</span>
                </div>
            `;
        }).join('');
    }

    renderNews(newsData) {
        if (!newsData || !newsData.articles || newsData.articles.length === 0) {
            return '<p class="text-gray-500">No news available</p>';
        }

        return newsData.articles.slice(0, 3).map(article => {
            const publishedDate = new Date(article.publishedAt).toLocaleDateString();
            const articleUrl = article.url && article.url !== '#' ? article.url : null;
            
            return `
                <div class="border-l-4 border-green-500 pl-3 news-item">
                    ${articleUrl ? `<a href="${articleUrl}" target="_blank" rel="noopener noreferrer" class="block hover:bg-gray-50 transition-colors">` : '<div>'}
                        <h4 class="font-medium text-gray-800 text-sm leading-tight mb-1 ${articleUrl ? 'hover:text-blue-600' : ''}">
                            ${article.title}
                            ${articleUrl ? '<i class="fas fa-external-link-alt text-xs ml-1 text-gray-400"></i>' : ''}
                        </h4>
                        <p class="text-gray-600 text-xs mb-2 leading-relaxed">
                            ${article.description}
                        </p>
                        <div class="flex justify-between items-center text-xs text-gray-500">
                            <span>${article.source.name}</span>
                            <span>${publishedDate}</span>
                        </div>
                    ${articleUrl ? '</a>' : '</div>'}
                </div>
            `;
        }).join('');
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

    showLoading(show) {
        const loading = document.getElementById('loading');
        if (show) {
            loading.classList.remove('hidden');
            loading.classList.add('flex');
        } else {
            loading.classList.add('hidden');
            loading.classList.remove('flex');
        }
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
