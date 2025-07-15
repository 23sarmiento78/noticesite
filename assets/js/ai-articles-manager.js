/**
 * AI Articles Manager - Gestiona la carga y visualización de artículos generados por IA
 * Carga dinámicamente los artículos de la carpeta /articulos/ y los muestra en tarjetas
 */
class AIArticlesManager {
  constructor() {
    this.articles = [];
    this.currentPage = 1;
    this.articlesPerPage = 6;
    this.container = null;
    this.loadingElement = null;
    this.loadMoreButton = null;
    this.isLoading = false;
    
    this.init();
  }

  async init() {
    console.log('🤖 Iniciando AIArticlesManager...');
    
    // Crear la sección si no existe
    this.createSection();
    
    // Cargar artículos
    await this.loadArticles();
    
    // Renderizar la primera página
    this.renderArticles();
    
    console.log('✅ AIArticlesManager inicializado');
  }

  createSection() {
    // Buscar si ya existe la sección
    let existingSection = document.getElementById('ai-articles-section');
    
    if (!existingSection) {
      // Crear la sección después de "Noticias Destacadas"
      const destacadasSection = document.querySelector('.news-section');
      
      if (destacadasSection) {
        const newSection = document.createElement('section');
        newSection.className = 'news-section mt-5';
        newSection.id = 'ai-articles-section';
        
        newSection.innerHTML = `
          <h2 class="section-title">
            <i class="bi bi-robot text-primary"></i>
            Artículos Generados por IA
            <span class="ai-badge">
              <i class="bi bi-lightning-charge"></i>
              En Tiempo Real
            </span>
          </h2>
          <p class="section-subtitle">
            Contenido analizado y procesado por inteligencia artificial para brindarte insights únicos
          </p>
          
          <!-- Loading spinner -->
          <div id="ai-articles-loading" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando artículos...</span>
            </div>
            <p class="mt-2 text-muted">Cargando artículos generados por IA...</p>
          </div>
          
          <!-- Container para las tarjetas -->
          <div id="ai-articles-container" class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4" style="display: none;">
            <!-- Las tarjetas se insertarán aquí -->
          </div>
          
          <!-- Botón "Ver más" -->
          <div id="ai-articles-load-more" class="text-center mt-4" style="display: none;">
            <button class="btn btn-outline-primary btn-lg" id="load-more-articles">
              <i class="bi bi-arrow-down-circle"></i>
              Ver Más Artículos
              <span class="articles-count"></span>
            </button>
          </div>
          
          <!-- Mensaje cuando no hay artículos -->
          <div id="ai-articles-empty" class="text-center py-5" style="display: none;">
            <i class="bi bi-robot display-1 text-muted"></i>
            <h4 class="mt-3 text-muted">No hay artículos disponibles</h4>
            <p class="text-muted">Los artículos generados por IA aparecerán aquí automáticamente.</p>
          </div>
        `;
        
        // Insertar después de la sección de noticias destacadas
        destacadasSection.parentNode.insertBefore(newSection, destacadasSection.nextSibling);
      }
    }
    
    // Obtener referencias a los elementos
    this.container = document.getElementById('ai-articles-container');
    this.loadingElement = document.getElementById('ai-articles-loading');
    this.loadMoreButton = document.getElementById('load-more-articles');
    
    // Configurar evento del botón "Ver más"
    if (this.loadMoreButton) {
      this.loadMoreButton.addEventListener('click', () => this.loadMore());
    }
  }

  async loadArticles() {
    try {
      this.isLoading = true;
      this.showLoading(true);
      
      console.log('📂 Cargando artículos de IA...');
      
      // Obtener la lista de archivos HTML de la carpeta articulos
      const response = await fetch('/articulos/');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const html = await response.text();
      
      // Extraer nombres de archivos HTML usando regex
      const fileRegex = /href="([^"]*\.html)"/g;
      const files = [];
      let match;
      
      while ((match = fileRegex.exec(html)) !== null) {
        const fileName = match[1];
        if (fileName && !fileName.includes('index.html')) {
          files.push(fileName);
        }
      }
      
      console.log(`📄 Encontrados ${files.length} archivos HTML`);
      
      // Procesar cada archivo para extraer metadatos
      this.articles = [];
      
      for (const fileName of files) {
        try {
          const articleData = await this.extractArticleMetadata(fileName);
          if (articleData) {
            this.articles.push(articleData);
          }
        } catch (error) {
          console.warn(`⚠️ Error procesando ${fileName}:`, error.message);
        }
      }
      
      // Ordenar por fecha (más recientes primero)
      this.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      console.log(`✅ ${this.articles.length} artículos cargados exitosamente`);
      
    } catch (error) {
      console.error('❌ Error cargando artículos:', error);
      this.showError('Error al cargar los artículos. Inténtalo de nuevo más tarde.');
    } finally {
      this.isLoading = false;
      this.showLoading(false);
    }
  }

  async extractArticleMetadata(fileName) {
    try {
      const response = await fetch(`/articulos/${fileName}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const html = await response.text();
      
      // Extraer metadatos usando regex
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const descriptionMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
      const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
      const ogTitleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i);
      
      // Extraer fecha del nombre del archivo
      const dateMatch = fileName.match(/(\d{4})-(\d{2})-(\d{2})/);
      let date = new Date();
      
      if (dateMatch) {
        date = new Date(dateMatch[1], dateMatch[2] - 1, dateMatch[3]);
      }
      
      // Extraer título del contenido HTML si no está en meta tags
      let title = ogTitleMatch ? ogTitleMatch[1] : 
                  titleMatch ? titleMatch[1] : 
                  fileName.replace(/\.html$/, '').replace(/-/g, ' ');
      
      // Limpiar título
      title = title.replace(/HGARUNA NEWS - Tu Periódico Digital/, '').trim();
      
      return {
        fileName,
        title: title || 'Artículo Generado por IA',
        description: descriptionMatch ? descriptionMatch[1] : 'Artículo analizado y procesado por inteligencia artificial.',
        imageUrl: ogImageMatch ? ogImageMatch[1] : '/assets/img/ai-article-default.jpg',
        url: `/articulos/${fileName}`,
        date,
        isAI: true
      };
      
    } catch (error) {
      console.warn(`⚠️ Error extrayendo metadatos de ${fileName}:`, error.message);
      return null;
    }
  }

  renderArticles() {
    if (!this.container) return;
    
    const startIndex = (this.currentPage - 1) * this.articlesPerPage;
    const endIndex = startIndex + this.articlesPerPage;
    const articlesToShow = this.articles.slice(startIndex, endIndex);
    
    if (this.articles.length === 0) {
      this.showEmpty();
      return;
    }
    
    // Limpiar contenedor
    this.container.innerHTML = '';
    
    // Renderizar tarjetas
    articlesToShow.forEach(article => {
      const card = this.createArticleCard(article);
      this.container.appendChild(card);
    });
    
    // Mostrar contenedor
    this.container.style.display = 'flex';
    
    // Configurar botón "Ver más"
    this.updateLoadMoreButton();
    
    // Ocultar loading y empty
    this.showLoading(false);
    this.showEmpty(false);
  }

  createArticleCard(article) {
    const card = document.createElement('div');
    card.className = 'col';
    
    const date = article.date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    card.innerHTML = `
      <div class="ai-article-card">
        <div class="ai-article-image">
          <img src="${article.imageUrl}" alt="${article.title}" 
               onerror="this.src='/assets/img/ai-article-default.jpg'">
          <div class="ai-badge-overlay">
            <i class="bi bi-robot"></i>
            IA
          </div>
        </div>
        <div class="ai-article-content">
          <div class="ai-article-meta">
            <span class="ai-article-date">
              <i class="bi bi-calendar3"></i>
              ${date}
            </span>
            <span class="ai-article-type">
              <i class="bi bi-lightning-charge"></i>
              Generado por IA
            </span>
          </div>
          <h3 class="ai-article-title">
            <a href="${article.url}" target="_blank">
              ${article.title}
            </a>
          </h3>
          <p class="ai-article-description">
            ${article.description}
          </p>
          <div class="ai-article-footer">
            <a href="${article.url}" class="btn btn-primary btn-sm" target="_blank">
              <i class="bi bi-arrow-right"></i>
              Leer Artículo
            </a>
            <div class="ai-article-stats">
              <span class="ai-stat">
                <i class="bi bi-eye"></i>
                Análisis IA
              </span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    return card;
  }

  updateLoadMoreButton() {
    const loadMoreContainer = document.getElementById('ai-articles-load-more');
    const countSpan = loadMoreContainer?.querySelector('.articles-count');
    
    if (!loadMoreContainer) return;
    
    const totalArticles = this.articles.length;
    const shownArticles = this.currentPage * this.articlesPerPage;
    const remainingArticles = totalArticles - shownArticles;
    
    if (remainingArticles > 0) {
      loadMoreContainer.style.display = 'block';
      if (countSpan) {
        countSpan.textContent = ` (${remainingArticles} más)`;
      }
    } else {
      loadMoreContainer.style.display = 'none';
    }
  }

  loadMore() {
    if (this.isLoading) return;
    
    this.currentPage++;
    this.renderArticles();
    
    // Scroll suave hacia las nuevas tarjetas
    const newCards = this.container.querySelectorAll('.ai-article-card');
    if (newCards.length > 0) {
      newCards[0].scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }

  showLoading(show) {
    if (this.loadingElement) {
      this.loadingElement.style.display = show ? 'block' : 'none';
    }
  }

  showEmpty(show = true) {
    const emptyElement = document.getElementById('ai-articles-empty');
    if (emptyElement) {
      emptyElement.style.display = show ? 'block' : 'none';
    }
  }

  showError(message) {
    const errorElement = document.getElementById('ai-articles-error');
    if (!errorElement) {
      const errorDiv = document.createElement('div');
      errorDiv.id = 'ai-articles-error';
      errorDiv.className = 'alert alert-danger text-center mt-3';
      errorDiv.innerHTML = `
        <i class="bi bi-exclamation-triangle"></i>
        ${message}
      `;
      
      const section = document.getElementById('ai-articles-section');
      if (section) {
        section.appendChild(errorDiv);
      }
    } else {
      errorElement.innerHTML = `
        <i class="bi bi-exclamation-triangle"></i>
        ${message}
      `;
      errorElement.style.display = 'block';
    }
  }

  // Método para recargar artículos (útil para actualizaciones)
  async refresh() {
    console.log('🔄 Actualizando artículos de IA...');
    this.currentPage = 1;
    await this.loadArticles();
    this.renderArticles();
  }
}

// Auto-inicialización cuando el DOM esté listo
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Pequeño delay para asegurar que otros managers se carguen primero
    setTimeout(() => {
      if (typeof AIArticlesManager !== 'undefined') {
        window.aiArticlesManager = new AIArticlesManager();
      }
    }, 2000);
  });
} 