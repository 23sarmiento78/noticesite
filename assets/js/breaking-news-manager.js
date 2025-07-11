// Gestor de noticias de última hora para periódico digital
class BreakingNewsManager {
  constructor() {
    this.breakingNews = [];
    this.currentIndex = 0;
    this.autoScrollInterval = null;
    this.init();
  }

  async init() {
    console.log('⚡ Iniciando Breaking News Manager...');
    this.renderPlaceholder();
    await this.loadBreakingNews();
    this.startAutoScroll();
  }

  renderPlaceholder() {
    const container = document.getElementById('breaking-news-content');
    if (!container) return;

    container.innerHTML = `
      <div class="breaking-news-placeholder">
        <div class="breaking-item-skeleton">
          <div class="breaking-badge-skeleton"></div>
          <div class="breaking-text-skeleton"></div>
        </div>
        <div class="breaking-item-skeleton">
          <div class="breaking-badge-skeleton"></div>
          <div class="breaking-text-skeleton"></div>
        </div>
        <div class="breaking-item-skeleton">
          <div class="breaking-badge-skeleton"></div>
          <div class="breaking-text-skeleton"></div>
        </div>
      </div>
    `;
  }

  async loadBreakingNews() {
    try {
      // Cargar noticias de última hora desde múltiples fuentes
      const breakingFeeds = [
        {
          url: 'https://feeds.bbci.co.uk/news/rss.xml',
          source: 'BBC News',
          priority: 3
        },
        {
          url: 'https://www.clarin.com/rss/ultimas/',
          source: 'Clarín',
          priority: 2
        },
        {
          url: 'https://www.eltiempo.com/rss/ultimas_noticias.xml',
          source: 'El Tiempo',
          priority: 1
        }
      ];

      const allBreakingNews = [];

      for (const feed of breakingFeeds) {
        try {
          const news = await this.fetchBreakingNews(feed);
          allBreakingNews.push(...news);
        } catch (error) {
          console.warn(`Error cargando breaking news de ${feed.source}:`, error);
        }
      }

      // Filtrar y ordenar noticias importantes
      this.breakingNews = this.filterImportantNews(allBreakingNews);
      this.renderBreakingNews();
    } catch (error) {
      console.error('Error cargando breaking news:', error);
      this.loadMockBreakingNews();
    }
  }

  async fetchBreakingNews(feed) {
    const proxies = [
      'https://api.allorigins.win/get?url=',
      'https://thingproxy.freeboard.io/fetch/',
      'https://corsproxy.io/?'
    ];

    for (const proxy of proxies) {
      try {
        const response = await fetch(`${proxy}${encodeURIComponent(feed.url)}`);
        const data = await response.json();
        const xmlContent = data.contents || data.data || data;

        if (xmlContent) {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
          
          return Array.from(xmlDoc.querySelectorAll('item')).slice(0, 5).map(item => {
            const title = item.querySelector('title')?.textContent || 'Sin título';
            const link = item.querySelector('link')?.textContent || '#';
            const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();
            
            return {
              title: this.cleanTitle(title),
              link,
              pubDate,
              source: feed.source,
              priority: feed.priority
            };
          });
        }
      } catch (error) {
        console.warn(`Proxy falló para ${feed.source}:`, error);
        continue;
      }
    }

    return [];
  }

  filterImportantNews(news) {
    const importantKeywords = [
      'urgente', 'breaking', 'última hora', 'importante', 'crítico',
      'emergencia', 'crisis', 'anuncio', 'declaración', 'elecciones',
      'presidente', 'ministro', 'gobierno', 'economía', 'mercado'
    ];

    return news
      .filter(item => {
        const title = item.title.toLowerCase();
        return importantKeywords.some(keyword => title.includes(keyword)) ||
               item.priority === 3; // BBC siempre es importante
      })
      .sort((a, b) => {
        // Ordenar por prioridad y fecha
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        return new Date(b.pubDate) - new Date(a.pubDate);
      })
      .slice(0, 8);
  }

  loadMockBreakingNews() {
    this.breakingNews = [
      {
        title: 'URGENTE: Nuevas medidas económicas anunciadas por el gobierno',
        source: 'Clarín',
        priority: 3,
        pubDate: new Date().toISOString()
      },
      {
        title: 'Breaking: Importante avance en negociaciones internacionales',
        source: 'BBC News',
        priority: 3,
        pubDate: new Date().toISOString()
      },
      {
        title: 'ÚLTIMA HORA: Resultados de las elecciones en tiempo real',
        source: 'El Tiempo',
        priority: 2,
        pubDate: new Date().toISOString()
      },
      {
        title: 'CRÍTICO: Análisis del impacto en los mercados financieros',
        source: 'Clarín',
        priority: 2,
        pubDate: new Date().toISOString()
      },
      {
        title: 'EMERGENCIA: Actualización sobre situación climática',
        source: 'BBC News',
        priority: 1,
        pubDate: new Date().toISOString()
      }
    ];
    this.renderBreakingNews();
  }

  renderBreakingNews() {
    const container = document.getElementById('breaking-news-content');
    if (!container || this.breakingNews.length === 0) return;

    container.innerHTML = `
      <div class="breaking-news-scroll">
        ${this.breakingNews.map((news, index) => `
          <div class="breaking-news-item ${index === 0 ? 'active' : ''}" data-index="${index}">
            <div class="breaking-badge">
              <i class="bi bi-lightning-charge-fill"></i>
              ${news.source}
            </div>
            <div class="breaking-text">
              <a href="${news.link}" target="_blank" class="breaking-link">
                ${news.title}
              </a>
            </div>
            <div class="breaking-time">
              ${this.formatTime(news.pubDate)}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Agregar eventos de clic
    container.querySelectorAll('.breaking-news-item').forEach(item => {
      item.addEventListener('click', () => {
        this.showNewsDetail(item.dataset.index);
      });
    });
  }

  showNewsDetail(index) {
    const news = this.breakingNews[index];
    if (!news) return;

    // Crear modal con detalles de la noticia
    const modal = document.createElement('div');
    modal.className = 'breaking-news-modal';
    modal.innerHTML = `
      <div class="breaking-modal-content">
        <div class="breaking-modal-header">
          <h3>${news.source}</h3>
          <button class="breaking-modal-close">&times;</button>
        </div>
        <div class="breaking-modal-body">
          <h4>${news.title}</h4>
          <p class="breaking-modal-time">${this.formatTime(news.pubDate)}</p>
          <div class="breaking-modal-actions">
            <a href="${news.link}" target="_blank" class="btn btn-primary">
              <i class="bi bi-box-arrow-up-right"></i>
              Leer Completo
            </a>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Cerrar modal
    modal.querySelector('.breaking-modal-close').addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  startAutoScroll() {
    if (this.breakingNews.length <= 1) return;

    this.autoScrollInterval = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.breakingNews.length;
      this.updateActiveNews();
    }, 5000); // Cambiar cada 5 segundos
  }

  updateActiveNews() {
    const items = document.querySelectorAll('.breaking-news-item');
    items.forEach((item, index) => {
      item.classList.toggle('active', index === this.currentIndex);
    });
  }

  cleanTitle(title) {
    return title
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Ahora';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
} 