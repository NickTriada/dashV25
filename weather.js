const API_KEY = '174d63fe7a0512b412c85ec8875f1dba'; // Replace with your actual OpenWeatherMap API key
const ZIP_CODE = '95112';
const COUNTRY = 'US'; // Change if needed

// Helper function to format date without year
function formatDateWithoutYear(date) {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

async function getWeather() {
  try {
    // Get lat/lon from ZIP
    const geoResp = await fetch(`https://api.openweathermap.org/geo/1.0/zip?zip=${ZIP_CODE},${COUNTRY}&appid=${API_KEY}`);
    const geoData = await geoResp.json();
    
    if (!geoResp.ok) {
      throw new Error(`Geocoding API error: ${JSON.stringify(geoData)}`);
    }
    
    console.log('Geocoding response:', geoData);
    const { lat, lon } = geoData;

    // Get current weather
    const currentResp = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
    const currentData = await currentResp.json();
    
    if (!currentResp.ok) {
      throw new Error(`Current weather API error: ${JSON.stringify(currentData)}`);
    }

    // Get 5-day forecast
    const forecastResp = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
    const forecastData = await forecastResp.json();
    
    if (!forecastResp.ok) {
      throw new Error(`Forecast API error: ${JSON.stringify(forecastData)}`);
    }
    
    console.log('Current weather:', currentData);
    console.log('Forecast data:', forecastData);

    const forecastDiv = document.getElementById('forecast');
    forecastDiv.innerHTML = '';
    
    // Helper function to format date to short format (e.g., "3-Sat")
    function formatDateShort(date) {
      return `${date.getDate()}-${date.toLocaleDateString('en-US', { weekday: 'short' })}`;
    }

    // Get current day's data
    const currentDate = new Date(currentData.dt * 1000);
    const currentDayData = {
      date: currentDate,
      temp: currentData.main.temp.toFixed(1),
      min: currentData.main.temp_min.toFixed(1),
      max: currentData.main.temp_max.toFixed(1),
      wind: currentData.wind.speed,
      weather: currentData.weather[0].description
    };

    // Group all forecasts by day
    const dailyForecasts = {};
    forecastData.list.forEach(forecast => {
      const date = new Date(forecast.dt * 1000);
      const dateStr = date.toDateString();
      
      // Skip today's date since we already have it from current weather
      if (dateStr === currentDate.toDateString()) {
        return;
      }
      
      if (!dailyForecasts[dateStr]) {
        dailyForecasts[dateStr] = {
          date: date,
          forecasts: [],
          middayForecast: null
        };
      }
      
      dailyForecasts[dateStr].forecasts.push(forecast);
      
      // Store the forecast closest to noon for the main display
      if (date.getHours() >= 11 && date.getHours() <= 13) {
        dailyForecasts[dateStr].middayForecast = forecast;
      }
    });

    // Prepare all days data
    const allDaysData = [currentDayData];
    Object.values(dailyForecasts).forEach(day => {
      if (!day.middayForecast) return;
      
      const temps = day.forecasts.map(f => f.main.temp);
      const minTemp = Math.min(...temps);
      const maxTemp = Math.max(...temps);
      
      allDaysData.push({
        date: day.date,
        temp: day.middayForecast.main.temp.toFixed(1),
        min: minTemp.toFixed(1),
        max: maxTemp.toFixed(1),
        wind: day.middayForecast.wind.speed,
        weather: day.middayForecast.weather[0].description
      });
    });

    // Create header row with dates
    let headerRow = '<div class="day header"><div class="cell">Day</div>';
    allDaysData.forEach((day, index) => {
      const isToday = index === 0; // First day is always today
      headerRow += `<div class="cell ${isToday ? 'today' : ''}">${formatDateShort(day.date)}</div>`;
    });
    headerRow += '</div>';
    forecastDiv.innerHTML = headerRow;

    // Create rows for each parameter
    const parameters = [
      { name: 'Temp:', unit: '°C', key: 'temp' },
      { name: 'Min:', unit: '°C', key: 'min' },
      { name: 'Max:', unit: '°C', key: 'max' },
      { name: 'Wind:', unit: ' m/s', key: 'wind' },
      { name: 'Weather: ', unit: '', key: 'weather' }
    ];

    parameters.forEach(param => {
      let row = `<div class="day"><div class="cell">${param.name}</div>`;
      allDaysData.forEach((day, index) => {
        const isToday = index === 0; // First day is always today
        row += `<div class="cell ${isToday ? 'today' : ''}">${day[param.key]}${param.unit}</div>`;
      });
      row += '</div>';
      forecastDiv.innerHTML += row;
    });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    document.getElementById('forecast').innerHTML = `<p>Unable to load weather data: ${error.message}</p>`;
  }
}

// Initial weather fetch
getWeather();

// Auto-refresh weather data every 2 hours (2 hours = 2 * 60 * 60 * 1000 milliseconds)
setInterval(getWeather, 1 * 60 * 60 * 1000);
