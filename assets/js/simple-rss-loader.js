// Cargador RSS Simple y Estable
class SimpleRSSLoader {
  constructor() {
    this.feeds = [
      {
        id: 'bbc-tech',
        title: 'BBC Technology',
        url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
        containerId: 'bbc-tech-container',
        fuente: 'BBC',
        categoria: 'Tecnología'
      },
      {
        id: 'elpais-portada',
        title: 'El País Portada',
        url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada',
        containerId: 'elpais-portada-container',
        fuente: 'El País',
        categoria: 'España'
      },
      {
        id: 'elpais-internacional',
        title: 'El País Internacional',
        url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/internacional',
        containerId: 'elpais-internacional-container',
        fuente: 'El País',
        categoria: 'Internacional'
      },
      {
        id: 'clarin-politica',
        title: 'Clarín Política',
        url: 'https://www.clarin.com/rss/politica/',
        containerId: 'categoria5-news-container',
        fuente: 'Clarín',
        categoria: 'Política'
      },
      {
        id: 'clarin-internacional',
        title: 'Clarín Internacional',
        url: 'https://www.clarin.com/rss/mundo/',
        containerId: 'categoria7-news-container',
        fuente: 'Clarín',
        categoria: 'Internacional'
      }
    ];
    
    this.init();
  }

  async init() {
    console.log('🚀 Iniciando cargador RSS simple...');
    
    // Cargar cada feed individualmente
    for (const feed of this.feeds) {
      try {
        await this.loadFeed(feed);
        // Pausa entre feeds
        await this.delay(1000);
      } catch (error) {
        console.error(`Error cargando ${feed.title}:`, error);
        this.showError(feed);
      }
    }
    
    // Cargar contenido de respaldo para contenedores vacíos
    this.loadFallbackForEmpty();
  }

  async loadFeed(feed) {
    console.log(`🔄 Cargando ${feed.title}...`);
    
    try {
      // Intentar con múltiples proxies
      const proxies = [
        'https://api.allorigins.win/get?url=',
        'https://thingproxy.freeboard.io/fetch/',
        'https://corsproxy.io/?'
      ];
      
      let xmlContent = null;
      let lastError = null;
      
      for (const proxy of proxies) {
        try {
          console.log(`🔄 Intentando con proxy: ${proxy}`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
          
          const response = await fetch(`${proxy}${encodeURIComponent(feed.url)}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/xml, text/xml, */*'
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const data = await response.json();
          xmlContent = data.contents || data.data || data;
          
          if (xmlContent) {
            console.log(`✅ Proxy exitoso: ${proxy}`);
            break;
          }
          
        } catch (error) {
          console.warn(`⚠️ Proxy falló: ${proxy} - ${error.message}`);
          lastError = error;
          continue;
        }
      }
      
      if (!xmlContent) {
        throw new Error(`Todos los proxies fallaron: ${lastError?.message}`);
      }

      // Parsear XML simple
      const items = this.parseSimpleXML(xmlContent);
      
      if (items.length > 0) {
        this.renderFeed(feed, items);
        console.log(`✅ ${feed.title}: ${items.length} noticias cargadas`);
      } else {
        throw new Error('No se encontraron noticias');
      }
      
    } catch (error) {
      console.warn(`⚠️ Error con ${feed.title}:`, error.message);
      throw error;
    }
  }

  parseSimpleXML(xmlText) {
    const items = [];
    
    try {
      // Parsear XML de forma simple
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      
      const itemElements = xmlDoc.querySelectorAll('item');
      
      itemElements.forEach(item => {
        const title = item.querySelector('title')?.textContent || '';
        const description = item.querySelector('description')?.textContent || '';
        const link = item.querySelector('link')?.textContent || '#';
        const pubDate = item.querySelector('pubDate')?.textContent || '';
        
        if (title && link) {
          items.push({
            title: this.cleanText(title),
            description: this.cleanText(description),
            link: link,
            pubDate: pubDate
          });
        }
      });
      
    } catch (error) {
      console.error('Error parseando XML:', error);
    }
    
    return items.slice(0, 6); // Máximo 6 noticias
  }

  cleanText(text) {
    if (!text) return '';
    
    // Remover HTML tags
    const cleanText = text.replace(/<[^>]*>/g, '');
    
    // Limitar descripción
    if (cleanText.length > 150) {
      return cleanText.substring(0, 150) + '...';
    }
    
    return cleanText;
  }

  renderFeed(feed, items) {
    const container = document.getElementById(feed.containerId);
    if (!container) {
      console.warn(`Contenedor no encontrado: ${feed.containerId}`);
      return;
    }

    const rowContainer = container.querySelector('.row');
    if (!rowContainer) {
      console.warn(`Row container no encontrado en: ${feed.containerId}`);
      return;
    }

    rowContainer.innerHTML = '';
    
    items.forEach(item => {
      const col = document.createElement('div');
      col.classList.add('col');
      
      col.innerHTML = `
        <article class="card h-100 news-card" style="border: none; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.15); transition: all 0.3s ease;">
          <div class="position-relative">
            <img src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop" class="card-img-top news-image" alt="${item.title}" loading="lazy" style="height: 200px; object-fit: cover; transition: transform 0.3s ease;">
            <div class="overlay-gradient" style="position: absolute; bottom: 0; left: 0; right: 0; height: 50%; background: linear-gradient(transparent, rgba(0,0,0,0.7)); pointer-events: none;"></div>
            <span class="badge category-badge" style="position: absolute; top: 12px; left: 12px; background: #bfa046; color: #111; font-weight: 600; padding: 6px 12px; border-radius: 20px; font-size: 0.75rem;">${feed.categoria}</span>
            <span class="badge source-badge" style="position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,0.9); color: #111; font-weight: 500; padding: 4px 8px; border-radius: 15px; font-size: 0.7rem;">${feed.fuente}</span>
          </div>
          <div class="card-body d-flex flex-column" style="padding: 1.5rem;">
            <h5 class="card-title news-headline" style="color: #bfa046; font-weight: 700; line-height: 1.3; margin-bottom: 0.75rem; font-size: 1.1rem;">${item.title}</h5>
            <p class="card-text news-description flex-grow-1" style="color: #ccc; line-height: 1.5; font-size: 0.9rem; margin-bottom: 1rem;">${item.description}</p>
            <div class="mt-auto">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <small class="text-muted" style="color: #888 !important;">
                  <i class="bi bi-clock"></i> ${this.formatDate(item.pubDate)}
                </small>
              </div>
              <a href="${item.link}" class="btn btn-outline-warning btn-sm w-100" target="_blank" style="border-color: #bfa046; color: #bfa046; font-weight: 600; transition: all 0.3s ease;">
                <i class="bi bi-arrow-right"></i> Leer completo
              </a>
            </div>
          </div>
        </article>
      `;
      
      rowContainer.appendChild(col);
    });
  }

  showError(feed) {
    const container = document.getElementById(feed.containerId);
    if (!container) return;

    const rowContainer = container.querySelector('.row');
    if (!rowContainer) return;

    rowContainer.innerHTML = `
      <div class="col">
        <div class="alert alert-warning text-center">
          <i class="bi bi-exclamation-triangle"></i>
          No se pudieron cargar las noticias de ${feed.fuente} en este momento.
        </div>
      </div>
    `;
  }

  loadFallbackForEmpty() {
    const containers = document.querySelectorAll('[id*="container"]');
    let emptyCount = 0;
    
    containers.forEach(container => {
      const newsCards = container.querySelectorAll('.news-card');
      if (newsCards.length === 0) {
        emptyCount++;
        this.loadSimpleFallback(container);
      }
    });
    
    if (emptyCount > 0) {
      console.log(`🔄 Cargado contenido de respaldo para ${emptyCount} contenedores vacíos`);
    }
  }

  loadSimpleFallback(container) {
    const rowContainer = container.querySelector('.row');
    if (!rowContainer) return;
    
    rowContainer.innerHTML = `
      <div class="col">
        <article class="card h-100 news-card" style="border: none; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.15); transition: all 0.3s ease;">
          <div class="position-relative">
            <img src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop" class="card-img-top news-image" alt="Noticias" loading="lazy" style="height: 200px; object-fit: cover; transition: transform 0.3s ease;">
            <div class="overlay-gradient" style="position: absolute; bottom: 0; left: 0; right: 0; height: 50%; background: linear-gradient(transparent, rgba(0,0,0,0.7)); pointer-events: none;"></div>
            <span class="badge category-badge" style="position: absolute; top: 12px; left: 12px; background: #bfa046; color: #111; font-weight: 600; padding: 6px 12px; border-radius: 20px; font-size: 0.75rem;">Noticias</span>
            <span class="badge source-badge" style="position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,0.9); color: #111; font-weight: 500; padding: 4px 8px; border-radius: 15px; font-size: 0.7rem;">HGARUNA</span>
          </div>
          <div class="card-body d-flex flex-column" style="padding: 1.5rem;">
            <h5 class="card-title news-headline" style="color: #bfa046; font-weight: 700; line-height: 1.3; margin-bottom: 0.75rem; font-size: 1.1rem;">Noticias Destacadas</h5>
            <p class="card-text news-description flex-grow-1" style="color: #ccc; line-height: 1.5; font-size: 0.9rem; margin-bottom: 1rem;">Mantente informado con las últimas noticias del mundo. Nuestro equipo trabaja para brindarte la información más relevante.</p>
            <div class="mt-auto">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <small class="text-muted" style="color: #888 !important;">
                  <i class="bi bi-clock"></i> Actualizado recientemente
                </small>
              </div>
              <a href="#" class="btn btn-outline-warning btn-sm w-100" style="border-color: #bfa046; color: #bfa046; font-weight: 600; transition: all 0.3s ease;">
                <i class="bi bi-arrow-right"></i> Ver más noticias
              </a>
            </div>
          </div>
        </article>
      </div>
    `;
  }

  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha no disponible';
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  window.simpleRSSLoader = new SimpleRSSLoader();
}); 