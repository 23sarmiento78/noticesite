// Gestor de trending topics para periódico digital
class TrendingManager {
  constructor() {
    this.trendingTopics = [];
    this.init();
  }

  async init() {
    console.log('📈 Iniciando Trending Manager...');
    this.renderPlaceholder();
    await this.loadTrendingTopics();
    this.setupAutoRefresh();
  }

  renderPlaceholder() {
    const container = document.getElementById('trending-topics');
    if (!container) return;

    container.innerHTML = `
      <div class="trending-placeholder">
        <div class="trending-item-skeleton">
          <div class="trending-number-skeleton"></div>
          <div class="trending-text-skeleton"></div>
        </div>
        <div class="trending-item-skeleton">
          <div class="trending-number-skeleton"></div>
          <div class="trending-text-skeleton"></div>
        </div>
        <div class="trending-item-skeleton">
          <div class="trending-number-skeleton"></div>
          <div class="trending-text-skeleton"></div>
        </div>
        <div class="trending-item-skeleton">
          <div class="trending-number-skeleton"></div>
          <div class="trending-text-skeleton"></div>
        </div>
        <div class="trending-item-skeleton">
          <div class="trending-number-skeleton"></div>
          <div class="trending-text-skeleton"></div>
        </div>
      </div>
    `;
  }

  async loadTrendingTopics() {
    try {
      // Por ahora, cargar directamente los datos mock para que funcione
      console.log('📈 Cargando trending topics mock...');
      this.loadMockTrendingTopics();
      
      // En el futuro, aquí se puede implementar el análisis real
      // const trendingData = await this.analyzeNewsTrends();
      // this.trendingTopics = this.processTrendingData(trendingData);
      // this.renderTrendingTopics();
    } catch (error) {
      console.error('Error cargando trending topics:', error);
      this.loadMockTrendingTopics();
    }
  }

  async analyzeNewsTrends() {
    const feeds = [
      'https://feeds.bbci.co.uk/news/rss.xml',
      'https://www.clarin.com/rss/ultimas/',
      'https://www.eltiempo.com/rss/ultimas_noticias.xml'
    ];

    const allTitles = [];

    for (const feedUrl of feeds) {
      try {
        const titles = await this.fetchNewsTitles(feedUrl);
        allTitles.push(...titles);
      } catch (error) {
        console.warn('Error analizando feed:', error);
      }
    }

    return this.extractTrendingKeywords(allTitles);
  }

  async fetchNewsTitles(feedUrl) {
    const proxies = [
      'https://api.allorigins.win/get?url=',
      'https://thingproxy.freeboard.io/fetch/',
      'https://corsproxy.io/?'
    ];

    for (const proxy of proxies) {
      try {
        const response = await fetch(`${proxy}${encodeURIComponent(feedUrl)}`);
        const data = await response.json();
        const xmlContent = data.contents || data.data || data;

        if (xmlContent) {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
          
          return Array.from(xmlDoc.querySelectorAll('item')).map(item => {
            return item.querySelector('title')?.textContent || '';
          });
        }
      } catch (error) {
        continue;
      }
    }

    return [];
  }

  extractTrendingKeywords(titles) {
    const wordCount = {};
    const stopWords = new Set([
      'el', 'la', 'de', 'del', 'y', 'a', 'en', 'un', 'una', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'al', 'como', 'pero', 'sus', 'me', 'hasta', 'hay', 'donde', 'han', 'quien', 'están', 'estado', 'desde', 'todo', 'nos', 'durante', 'todos', 'uno', 'les', 'ni', 'contra', 'otros', 'ese', 'eso', 'ante', 'ellos', 'e', 'esto', 'mí', 'antes', 'algunos', 'qué', 'unos', 'yo', 'otro', 'otras', 'otra', 'él', 'tanto', 'esa', 'estos', 'mucho', 'quienes', 'nada', 'muchos', 'cual', 'poco', 'ella', 'estar', 'estas', 'algunas', 'algo', 'nosotros'
    ]);

    titles.forEach(title => {
      const words = title.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.has(word));

      words.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
      });
    });

    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([word, count]) => ({ word, count }));
  }

  processTrendingData(keywords) {
    const trendingCategories = {
      'política': ['gobierno', 'presidente', 'ministro', 'elecciones', 'congreso', 'senado'],
      'economía': ['mercado', 'dólar', 'peso', 'inflación', 'economía', 'finanzas'],
      'deportes': ['fútbol', 'liga', 'campeonato', 'jugador', 'equipo', 'gol'],
      'tecnología': ['tecnología', 'digital', 'internet', 'app', 'software', 'innovación'],
      'cultura': ['cine', 'película', 'música', 'arte', 'literatura', 'teatro']
    };

    const categorizedTrends = {};

    keywords.forEach(({ word, count }) => {
      for (const [category, categoryWords] of Object.entries(trendingCategories)) {
        if (categoryWords.some(catWord => word.includes(catWord) || catWord.includes(word))) {
          if (!categorizedTrends[category]) {
            categorizedTrends[category] = [];
          }
          categorizedTrends[category].push({ word, count });
          break;
        }
      }
    });

    // Crear lista final de trending topics
    const finalTrends = [];
    Object.entries(categorizedTrends).forEach(([category, trends]) => {
      trends.slice(0, 2).forEach((trend, index) => {
        finalTrends.push({
          ...trend,
          category,
          rank: finalTrends.length + 1,
          icon: this.getCategoryIcon(category)
        });
      });
    });

    return finalTrends.slice(0, 10);
  }

  getCategoryIcon(category) {
    const icons = {
      'política': 'bi-flag',
      'economía': 'bi-graph-up',
      'deportes': 'bi-trophy',
      'tecnología': 'bi-cpu',
      'cultura': 'bi-palette'
    };
    return icons[category] || 'bi-trending-up';
  }

  loadMockTrendingTopics() {
    console.log('📈 Cargando datos mock de trending topics...');
    this.trendingTopics = [
      { word: 'Elecciones 2024', count: 45, category: 'política', rank: 1, icon: 'bi-flag' },
      { word: 'Dólar Blue', count: 38, category: 'economía', rank: 2, icon: 'bi-graph-up' },
      { word: 'Liga Profesional', count: 32, category: 'deportes', rank: 3, icon: 'bi-trophy' },
      { word: 'Inteligencia Artificial', count: 28, category: 'tecnología', rank: 4, icon: 'bi-cpu' },
      { word: 'Oscars 2024', count: 25, category: 'cultura', rank: 5, icon: 'bi-palette' },
      { word: 'Inflación', count: 22, category: 'economía', rank: 6, icon: 'bi-graph-up' },
      { word: 'Cambio Climático', count: 20, category: 'política', rank: 7, icon: 'bi-flag' },
      { word: 'Champions League', count: 18, category: 'deportes', rank: 8, icon: 'bi-trophy' },
      { word: 'Metaverso', count: 15, category: 'tecnología', rank: 9, icon: 'bi-cpu' },
      { word: 'Festival de Cannes', count: 12, category: 'cultura', rank: 10, icon: 'bi-palette' }
    ];
    console.log('📈 Datos mock cargados:', this.trendingTopics.length, 'topics');
    this.renderTrendingTopics();
  }

  renderTrendingTopics() {
    const container = document.getElementById('trending-topics');
    console.log('📈 Renderizando trending topics...', {
      container: !!container,
      topicsCount: this.trendingTopics.length
    });
    
    if (!container || this.trendingTopics.length === 0) {
      console.log('📈 No se puede renderizar: container o topics vacíos');
      return;
    }

    container.innerHTML = `
      <div class="trending-list">
        ${this.trendingTopics.map(topic => `
          <div class="trending-item" data-category="${topic.category}">
            <div class="trending-rank">
              <span class="rank-number">${topic.rank}</span>
            </div>
            <div class="trending-content">
              <div class="trending-topic">
                <i class="bi ${topic.icon} trending-icon"></i>
                <span class="trending-word">${topic.word}</span>
              </div>
              <div class="trending-meta">
                <span class="trending-category">${topic.category}</span>
                <span class="trending-count">${topic.count} menciones</span>
              </div>
            </div>
            <div class="trending-arrow">
              <i class="bi bi-arrow-up-right"></i>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="trending-footer">
        <small class="text-muted">
          <i class="bi bi-clock"></i>
          Actualizado hace 5 minutos
        </small>
      </div>
    `;

    // Agregar eventos de clic
    container.querySelectorAll('.trending-item').forEach(item => {
      item.addEventListener('click', () => {
        this.searchTrendingTopic(item.querySelector('.trending-word').textContent);
      });
    });
  }

  searchTrendingTopic(topic) {
    const searchInput = document.getElementById('buscador-global');
    if (searchInput) {
      searchInput.value = topic;
      searchInput.dispatchEvent(new Event('input'));
      searchInput.focus();
    }
  }

  setupAutoRefresh() {
    // Actualizar trending topics cada 15 minutos
    setInterval(() => {
      this.loadTrendingTopics();
    }, 15 * 60 * 1000);
  }
} 