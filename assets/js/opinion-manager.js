// Gestor de sección de opinión para periódico digital
class OpinionManager {
  constructor() {
    this.opinionArticles = [];
    this.init();
  }

  async init() {
    console.log('💭 Iniciando Opinion Manager...');
    this.renderPlaceholder();
    await this.loadOpinionContent();
  }

  renderPlaceholder() {
    const container = document.getElementById('opinion-section');
    if (!container) return;

    container.innerHTML = `
      <div class="opinion-placeholder">
        <div class="opinion-item-skeleton">
          <div class="opinion-author-skeleton"></div>
          <div class="opinion-title-skeleton"></div>
          <div class="opinion-excerpt-skeleton"></div>
        </div>
        <div class="opinion-item-skeleton">
          <div class="opinion-author-skeleton"></div>
          <div class="opinion-title-skeleton"></div>
          <div class="opinion-excerpt-skeleton"></div>
        </div>
      </div>
    `;
  }

  async loadOpinionContent() {
    try {
      // Cargar contenido de opinión desde fuentes especializadas
      const opinionData = await this.fetchOpinionContent();
      this.opinionArticles = this.processOpinionData(opinionData);
      this.renderOpinionSection();
    } catch (error) {
      console.error('Error cargando contenido de opinión:', error);
      this.loadMockOpinionContent();
    }
  }

  async fetchOpinionContent() {
    const opinionFeeds = [
      {
        url: 'https://www.clarin.com/rss/opinion/',
        source: 'Clarín',
        type: 'opinión'
      },
      {
        url: 'https://www.eltiempo.com/rss/opinion.xml',
        source: 'El Tiempo',
        type: 'opinión'
      }
    ];

    const allOpinions = [];

    for (const feed of opinionFeeds) {
      try {
        const opinions = await this.fetchOpinionFeed(feed);
        allOpinions.push(...opinions);
      } catch (error) {
        console.warn(`Error cargando opinión de ${feed.source}:`, error);
      }
    }

    return allOpinions;
  }

  async fetchOpinionFeed(feed) {
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
          
          return Array.from(xmlDoc.querySelectorAll('item')).slice(0, 3).map(item => {
            const title = item.querySelector('title')?.textContent || 'Sin título';
            const description = item.querySelector('description')?.textContent || '';
            const link = item.querySelector('link')?.textContent || '#';
            const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();
            const author = item.querySelector('dc\\:creator')?.textContent || 
                          item.querySelector('author')?.textContent || 
                          'Editorial';
            
            return {
              title: this.cleanTitle(title),
              description: this.cleanDescription(description),
              link,
              pubDate,
              author,
              source: feed.source,
              type: feed.type
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

  processOpinionData(opinions) {
    return opinions
      .filter(opinion => opinion.title.length > 10)
      .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
      .slice(0, 4);
  }

  loadMockOpinionContent() {
    this.opinionArticles = [
      {
        title: 'La importancia de la transparencia en la era digital',
        description: 'En un mundo donde la información fluye constantemente, la transparencia se ha convertido en un pilar fundamental de la democracia moderna...',
        author: 'Dr. María González',
        source: 'Editorial HGARUNA',
        pubDate: new Date().toISOString(),
        type: 'editorial'
      },
      {
        title: 'Reflexiones sobre el futuro del periodismo',
        description: 'El periodismo tradicional se enfrenta a desafíos sin precedentes. La tecnología ha cambiado la forma en que consumimos noticias...',
        author: 'Carlos Rodríguez',
        source: 'Columna de Opinión',
        pubDate: new Date(Date.now() - 86400000).toISOString(),
        type: 'columna'
      },
      {
        title: 'El impacto de las redes sociales en la política',
        description: 'Las plataformas digitales han revolucionado la forma en que los políticos se comunican con sus electores...',
        author: 'Ana Martínez',
        source: 'Análisis Político',
        pubDate: new Date(Date.now() - 172800000).toISOString(),
        type: 'análisis'
      },
      {
        title: 'La economía circular: una solución sostenible',
        description: 'Frente a los desafíos ambientales, la economía circular emerge como una alternativa viable y necesaria...',
        author: 'Prof. Luis Fernández',
        source: 'Perspectiva Económica',
        pubDate: new Date(Date.now() - 259200000).toISOString(),
        type: 'perspectiva'
      }
    ];
    this.renderOpinionSection();
  }

  renderOpinionSection() {
    const container = document.getElementById('opinion-section');
    if (!container || this.opinionArticles.length === 0) return;

    container.innerHTML = `
      <div class="opinion-list">
        ${this.opinionArticles.map((article, index) => `
          <div class="opinion-item ${index === 0 ? 'featured' : ''}" data-index="${index}">
            <div class="opinion-header">
              <div class="opinion-author">
                <i class="bi bi-person-circle"></i>
                <span class="author-name">${article.author}</span>
              </div>
              <div class="opinion-type">
                <span class="type-badge ${article.type}">${this.getTypeLabel(article.type)}</span>
              </div>
            </div>
            <div class="opinion-content">
              <h4 class="opinion-title">${article.title}</h4>
              <p class="opinion-excerpt">${article.description}</p>
            </div>
            <div class="opinion-footer">
              <div class="opinion-meta">
                <span class="opinion-source">${article.source}</span>
                <span class="opinion-date">${this.formatDate(article.pubDate)}</span>
              </div>
              <button class="opinion-read-more" onclick="this.showOpinionDetail(${index})">
                <i class="bi bi-arrow-right"></i>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="opinion-cta">
        <a href="#" class="btn btn-outline-primary btn-sm">
          <i class="bi bi-chat-quote"></i>
          Ver más opiniones
        </a>
      </div>
    `;

    // Agregar eventos de clic
    container.querySelectorAll('.opinion-item').forEach(item => {
      item.addEventListener('click', () => {
        this.showOpinionDetail(parseInt(item.dataset.index));
      });
    });
  }

  showOpinionDetail(index) {
    const article = this.opinionArticles[index];
    if (!article) return;

    // Crear modal con detalles del artículo de opinión
    const modal = document.createElement('div');
    modal.className = 'opinion-modal';
    modal.innerHTML = `
      <div class="opinion-modal-content">
        <div class="opinion-modal-header">
          <div class="opinion-modal-author">
            <i class="bi bi-person-circle"></i>
            <div>
              <h3>${article.author}</h3>
              <span class="opinion-modal-source">${article.source}</span>
            </div>
          </div>
          <button class="opinion-modal-close">&times;</button>
        </div>
        <div class="opinion-modal-body">
          <h2>${article.title}</h2>
          <div class="opinion-modal-meta">
            <span class="type-badge ${article.type}">${this.getTypeLabel(article.type)}</span>
            <span class="opinion-modal-date">${this.formatDate(article.pubDate)}</span>
          </div>
          <div class="opinion-modal-content">
            <p>${article.description}</p>
            <p class="opinion-modal-note">
              <i class="bi bi-info-circle"></i>
              Este es un extracto del artículo completo. Para leer la versión completa, visita la fuente original.
            </p>
          </div>
          <div class="opinion-modal-actions">
            <a href="${article.link}" target="_blank" class="btn btn-primary">
              <i class="bi bi-box-arrow-up-right"></i>
              Leer Artículo Completo
            </a>
            <button class="btn btn-outline-secondary" onclick="this.shareOpinion('${article.title}')">
              <i class="bi bi-share"></i>
              Compartir
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Cerrar modal
    modal.querySelector('.opinion-modal-close').addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  getTypeLabel(type) {
    const labels = {
      'editorial': 'Editorial',
      'columna': 'Columna',
      'análisis': 'Análisis',
      'perspectiva': 'Perspectiva',
      'opinión': 'Opinión'
    };
    return labels[type] || 'Opinión';
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 86400000) return 'Hoy';
    if (diff < 172800000) return 'Ayer';
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} días`;
    
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short'
    });
  }

  shareOpinion(title) {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: 'Artículo de opinión interesante en HGARUNA NEWS',
        url: window.location.href
      });
    } else {
      // Fallback para navegadores que no soportan Web Share API
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(`Artículo de opinión: ${title}`);
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    }
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

  cleanDescription(description) {
    return description
      .replace(/<[^>]*>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .substring(0, 150)
      .trim() + '...';
  }
} 