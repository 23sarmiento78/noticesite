// Configuración de Google Analytics
const ANALYTICS_CONFIG = {
  // Configura tu ID de Google Analytics aquí
  trackingId: null, // Ejemplo: 'G-XXXXXXXXXX'
  
  // Configuraciones adicionales
  enableEnhancedEcommerce: true,
  enableCustomDimensions: true,
  enableEventTracking: true,
  
  // Dimensiones personalizadas
  customDimensions: {
    userType: 'dimension1',
    contentCategory: 'dimension2',
    sourceType: 'dimension3'
  },
  
  // Eventos personalizados
  customEvents: {
    newsView: 'news_view',
    categoryClick: 'category_click',
    searchQuery: 'search_query',
    externalLink: 'external_link'
  }
};

// Función para habilitar Google Analytics
function enableGoogleAnalytics(trackingId) {
  if (!trackingId) {
    console.warn('⚠️ ID de Google Analytics no proporcionado');
    return false;
  }
  
  ANALYTICS_CONFIG.trackingId = trackingId;
  
  // Cargar Google Analytics
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
  document.head.appendChild(script);
  
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', trackingId, {
    page_title: document.title,
    page_location: window.location.href
  });
  
  console.log('✅ Google Analytics habilitado con ID:', trackingId);
  return true;
}

// Función para deshabilitar Google Analytics
function disableGoogleAnalytics() {
  ANALYTICS_CONFIG.trackingId = null;
  console.log('📊 Google Analytics deshabilitado');
}

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ANALYTICS_CONFIG, enableGoogleAnalytics, disableGoogleAnalytics };
} 