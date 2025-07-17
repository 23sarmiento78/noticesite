// Generador de URLs canónicas para noticias individuales
class NewsURLGenerator {
  constructor() {
    this.baseUrl = 'https://news.hgaruna.org';
    this.newsCache = new Map();
    this.init();
  }

  init() {
    // Solo ejecutar en la página principal
    if (window.location.pathname === '/index.html' || window.location.pathname === '/') {
      this.setupNewsURLs();
    }
  }

  async setupNewsURLs() {
    // Esperar a que el RSS Manager cargue los feeds
    if (window.rssManager) {
      await this.waitForRSSManager();
      this.generateNewsURLs();
    }
  }

  async waitForRSSManager() {
    return new Promise((resolve) => {
      const checkRSS = () => {
        if (window.rssManager && window.rssManager.cache.size > 0) {
          resolve();
        } else {
          setTimeout(checkRSS, 1000);
        }
      };
      checkRSS();
    });
  }

  generateNewsURLs() {
    console.log('🔄 Generando URLs canónicas para noticias...');
    
    if (window.rssManager && window.rssManager.cache) {
      window.rssManager.cache.forEach((cached, feedId) => {
        if (cached.data && cached.data.items) {
          cached.data.items.forEach(item => {
            const newsUrl = this.createNewsURL(item, cached.data.feedInfo);
            this.newsCache.set(item.link, {
              url: newsUrl,
              title: item.title,
              category: cached.data.feedInfo?.categoria || 'Noticias',
              date: item.pubDate,
              source: cached.data.feedInfo?.fuente || 'Fuente'
            });
          });
        }
      });
    }

    // Actualizar enlaces en las tarjetas de noticias
    this.updateNewsLinks();
    
    console.log(`✅ Generadas ${this.newsCache.size} URLs canónicas`);
  }

  createNewsURL(item, feedInfo) {
    const slug = this.createSlug(item.title);
    const category = feedInfo?.categoria?.toLowerCase() || 'noticias';
    const date = new Date(item.pubDate || Date.now());
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    return `${this.baseUrl}/noticia/${category}/${dateStr}/${slug}.html`;
  }

  createSlug(title) {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 100); // Limitar longitud
  }

  updateNewsLinks() {
    // Actualizar enlaces en todas las tarjetas de noticias
    const newsCards = document.querySelectorAll('.news-card a[target="_blank"]');
    
    newsCards.forEach(card => {
      const originalUrl = card.href;
      const newsData = this.newsCache.get(originalUrl);
      
      if (newsData) {
        // Cambiar el enlace a la URL canónica
        card.href = newsData.url;
        
        // Agregar atributos SEO
        card.setAttribute('rel', 'internal');
        card.setAttribute('data-category', newsData.category);
        card.setAttribute('data-source', newsData.source);
        
        // Agregar evento para tracking
        card.addEventListener('click', (e) => {
          this.trackNewsClick(newsData);
        });
      }
    });
  }

  trackNewsClick(newsData) {
    // Tracking de clicks para analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'click', {
        'event_category': 'News',
        'event_label': newsData.category,
        'value': 1
      });
    }
    
    console.log(`📊 Click en noticia: ${newsData.title} (${newsData.category})`);
  }

  // Método para generar página individual de noticia
  generateNewsPage(newsData) {
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${newsData.title} | HGARUNA News</title>
    <meta name="description" content="${this.cleanDescription(newsData.description)}">
    <meta name="keywords" content="${newsData.category.toLowerCase()}, noticias, ${newsData.source.toLowerCase()}">
    <meta name="author" content="HGARUNA News">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${newsData.title}">
    <meta property="og:description" content="${this.cleanDescription(newsData.description)}">
    <meta property="og:url" content="${newsData.url}">
    <meta property="og:type" content="article">
    <meta property="og:image" content="${newsData.image || 'https://news.hgaruna.org/assets/img/logo3.png'}">
    <meta property="og:site_name" content="HGARUNA News">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${newsData.title}">
    <meta name="twitter:description" content="${this.cleanDescription(newsData.description)}">
    <meta name="twitter:image" content="${newsData.image || 'https://news.hgaruna.org/assets/img/logo3.png'}">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${newsData.url}">
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": "${newsData.title}",
      "description": "${this.cleanDescription(newsData.description)}",
      "image": "${newsData.image || 'https://news.hgaruna.org/assets/img/logo3.png'}",
      "author": {
        "@type": "Organization",
        "name": "HGARUNA News"
      },
      "publisher": {
        "@type": "Organization",
        "name": "HGARUNA News",
        "logo": {
          "@type": "ImageObject",
          "url": "https://news.hgaruna.org/assets/img/logo3.png"
        }
      },
      "datePublished": "${newsData.date}",
      "dateModified": "${newsData.date}",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "${newsData.url}"
      }
    }
    </script>
    
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="/main.css">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:400,500,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">
</head>
<body style="background: #111; color: #fff;">
    <header class="main-header py-4" style="background: #181818; border-bottom: 2px solid #bfa046;">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-md-8">
                    <h1 class="display-4" style="color: #bfa046;">
                        <i class="bi bi-newspaper icono-dorado"></i>HGARUNA News
                    </h1>
                    <p class="lead" style="color: #fff;">Tu fuente confiable de noticias internacionales</p>
                </div>
                <div class="col-md-4 text-md-end">
                    <a href="/" class="btn btn-outline-warning">
                        <i class="bi bi-house"></i> Volver al Inicio
                    </a>
                </div>
            </div>
        </div>
    </header>

    <nav class="navbar navbar-expand-lg" style="background: #111; border-bottom: 2px solid #bfa046;">
        <div class="container">
            <a class="navbar-brand" href="/">
                <img src="/assets/img/logo3.png" style="width: 80px; height: auto;" alt="Logo de HGARUNA">
                <span style="font-size: 24px; font-family: 'Poppins-Medium', sans-serif; color: white;">HGARUNA</span>
            </a>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ml-auto">
                    <li class="nav-item"><a class="nav-link" href="/">Inicio |</a></li>
                    <li class="nav-item"><a class="nav-link" href="/deportes.html">Deportes |</a></li>
                    <li class="nav-item"><a class="nav-link" href="/tecnologia.html">Tecnología |</a></li>
                    <li class="nav-item"><a class="nav-link" href="/cultura.html">Cultura |</a></li>
                    <li class="nav-item"><a class="nav-link" href="/autos.html">Motores |</a></li>
                    <li class="nav-item"><a class="nav-link" href="/ultimo.html">Lo Último |</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <main class="container mt-5">
        <nav aria-label="breadcrumb">
            <ol class="breadcrumb" style="background: transparent; color: #bfa046;">
                <li class="breadcrumb-item"><a href="/" style="color: #bfa046;">Inicio</a></li>
                <li class="breadcrumb-item"><a href="/${newsData.category.toLowerCase()}.html" style="color: #bfa046;">${newsData.category}</a></li>
                <li class="breadcrumb-item active" aria-current="page" style="color: #fff;">${newsData.title.substring(0, 50)}...</li>
            </ol>
        </nav>

        <article class="news-article">
            <header class="article-header mb-4">
                <div class="row">
                    <div class="col-md-8">
                        <h1 class="article-title" style="color: #bfa046; font-size: 2.5rem; font-weight: 700; line-height: 1.2;">
                            ${newsData.title}
                        </h1>
                        <div class="article-meta" style="color: #888; margin-top: 1rem;">
                            <span class="badge bg-warning text-dark me-2">${newsData.category}</span>
                            <span class="badge bg-secondary me-2">${newsData.source}</span>
                            <small>
                                <i class="bi bi-clock"></i> 
                                ${new Date(newsData.date).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </small>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <img src="${newsData.image || 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=600&fit=crop'}" 
                             alt="${newsData.title}" 
                             class="img-fluid rounded" 
                             style="max-height: 300px; object-fit: cover;">
                    </div>
                </div>
            </header>

            <div class="article-content">
                <div class="row">
                    <div class="col-md-8">
                        <div class="article-body" style="line-height: 1.8; font-size: 1.1rem;">
                            <p>${this.cleanDescription(newsData.description)}</p>
                            <p class="text-muted">
                                <em>Para leer la noticia completa, visita la fuente original:</em>
                            </p>
                            <a href="${newsData.originalUrl}" 
                               class="btn btn-warning btn-lg" 
                               target="_blank" 
                               rel="external nofollow"
                               style="background: #bfa046; border: none; font-weight: 600;">
                                <i class="bi bi-external-link"></i> Leer en ${newsData.source}
                            </a>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="article-sidebar">
                            <div class="card" style="background: #181818; border: 1px solid #bfa046;">
                                <div class="card-body">
                                    <h5 class="card-title" style="color: #bfa046;">Noticias Relacionadas</h5>
                                    <div id="related-news">
                                        <!-- Las noticias relacionadas se cargarán aquí -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    </main>

    <footer class="footer text-white py-5" style="background: #111; border-top: 2px solid #bfa046; margin-top: 4rem;">
        <div class="container">
            <div class="row">
                <div class="col-md-6">
                    <h5 style="color: #bfa046;">HGARUNA News</h5>
                    <p style="color: #ccc;">Tu fuente confiable de noticias internacionales</p>
                </div>
                <div class="col-md-6 text-md-end">
                    <p style="color: #ccc;">&copy; 2024 HGARUNA. Todos los derechos reservados.</p>
                </div>
            </div>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Cargar noticias relacionadas
        document.addEventListener('DOMContentLoaded', function() {
            // Aquí se cargarían noticias relacionadas de la misma categoría
            console.log('Página de noticia cargada:', '${newsData.title}');
        });
    </script>
</body>
</html>`;

    return html;
  }

  cleanDescription(description) {
    if (!description) return 'Sin descripción disponible.';
    
    const cleanText = description.replace(/<[^>]*>/g, '');
    
    if (cleanText.length > 300) {
      return cleanText.substring(0, 300) + '...';
    }
    
    return cleanText;
  }

  // Método para obtener URL canónica de una noticia
  getNewsURL(originalUrl) {
    return this.newsCache.get(originalUrl)?.url || originalUrl;
  }

  // Método para obtener datos de una noticia
  getNewsData(originalUrl) {
    return this.newsCache.get(originalUrl);
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  window.newsURLGenerator = new NewsURLGenerator();
}); 