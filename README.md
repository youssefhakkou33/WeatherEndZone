# WeatherEndZone

A comprehensive weather, time zone, and news website that provides everything you need to stay up to date with your selected cities. Features a clean, responsive UI that works perfectly on both phones and laptops.

![WeatherEndZone Screenshot](https://via.placeholder.com/800x400/4f46e5/ffffff?text=WeatherEndZone)

## 🌟 Features

- **Real-time Weather Data**: Current weather conditions, 5-day forecasts, and detailed weather metrics
- **Time Zone Support**: Displays local time for each city
- **Local News**: Stay updated with news from your selected cities
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Offline Support**: Basic functionality works offline with service worker
- **Multiple Cities**: Add and manage multiple cities simultaneously
- **Clean UI**: Modern design using Tailwind CSS
- **Free APIs**: Uses only free APIs for all data

## 🚀 Live Demo

[View Live Demo](https://your-github-username.github.io/WeatherEndZone)

## 📱 Screenshots

### Desktop View
![Desktop Screenshot](https://via.placeholder.com/800x500/667eea/ffffff?text=Desktop+View)

### Mobile View
![Mobile Screenshot](https://via.placeholder.com/400x600/764ba2/ffffff?text=Mobile+View)

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3 (Tailwind CSS), JavaScript (ES6+)
- **APIs**: 
  - [Open-Meteo API](https://open-meteo.com/) - Weather data (completely free, no API key needed!)
  - [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) - City coordinates
  - [World Time API](http://worldtimeapi.org/) - Time zone data
  - [NewsAPI](https://newsapi.org/) - News data (optional - with fallback to mock data)
- **Icons**: Font Awesome
- **PWA**: Service Worker for offline functionality

## 📋 Prerequisites

Before you begin, ensure you have:

1. A modern web browser
2. A NewsAPI key (optional - app works with mock data)
3. A web server (for local development)

**Note**: No weather API key needed! Open-Meteo is completely free.

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/youssefhakkou33/WeatherEndZone.git
cd WeatherEndZone
```

### 2. Get API Keys (Optional)

#### NewsAPI (Optional)
1. Go to [NewsAPI](https://newsapi.org/)
2. Sign up for a free account
3. Copy your API key

**Note**: Weather data is now completely free through Open-Meteo - no API key required!

### 3. Configure API Keys (Optional)

If you want to use real news data, open `script.js` and replace the placeholder API key:

```javascript
// Replace this with your actual NewsAPI key (optional)
this.NEWS_API_KEY = 'your_news_api_key_here'; // Optional - app works with mock data
```

**The weather functionality works immediately without any API keys!**

### 4. Serve the Application

#### Option A: Using Python (Recommended)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Option B: Using Node.js
```bash
npx serve .
```

#### Option C: Using Live Server (VS Code)
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

### 5. Access the Application

Open your browser and navigate to `http://localhost:8000`

## 📱 Usage

### Adding Cities
1. Click the "Add City" button in the header
2. Enter a city name in the modal
3. Click "Add City" to confirm

### Viewing Data
Each city card displays:
- **Current weather** with temperature and conditions
- **Local time** in the city's timezone
- **5-day weather forecast**
- **Weather details** (wind, humidity, pressure, visibility)
- **Local news** updates

### Managing Cities
- **Remove cities**: Click the "×" button on any city card
- **Refresh data**: Click the "Refresh" button in the header
- **Auto-refresh**: Data automatically updates every 10 minutes

## 🌐 API Information

### Open-Meteo API
- **Free tier**: Unlimited for fair use (no API key required!)
- **Rate limit**: No strict limits for non-commercial use
- **Data**: Current weather, 7-day forecast, geocoding
- **Coverage**: Global weather data with high accuracy

### Open-Meteo Geocoding API
- **Free**: No API key required
- **Rate limit**: Fair use policy
- **Data**: City coordinates and location information

### World Time API
- **Free**: No API key required
- **Rate limit**: None specified
- **Data**: Timezone information, local time

### NewsAPI
- **Free tier**: 1,000 requests/month
- **Rate limit**: 500 requests/day
- **Fallback**: Mock news data when API unavailable

## 🔧 Customization

### Adding New Weather Metrics
Edit the `renderCityCard()` function in `script.js`:

```javascript
// Add new weather metric
<div class="bg-gray-50 rounded-lg p-3">
    <div class="flex items-center space-x-2">
        <i class="fas fa-your-icon text-blue-500"></i>
        <span class="text-sm font-medium">Your Metric</span>
    </div>
    <div class="text-lg font-semibold">${city.weather.your.data}</div>
</div>
```

### Changing Color Themes
Modify the gradient classes in `styles.css`:

```css
.gradient-blue {
    background: linear-gradient(135deg, #your-color 0%, #your-color 100%);
}
```

### Adding New News Sources
Modify the `fetchNewsData()` function to include additional news sources or categories.

## 📱 Progressive Web App (PWA)

The application includes PWA features:

- **Service Worker**: Caches resources for offline use
- **Responsive Design**: Works on all device sizes
- **Installable**: Can be installed on mobile devices

To enhance PWA functionality, add a `manifest.json`:

```json
{
    "name": "WeatherEndZone",
    "short_name": "WeatherEndZone",
    "description": "Weather, Time & News Hub",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#4f46e5",
    "icons": [
        {
            "src": "icon-192.png",
            "sizes": "192x192",
            "type": "image/png"
        }
    ]
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Weather data not loading**
   - Check your internet connectivity
   - Open-Meteo should work without any API keys
   - Check browser console for errors

2. **CORS errors**
   - Serve the app through a web server, not file://
   - Open-Meteo has CORS enabled for browser requests

3. **Cities not saving**
   - Check if localStorage is enabled in your browser
   - Clear browser cache and try again

4. **Mobile layout issues**
   - Ensure viewport meta tag is present
   - Check Tailwind CSS is loading correctly

### Debug Mode
Add debug mode to `script.js`:

```javascript
constructor() {
    this.DEBUG = true; // Enable debug logging
    // ... rest of constructor
}

debugLog(message, data) {
    if (this.DEBUG) {
        console.log(`[WeatherApp] ${message}`, data);
    }
}
```

## 🚀 Deployment

### GitHub Pages
1. Push your code to GitHub
2. Go to repository Settings
3. Navigate to Pages section
4. Select source branch (usually `main`)
5. Your site will be available at `https://username.github.io/WeatherEndZone`

### Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build` (if using build process)
3. Set publish directory: `./` (root)
4. Deploy

### Vercel
1. Import your GitHub repository
2. No build configuration needed
3. Deploy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Youssef Hakkou**
- GitHub: [@youssefhakkou33](https://github.com/youssefhakkou33)
- Email: your.email@example.com

## 🙏 Acknowledgments

- [Open-Meteo](https://open-meteo.com/) for free, high-quality weather data
- [World Time API](http://worldtimeapi.org/) for timezone data
- [NewsAPI](https://newsapi.org/) for news data
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Font Awesome](https://fontawesome.com/) for icons

## 📊 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔮 Future Enhancements

- [ ] Weather alerts and notifications
- [ ] Historical weather data charts
- [ ] Weather maps integration
- [ ] Social sharing features
- [ ] Export data functionality
- [ ] Multiple language support
- [ ] Dark/light theme toggle
- [ ] Weather widget for other websites
- [ ] Push notifications for weather alerts
- [ ] Geolocation-based city detection

---

⭐ **If you found this project helpful, please give it a star!** ⭐