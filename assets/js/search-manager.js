// Sistema de búsqueda mejorado
class SearchManager {
  constructor() {
    this.searchIndex = [];
    this.searchTimeout = null;
    this.init();
  }

  init() {
    this.setupSearchInput();
    this.setupSearchResults();
  }

  setupSearchInput() {
    const searchInput = document.getElementById('buscador-global');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      
      // Limpiar timeout anterior
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      // Esperar 300ms antes de buscar (debounce)
      this.searchTimeout = setTimeout(() => {
        if (query.length >= 2) {
          this.performSearch(query);
        } else {
          this.hideSearchResults();
        }
      }, 300);
    });

    // Ocultar resultados al hacer clic fuera
    document.addEventListener('click', (e) => {
      const searchContainer = document.querySelector('.position-relative');
      if (searchContainer && !searchContainer.contains(e.target)) {
        this.hideSearchResults();
      }
    });

    // Navegación con teclado
    searchInput.addEventListener('keydown', (e) => {
      const resultsContainer = document.getElementById('buscador-resultados');
      const activeResults = resultsContainer?.querySelectorAll('.list-group-item');
      
      if (!activeResults || activeResults.length === 0) return;

      const currentActive = resultsContainer.querySelector('.active');
      let currentIndex = currentActive ? Array.from(activeResults).indexOf(currentActive) : -1;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          currentIndex = (currentIndex + 1) % activeResults.length;
          this.setActiveResult(activeResults, currentIndex);
          break;
        case 'ArrowUp':
          e.preventDefault();
          currentIndex = currentIndex <= 0 ? activeResults.length - 1 : currentIndex - 1;
          this.setActiveResult(activeResults, currentIndex);
          break;
        case 'Enter':
          e.preventDefault();
          if (currentActive) {
            const link = currentActive.querySelector('a');
            if (link) {
              window.open(link.href, '_blank');
            }
          }
          this.hideSearchResults();
          break;
        case 'Escape':
          this.hideSearchResults();
          searchInput.blur();
          break;
      }
    });
  }

  setActiveResult(results, index) {
    results.forEach((result, i) => {
      result.classList.toggle('active', i === index);
    });
  }

  setupSearchResults() {
    const resultsContainer = document.getElementById('buscador-resultados');
    if (!resultsContainer) return;

    // Agregar estilos adicionales
    resultsContainer.style.maxHeight = '400px';
    resultsContainer.style.overflowY = 'auto';
  }

  async performSearch(query) {
    try {
      // Buscar en el cache del RSS Manager si está disponible
      let allItems = [];
      
      if (window.rssManager && window.rssManager.cache) {
        window.rssManager.cache.forEach((cached, feedId) => {
          if (cached.data && cached.data.items) {
            allItems.push(...cached.data.items.map(item => ({
              ...item,
              feedInfo: cached.data.feedInfo
            })));
          }
        });
      }

      // Buscar en los artículos de IA (articulos-list.json)
      try {
        const aiRes = await fetch('/articulos-list.json');
        if (aiRes.ok) {
          const aiJson = await aiRes.json();
          if (aiJson.articles && Array.isArray(aiJson.articles)) {
            const aiItems = aiJson.articles.map(a => ({
              title: a.title || 'Artículo IA',
              description: a.description || '',
              link: a.url || '#',
              pubDate: a.date || '',
              feedInfo: { title: 'Artículos IA' },
              imageUrl: a.imageUrl || ''
            }));
            allItems.push(...aiItems);
          }
        }
      } catch (e) {
        // Si falla, simplemente no agrega los artículos IA
      }

      // Si no hay items en cache, cargar algunos feeds básicos
      if (allItems.length === 0) {
        allItems = await this.loadBasicFeeds();
      }

      // Realizar búsqueda
      const results = this.searchItems(allItems, query);
      this.displaySearchResults(results, query);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      this.showSearchError();
    }
  }

  async loadBasicFeeds() {
    const basicFeeds = [
      {
        url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
        title: 'BBC World News'
      },
      {
        url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
        title: 'BBC Technology'
      }
    ];

    const allItems = [];

    for (const feed of basicFeeds) {
      try {
        let xmlContent;
        
        if (feed.url.includes('bbci.co.uk')) {
          try {
            const response = await fetch(feed.url);
            if (response.ok) {
              xmlContent = await response.text();
            } else {
              throw new Error('Fetch directo falló');
            }
          } catch (error) {
            const proxyResponse = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`);
            const data = await proxyResponse.json();
            xmlContent = data.contents;
          }
        } else {
          const proxyResponse = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`);
          const data = await proxyResponse.json();
          xmlContent = data.contents;
        }

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
        
        const items = Array.from(xmlDoc.querySelectorAll('item')).slice(0, 10).map(item => {
          const title = item.querySelector('title')?.textContent || 'Sin título';
          const description = item.querySelector('description')?.textContent || '';
          const link = item.querySelector('link')?.textContent || '#';
          const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();
          
          return {
            title,
            description: this.cleanDescription(description),
            link,
            pubDate,
            feedInfo: { title: feed.title }
          };
        });

        allItems.push(...items);
      } catch (error) {
        console.error(`Error cargando feed para búsqueda: ${feed.title}`, error);
      }
    }

    return allItems;
  }

  searchItems(items, query) {
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    return items
      .map(item => {
        const title = item.title.toLowerCase();
        const description = item.description.toLowerCase();
        const content = `${title} ${description}`;
        
        // Calcular puntuación de relevancia
        let score = 0;
        
        searchTerms.forEach(term => {
          // Puntuación más alta para coincidencias exactas en título
          if (title.includes(term)) {
            score += 10;
          }
          // Puntuación media para coincidencias en descripción
          if (description.includes(term)) {
            score += 5;
          }
          // Puntuación baja para coincidencias parciales
          if (content.includes(term)) {
            score += 2;
          }
        });
        
        return { ...item, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8); // Máximo 8 resultados
  }

  displaySearchResults(results, query) {
    const resultsContainer = document.getElementById('buscador-resultados');
    if (!resultsContainer) return;

    if (results.length === 0) {
      resultsContainer.innerHTML = `
        <div class="list-group-item text-center text-muted">
          <i class="bi bi-search"></i> No se encontraron resultados para "${query}"
        </div>
      `;
    } else {
      resultsContainer.innerHTML = results.map((item, index) => `
        <a href="${item.link}" class="list-group-item list-group-item-action" target="_blank" 
           style="border: none; border-bottom: 1px solid #eee; padding: 12px 16px;">
          <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
              <h6 class="mb-1" style="color: #bfa046; font-weight: 600; font-size: 0.9rem;">
                ${this.highlightQuery(item.title, query)}
              </h6>
              <p class="mb-1" style="color: #666; font-size: 0.8rem; line-height: 1.3;">
                ${this.highlightQuery(this.cleanDescription(item.description), query)}
              </p>
              <small style="color: #999;">
                <i class="bi bi-newspaper"></i> ${item.feedInfo?.title || 'Fuente'}
                <span class="ms-2">
                  <i class="bi bi-clock"></i> ${this.formatDate(item.pubDate)}
                </span>
              </small>
            </div>
            <div class="ms-2">
              <i class="bi bi-arrow-up-right" style="color: #bfa046;"></i>
            </div>
          </div>
        </a>
      `).join('');
    }

    resultsContainer.style.display = 'block';
  }

  highlightQuery(text, query) {
    if (!query) return text;
    
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    let highlightedText = text;
    
    searchTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark style="background-color: #bfa046; color: #111; padding: 1px 3px; border-radius: 2px;">$1</mark>');
    });
    
    return highlightedText;
  }

  cleanDescription(description) {
    if (!description) return '';
    
    // Remover HTML tags
    const cleanText = description.replace(/<[^>]*>/g, '');
    
    // Limitar longitud
    if (cleanText.length > 80) {
      return cleanText.substring(0, 80) + '...';
    }
    
    return cleanText;
  }

  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      
      if (diffInHours < 1) {
        return 'Hace unos minutos';
      } else if (diffInHours < 24) {
        return `Hace ${Math.floor(diffInHours)} horas`;
      } else {
        return date.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short'
        });
      }
    } catch (error) {
      return 'Fecha no disponible';
    }
  }

  showSearchError() {
    const resultsContainer = document.getElementById('buscador-resultados');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = `
      <div class="list-group-item text-center text-danger">
        <i class="bi bi-exclamation-triangle"></i> Error al realizar la búsqueda
      </div>
    `;
    resultsContainer.style.display = 'block';
  }

  hideSearchResults() {
    const resultsContainer = document.getElementById('buscador-resultados');
    if (resultsContainer) {
      resultsContainer.style.display = 'none';
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  window.searchManager = new SearchManager();
}); 