// API Configuration for WeatherEndZone
// Copy this file to config.js and add your actual API keys

window.WeatherAppConfig = {
    // Weather API - FREE! No API key needed!
    // WeatherEndZone now uses Open-Meteo (https://open-meteo.com/)
    // Completely free, no registration required, no API limits for fair use
    
    // NewsAPI - Optional (app works with mock data if not provided)
    // Get your free API key from: https://newsapi.org/
    NEWS_API_KEY: '0a6cabfd23d54a0bb9f30efb8919e69c',
    
    // App Settings
    settings: {
        // Auto-refresh interval in milliseconds (default: 10 minutes)
        refreshInterval: 600000,
        
        // Maximum number of cities allowed
        maxCities: 10,
        
        // Default temperature unit ('celsius' or 'fahrenheit')
        temperatureUnit: 'celsius',
        
        // Enable debug logging
        debug: false,
        
        // News settings
        news: {
            // Number of news articles to display per city
            articlesPerCity: 3,
            
            // Use mock news data if NewsAPI is not available
            useMockData: true
        }
    }
};
