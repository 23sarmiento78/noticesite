// Optimizador de SEO para mejorar posicionamiento
class SEOOptimizer {
  constructor() {
    this.currentPage = this.detectCurrentPage();
    this.init();
  }

  detectCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('deportes')) return 'deportes';
    if (path.includes('tecnologia')) return 'tecnologia';
    if (path.includes('cultura')) return 'cultura';
    if (path.includes('autos')) return 'autos';
    if (path.includes('ultimo')) return 'ultimo';
    return 'home';
  }

  init() {
    this.optimizeMetaTags();
    this.addStructuredData();
    this.optimizeImages();
    this.addBreadcrumbs();
    this.optimizeInternalLinking();
  }

  optimizeMetaTags() {
    const pageConfig = this.getPageConfig();
    
    // Actualizar título dinámicamente
    this.updateMetaTag('title', pageConfig.title);
    
    // Actualizar meta description
    this.updateMetaTag('meta[name="description"]', pageConfig.description);
    
    // Actualizar Open Graph tags
    this.updateMetaTag('meta[property="og:title"]', pageConfig.title);
    this.updateMetaTag('meta[property="og:description"]', pageConfig.description);
    this.updateMetaTag('meta[property="og:url"]', window.location.href);
    this.updateMetaTag('meta[property="og:type"]', 'website');
    
    // Actualizar Twitter Card tags
    this.updateMetaTag('meta[name="twitter:card"]', 'summary_large_image');
    this.updateMetaTag('meta[name="twitter:title"]', pageConfig.title);
    this.updateMetaTag('meta[name="twitter:description"]', pageConfig.description);
    
    // Agregar meta tags adicionales
    this.addAdditionalMetaTags(pageConfig);
  }

  getPageConfig() {
    const configs = {
      home: {
        title: 'HGARUNA News - Últimas Noticias Internacionales | Deportes, Tecnología, Cultura',
        description: 'Mantente informado con las últimas noticias internacionales. Cobertura completa de deportes, tecnología, cultura y más. Actualizado 24/7.',
        keywords: 'noticias, deportes, tecnología, cultura, internacional, BBC, El País, Clarín',
        category: 'Noticias Generales'
      },
      deportes: {
        title: 'Noticias de Deportes - Fútbol, NBA, MLB, NFL | HGARUNA News',
        description: 'Las últimas noticias de deportes: fútbol, NBA, MLB, NFL, tenis y más. Cobertura completa de eventos deportivos internacionales.',
        keywords: 'deportes, fútbol, NBA, MLB, NFL, tenis, noticias deportivas',
        category: 'Deportes'
      },
      tecnologia: {
        title: 'Noticias de Tecnología - IA, Innovación, Startups | HGARUNA News',
        description: 'Últimas noticias de tecnología: inteligencia artificial, innovación, startups, gadgets y tendencias tecnológicas.',
        keywords: 'tecnología, inteligencia artificial, innovación, startups, gadgets',
        category: 'Tecnología'
      },
      cultura: {
        title: 'Noticias de Cultura - Cine, Música, Arte | HGARUNA News',
        description: 'Noticias de cultura: cine, música, arte, literatura y espectáculos. Las últimas tendencias culturales.',
        keywords: 'cultura, cine, música, arte, literatura, espectáculos',
        category: 'Cultura'
      },
      autos: {
        title: 'Noticias de Autos - Coches, Motores, Fórmula 1 | HGARUNA News',
        description: 'Últimas noticias de autos: nuevos modelos, Fórmula 1, motores, tecnología automotriz y más.',
        keywords: 'autos, coches, motores, fórmula 1, tecnología automotriz',
        category: 'Autos'
      },
      ultimo: {
        title: 'Últimas Noticias - Breaking News Internacional | HGARUNA News',
        description: 'Breaking news y últimas noticias internacionales. Información actualizada minuto a minuto.',
        keywords: 'últimas noticias, breaking news, noticias internacionales',
        category: 'Noticias de Último Momento'
      }
    };

    return configs[this.currentPage] || configs.home;
  }

  updateMetaTag(selector, content) {
    const element = document.querySelector(selector);
    if (element) {
      if (selector === 'title') {
        element.textContent = content;
      } else {
        element.setAttribute('content', content);
      }
    }
  }

  addAdditionalMetaTags(config) {
    // Agregar meta keywords
    this.addMetaTag('keywords', config.keywords);
    
    // Agregar meta author
    this.addMetaTag('author', 'HGARUNA News');
    
    // Agregar meta robots
    this.addMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    
    // Agregar meta viewport (si no existe)
    if (!document.querySelector('meta[name="viewport"]')) {
      this.addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    }
    
    // Agregar meta language
    this.addMetaTag('language', 'es');
    
    // Agregar meta geo
    this.addMetaTag('geo.region', 'AR');
    this.addMetaTag('geo.placename', 'Buenos Aires');
    
    // Agregar meta distribution
    this.addMetaTag('distribution', 'global');
    
    // Agregar meta rating
    this.addMetaTag('rating', 'general');
  }

  addMetaTag(name, content) {
    if (!document.querySelector(`meta[name="${name}"]`)) {
      const meta = document.createElement('meta');
      meta.name = name;
      meta.content = content;
      document.head.appendChild(meta);
    }
  }

  addStructuredData() {
    // Agregar JSON-LD structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "NewsMediaOrganization",
      "name": "HGARUNA News",
      "url": "https://es.hgaruna.org",
      "logo": "https://es.hgaruna.org/assets/img/logo3.png",
      "description": "Sitio web de noticias internacionales con cobertura de deportes, tecnología, cultura y más.",
      "foundingDate": "2024",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "AR",
        "addressLocality": "Buenos Aires"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+54-3541-237972",
        "email": "23sarmiento@gmail.com",
        "contactType": "customer service"
      },
      "sameAs": [
        "https://service.hgaruna.org"
      ]
    };

    // Agregar structured data para la página actual
    const pageStructuredData = this.getPageStructuredData();
    
    this.addStructuredDataScript(structuredData);
    this.addStructuredDataScript(pageStructuredData);
  }

  getPageStructuredData() {
    const config = this.getPageConfig();
    
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": config.title,
      "description": config.description,
      "url": window.location.href,
      "mainEntity": {
        "@type": "ItemList",
        "name": config.category,
        "description": `Lista de noticias de ${config.category}`,
        "numberOfItems": 50
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Inicio",
            "item": "https://es.hgaruna.org"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": config.category,
            "item": window.location.href
          }
        ]
      }
    };
  }

  addStructuredDataScript(data) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data, null, 2);
    document.head.appendChild(script);
  }

  optimizeImages() {
    // Agregar atributos lazy loading a todas las imágenes
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach(img => {
      img.setAttribute('loading', 'lazy');
      
      // Agregar alt text si no existe
      if (!img.alt) {
        img.alt = 'Imagen de noticia';
      }
      
      // Agregar width y height para evitar layout shift
      if (!img.width && !img.height) {
        img.style.width = '100%';
        img.style.height = 'auto';
      }
    });
  }

  addBreadcrumbs() {
    const config = this.getPageConfig();
    
    // Crear breadcrumbs si no existen
    if (!document.querySelector('.breadcrumb')) {
      const breadcrumbContainer = document.createElement('nav');
      breadcrumbContainer.setAttribute('aria-label', 'breadcrumb');
      breadcrumbContainer.className = 'breadcrumb-container';
      breadcrumbContainer.style.cssText = 'background: #181818; padding: 10px 0; margin-bottom: 20px; border-bottom: 1px solid #bfa046;';
      
      breadcrumbContainer.innerHTML = `
        <div class="container">
          <ol class="breadcrumb" style="background: transparent; margin: 0; padding: 0;">
            <li class="breadcrumb-item">
              <a href="/" style="color: #bfa046; text-decoration: none;">Inicio</a>
            </li>
            <li class="breadcrumb-item active" aria-current="page" style="color: #fff;">
              ${config.category}
            </li>
          </ol>
        </div>
      `;
      
      // Insertar después del header
      const header = document.querySelector('header');
      if (header) {
        header.parentNode.insertBefore(breadcrumbContainer, header.nextSibling);
      }
    }
  }

  optimizeInternalLinking() {
    // Agregar atributos rel a enlaces internos
    const internalLinks = document.querySelectorAll('a[href^="/"], a[href^="https://es.hgaruna.org"]');
    internalLinks.forEach(link => {
      if (!link.getAttribute('rel')) {
        link.setAttribute('rel', 'internal');
      }
    });
    
    // Agregar atributos rel a enlaces externos
    const externalLinks = document.querySelectorAll('a[href^="http"]:not([href^="https://es.hgaruna.org"])');
    externalLinks.forEach(link => {
      if (!link.getAttribute('rel')) {
        link.setAttribute('rel', 'external nofollow');
      }
    });
  }

  // Método para actualizar meta tags dinámicamente cuando se cargan noticias
  updateNewsMetaTags(newsData) {
    if (newsData && newsData.length > 0) {
      const latestNews = newsData[0];
      
      // Actualizar título con la noticia más reciente
      const currentTitle = document.title;
      const newsTitle = latestNews.title.substring(0, 50) + '...';
      document.title = `${newsTitle} | ${currentTitle.split(' | ')[1] || 'HGARUNA News'}`;
      
      // Actualizar meta description
      const newsDescription = latestNews.description.substring(0, 160) + '...';
      this.updateMetaTag('meta[name="description"]', newsDescription);
      
      // Actualizar Open Graph
      this.updateMetaTag('meta[property="og:title"]', latestNews.title);
      this.updateMetaTag('meta[property="og:description"]', newsDescription);
      if (latestNews.enclosure?.url) {
        this.updateMetaTag('meta[property="og:image"]', latestNews.enclosure.url);
      }
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  window.seoOptimizer = new SEOOptimizer();
}); 