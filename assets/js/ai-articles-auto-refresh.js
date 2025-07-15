/**
 * AI Articles Auto Refresh - Actualiza automáticamente los artículos de IA
 * Verifica periódicamente si hay nuevos artículos y los agrega dinámicamente
 */
class AIArticlesAutoRefresh {
  constructor() {
    this.refreshInterval = 5 * 60 * 1000; // 5 minutos
    this.lastArticleCount = 0;
    this.isRefreshing = false;
    this.manager = null;
    
    this.init();
  }

  init() {
    console.log('🔄 Iniciando AIArticlesAutoRefresh...');
    
    // Esperar a que el AIArticlesManager esté disponible
    this.waitForManager();
    
    // Configurar intervalo de actualización
    this.setupRefreshInterval();
    
    // Configurar actualización manual con botón
    this.setupManualRefresh();
    
    console.log('✅ AIArticlesAutoRefresh inicializado');
  }

  waitForManager() {
    const checkManager = () => {
      if (window.aiArticlesManager) {
        this.manager = window.aiArticlesManager;
        console.log('🤖 AIArticlesManager encontrado, configurando auto-refresh...');
        this.startAutoRefresh();
      } else {
        setTimeout(checkManager, 1000);
      }
    };
    
    checkManager();
  }

  setupRefreshInterval() {
    // Actualizar cada 5 minutos
    setInterval(() => {
      this.checkForNewArticles();
    }, this.refreshInterval);
    
    console.log(`⏰ Auto-refresh configurado cada ${this.refreshInterval / 1000 / 60} minutos`);
  }

  setupManualRefresh() {
    // Agregar botón de actualización manual en la sección
    const section = document.getElementById('ai-articles-section');
    if (section) {
      const refreshButton = document.createElement('button');
      refreshButton.id = 'ai-refresh-button';
      refreshButton.className = 'btn btn-outline-secondary btn-sm position-absolute';
      refreshButton.style.cssText = 'top: 1rem; right: 1rem; z-index: 10;';
      refreshButton.innerHTML = `
        <i class="bi bi-arrow-clockwise"></i>
        <span class="refresh-text">Actualizar</span>
      `;
      
      refreshButton.addEventListener('click', () => {
        this.manualRefresh();
      });
      
      section.appendChild(refreshButton);
    }
  }

  async checkForNewArticles() {
    if (this.isRefreshing || !this.manager) return;
    
    try {
      console.log('🔍 Verificando nuevos artículos de IA...');
      
      // Obtener la lista actual de archivos
      const response = await fetch('/articulos/');
      if (!response.ok) return;
      
      const html = await response.text();
      const fileRegex = /href="([^"]*\.html)"/g;
      const files = [];
      let match;
      
      while ((match = fileRegex.exec(html)) !== null) {
        const fileName = match[1];
        if (fileName && !fileName.includes('index.html')) {
          files.push(fileName);
        }
      }
      
      // Si hay más archivos que antes, actualizar
      if (files.length > this.lastArticleCount && this.lastArticleCount > 0) {
        console.log(`🆕 Nuevos artículos detectados: ${files.length - this.lastArticleCount}`);
        this.refreshArticles();
      }
      
      this.lastArticleCount = files.length;
      
    } catch (error) {
      console.warn('⚠️ Error verificando nuevos artículos:', error.message);
    }
  }

  async refreshArticles() {
    if (this.isRefreshing || !this.manager) return;
    
    this.isRefreshing = true;
    
    try {
      // Mostrar indicador de actualización
      this.showRefreshIndicator(true);
      
      // Actualizar artículos
      await this.manager.refresh();
      
      // Mostrar notificación de éxito
      this.showNotification('Artículos actualizados', 'success');
      
      console.log('✅ Artículos de IA actualizados exitosamente');
      
    } catch (error) {
      console.error('❌ Error actualizando artículos:', error);
      this.showNotification('Error al actualizar artículos', 'error');
    } finally {
      this.isRefreshing = false;
      this.showRefreshIndicator(false);
    }
  }

  async manualRefresh() {
    if (this.isRefreshing) return;
    
    const button = document.getElementById('ai-refresh-button');
    if (button) {
      button.disabled = true;
      button.innerHTML = `
        <i class="bi bi-arrow-clockwise spin"></i>
        <span class="refresh-text">Actualizando...</span>
      `;
    }
    
    await this.refreshArticles();
    
    if (button) {
      button.disabled = false;
      button.innerHTML = `
        <i class="bi bi-arrow-clockwise"></i>
        <span class="refresh-text">Actualizar</span>
      `;
    }
  }

  showRefreshIndicator(show) {
    const button = document.getElementById('ai-refresh-button');
    if (button) {
      if (show) {
        button.classList.add('refreshing');
      } else {
        button.classList.remove('refreshing');
      }
    }
  }

  showNotification(message, type = 'info') {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.className = `ai-notification ai-notification-${type}`;
    notification.innerHTML = `
      <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
      <span>${message}</span>
    `;
    
    // Agregar estilos
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 10px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  startAutoRefresh() {
    // Inicializar contador de artículos
    this.lastArticleCount = this.manager.articles.length;
    console.log(`📊 Artículos iniciales: ${this.lastArticleCount}`);
  }
}

// Agregar estilos CSS para las animaciones
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  .spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  #ai-refresh-button.refreshing {
    background: var(--primary-color);
    color: white;
  }
  
  #ai-refresh-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
document.head.appendChild(style);

// Auto-inicialización
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Pequeño delay para asegurar que el AIArticlesManager se cargue primero
    setTimeout(() => {
      window.aiArticlesAutoRefresh = new AIArticlesAutoRefresh();
    }, 3000);
  });
} 