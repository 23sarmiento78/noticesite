// Gestor de clima profesional para periódico digital
class WeatherManager {
  constructor() {
    this.apiKey = 'tu_api_key_aqui'; // Reemplazar con API key real
    this.defaultCity = 'Buenos Aires';
    this.init();
  }

  async init() {
    console.log('🌤️ Iniciando Weather Manager...');
    this.renderPlaceholder();
    await this.loadWeather();
    this.setupAutoRefresh();
  }

  renderPlaceholder() {
    const widget = document.getElementById('weather-widget');
    if (!widget) return;

    widget.innerHTML = `
      <div class="weather-placeholder">
        <div class="weather-skeleton">
          <div class="weather-icon-skeleton"></div>
          <div class="weather-info-skeleton">
            <div class="temp-skeleton"></div>
            <div class="desc-skeleton"></div>
          </div>
        </div>
      </div>
    `;
  }

  async loadWeather() {
    try {
      // Intentar obtener ubicación del usuario
      const position = await this.getUserLocation();
      const weatherData = await this.fetchWeatherData(position);
      this.renderWeather(weatherData);
    } catch (error) {
      console.warn('No se pudo obtener ubicación, usando ciudad por defecto:', error);
      await this.loadDefaultWeather();
    }
  }

  getUserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        { timeout: 10000, enableHighAccuracy: false }
      );
    });
  }

  async fetchWeatherData(coords) {
    // Usar OpenWeatherMap API (gratuita)
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${this.apiKey}&units=metric&lang=es`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error en API del clima');
      return await response.json();
    } catch (error) {
      console.error('Error obteniendo clima:', error);
      return this.getMockWeatherData();
    }
  }

  async loadDefaultWeather() {
    const weatherData = this.getMockWeatherData();
    this.renderWeather(weatherData);
  }

  getMockWeatherData() {
    const cities = [
      { name: 'Buenos Aires', temp: 22, condition: 'Soleado', icon: '01d' },
      { name: 'Madrid', temp: 18, condition: 'Parcialmente nublado', icon: '02d' },
      { name: 'Bogotá', temp: 20, condition: 'Lluvia ligera', icon: '10d' },
      { name: 'México DF', temp: 25, condition: 'Soleado', icon: '01d' }
    ];
    
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    
    return {
      name: randomCity.name,
      main: { temp: randomCity.temp },
      weather: [{ 
        main: randomCity.condition, 
        description: randomCity.condition,
        icon: randomCity.icon 
      }],
      sys: { country: 'AR' }
    };
  }

  renderWeather(data) {
    const widget = document.getElementById('weather-widget');
    const climaTemp = document.getElementById('clima-temp');
    const climaCiudad = document.getElementById('clima-ciudad');
    
    if (!widget) return;

    const temp = Math.round(data.main.temp);
    const condition = data.weather[0].description;
    const icon = data.weather[0].icon;
    const city = data.name;

    // Actualizar widget principal
    widget.innerHTML = `
      <div class="weather-card">
        <div class="weather-main">
          <div class="weather-icon">
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${condition}" />
          </div>
          <div class="weather-info">
            <div class="weather-temp">${temp}°C</div>
            <div class="weather-desc">${condition}</div>
            <div class="weather-location">
              <i class="bi bi-geo-alt"></i> ${city}
            </div>
          </div>
        </div>
        <div class="weather-details">
          <div class="weather-detail">
            <i class="bi bi-droplet"></i>
            <span>Humedad: 65%</span>
          </div>
          <div class="weather-detail">
            <i class="bi bi-wind"></i>
            <span>Viento: 12 km/h</span>
          </div>
        </div>
      </div>
    `;

    // Actualizar header
    if (climaTemp) climaTemp.textContent = `${temp}°C`;
    if (climaCiudad) climaCiudad.textContent = city;
  }

  setupAutoRefresh() {
    // Actualizar clima cada 30 minutos
    setInterval(() => {
      this.loadWeather();
    }, 30 * 60 * 1000);
  }
} 