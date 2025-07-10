// Gestor de contenido legal que respeta derechos de autor
class LegalContentManager {
  constructor() {
    this.maxExcerptLength = 150; // Máximo 150 caracteres para fragmentos
    this.init();
  }

  init() {
    this.setupLegalDisclaimers();
    this.modifyContentDisplay();
    this.addSourceAttribution();
  }

  setupLegalDisclaimers() {
    // Agregar disclaimer legal en el footer
    const footer = document.querySelector('footer');
    if (footer) {
      const disclaimer = document.createElement('div');
      disclaimer.className = 'legal-disclaimer';
      disclaimer.style.cssText = 'background: #181818; padding: 15px; margin-top: 20px; border-top: 1px solid #333; font-size: 0.8rem; color: #888;';
      disclaimer.innerHTML = `
        <div class="container">
          <p><strong>Disclaimer Legal:</strong> Este sitio muestra fragmentos de noticias de fuentes externas. 
          Todo el contenido completo pertenece a sus respectivos autores y fuentes originales. 
          Para leer el contenido completo, visite los enlaces proporcionados.</p>
        </div>
      `;
      footer.appendChild(disclaimer);
    }
  }

  modifyContentDisplay() {
    // Modificar cómo se muestran las descripciones para respetar derechos de autor
    document.addEventListener('DOMContentLoaded', () => {
      this.processNewsCards();
    });

    // Observar cambios dinámicos en el contenido
    const observer = new MutationObserver(() => {
      this.processNewsCards();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  processNewsCards() {
    const newsCards = document.querySelectorAll('.news-card');
    
    newsCards.forEach(card => {
      const descriptionElement = card.querySelector('.news-description');
      if (descriptionElement) {
        const originalText = descriptionElement.textContent;
        const legalText = this.createLegalExcerpt(originalText);
        descriptionElement.innerHTML = legalText;
      }

      // Agregar atributos de fuente
      const link = card.querySelector('a[target="_blank"]');
      if (link) {
        this.addSourceInfo(link, card);
      }
    });
  }

  createLegalExcerpt(text) {
    if (!text) return 'Sin descripción disponible.';
    
    // Limpiar HTML tags
    const cleanText = text.replace(/<[^>]*>/g, '');
    
    // Limitar a máximo 150 caracteres
    if (cleanText.length > this.maxExcerptLength) {
      return cleanText.substring(0, this.maxExcerptLength) + '... <em>(fragmento)</em>';
    }
    
    return cleanText + ' <em>(fragmento)</em>';
  }

  addSourceInfo(link, card) {
    const sourceBadge = card.querySelector('.source-badge');
    if (sourceBadge) {
      const sourceName = sourceBadge.textContent;
      const originalUrl = link.href;
      
      // Agregar información legal
      const legalInfo = document.createElement('div');
      legalInfo.className = 'legal-info';
      legalInfo.style.cssText = 'font-size: 0.7rem; color: #666; margin-top: 5px;';
      legalInfo.innerHTML = `
        <small>
          <i class="bi bi-info-circle"></i> 
          Fragmento de <strong>${sourceName}</strong>. 
          <a href="${originalUrl}" target="_blank" style="color: #bfa046;">Leer completo</a>
        </small>
      `;
      
      const cardBody = card.querySelector('.card-body');
      if (cardBody) {
        cardBody.appendChild(legalInfo);
      }
    }
  }

  addSourceAttribution() {
    // Agregar atribución de fuentes en cada sección
    const sections = document.querySelectorAll('[id*="container"]');
    
    sections.forEach(section => {
      const sectionTitle = section.previousElementSibling;
      if (sectionTitle && sectionTitle.tagName === 'H2' || sectionTitle.tagName === 'H3') {
        this.addSectionAttribution(sectionTitle);
      }
    });
  }

  addSectionAttribution(titleElement) {
    const attribution = document.createElement('div');
    attribution.className = 'source-attribution';
    attribution.style.cssText = 'font-size: 0.8rem; color: #888; margin-bottom: 15px; font-style: italic;';
    attribution.innerHTML = `
      <i class="bi bi-newspaper"></i> 
      Contenido agregado desde fuentes externas autorizadas
    `;
    
    titleElement.parentNode.insertBefore(attribution, titleElement.nextSibling);
  }

  // Método para generar contenido legal para páginas individuales
  generateLegalNewsPage(newsData) {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resumen: ${newsData.title} | HGARUNA News</title>
    <meta name="description" content="Resumen de noticia: ${this.createLegalExcerpt(newsData.description)}">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${newsData.url}">
    
    <!-- Open Graph -->
    <meta property="og:title" content="Resumen: ${newsData.title}">
    <meta property="og:description" content="Resumen de noticia de ${newsData.source}">
    <meta property="og:url" content="${newsData.url}">
    <meta property="og:type" content="article">
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Resumen: ${newsData.title}",
      "description": "Resumen de noticia de ${newsData.source}",
      "author": {
        "@type": "Organization",
        "name": "HGARUNA News"
      },
      "publisher": {
        "@type": "Organization",
        "name": "HGARUNA News"
      },
      "datePublished": "${newsData.date}",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "${newsData.url}"
      },
      "isPartOf": {
        "@type": "CreativeWork",
        "name": "Resumen de noticias"
      }
    }
    </script>
    
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="/main.css">
</head>
<body style="background: #111; color: #fff;">
    <header class="main-header py-4" style="background: #181818; border-bottom: 2px solid #bfa046;">
        <div class="container">
            <h1 class="display-4" style="color: #bfa046;">
                <i class="bi bi-newspaper icono-dorado"></i>HGARUNA News
            </h1>
            <p class="lead" style="color: #fff;">Resumen de Noticias</p>
        </div>
    </header>

    <main class="container mt-5">
        <div class="legal-notice alert alert-warning" style="background: #2a2a2a; border: 1px solid #bfa046; color: #bfa046;">
            <h4><i class="bi bi-exclamation-triangle"></i> Aviso Legal</h4>
            <p>Esta página contiene un <strong>resumen</strong> de una noticia publicada originalmente por <strong>${newsData.source}</strong>. 
            El contenido completo pertenece a su autor original. Para leer la noticia completa, visite el enlace de la fuente.</p>
        </div>

        <article class="news-summary">
            <header class="article-header mb-4">
                <h2 style="color: #bfa046;">Resumen: ${newsData.title}</h2>
                <div class="article-meta" style="color: #888; margin-top: 1rem;">
                    <span class="badge bg-warning text-dark me-2">${newsData.category}</span>
                    <span class="badge bg-secondary me-2">Fuente: ${newsData.source}</span>
                    <small>
                        <i class="bi bi-clock"></i> 
                        ${new Date(newsData.date).toLocaleDateString('es-ES')}
                    </small>
                </div>
            </header>

            <div class="article-content">
                <div class="summary-section">
                    <h3 style="color: #bfa046;">Resumen de la Noticia</h3>
                    <p style="line-height: 1.8; font-size: 1.1rem;">
                        ${this.createLegalExcerpt(newsData.description)}
                    </p>
                    
                    <div class="source-link-section" style="margin-top: 2rem; padding: 20px; background: #181818; border-radius: 10px;">
                        <h4 style="color: #bfa046;">Leer la Noticia Completa</h4>
                        <p>Para leer el artículo completo, visite la fuente original:</p>
                        <a href="${newsData.originalUrl}" 
                           class="btn btn-warning btn-lg" 
                           target="_blank" 
                           rel="external nofollow"
                           style="background: #bfa046; border: none; font-weight: 600;">
                            <i class="bi bi-external-link"></i> Leer en ${newsData.source}
                        </a>
                    </div>
                </div>
            </div>
        </article>
    </main>

    <footer class="footer text-white py-5" style="background: #111; border-top: 2px solid #bfa046; margin-top: 4rem;">
        <div class="container">
            <div class="legal-disclaimer" style="background: #181818; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <h5 style="color: #bfa046;">Disclaimer Legal</h5>
                <p style="font-size: 0.9rem; color: #ccc;">
                    HGARUNA News es un agregador de noticias que muestra resúmenes y fragmentos de contenido 
                    de fuentes externas autorizadas. Todo el contenido completo pertenece a sus respectivos 
                    autores y fuentes originales. Para leer el contenido completo, visite los enlaces 
                    proporcionados a las fuentes originales.
                </p>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <h5 style="color: #bfa046;">HGARUNA News</h5>
                    <p style="color: #ccc;">Agregador de noticias internacionales</p>
                </div>
                <div class="col-md-6 text-md-end">
                    <p style="color: #ccc;">&copy; 2024 HGARUNA. Todos los derechos reservados.</p>
                </div>
            </div>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
  }

  // Método para verificar si el contenido es legal
  isContentLegal(content, source) {
    // Lista de fuentes autorizadas (RSS públicos)
    const authorizedSources = [
      'BBC', 'El País', 'Clarín', 'La Nación', 'El Tiempo'
    ];
    
    return authorizedSources.some(source => 
      source.toLowerCase().includes(source.toLowerCase())
    );
  }

  // Método para generar disclaimer específico
  generateDisclaimer(source) {
    return `
      <div class="content-disclaimer" style="font-size: 0.8rem; color: #888; margin-top: 10px; padding: 10px; background: #181818; border-radius: 5px;">
        <i class="bi bi-info-circle"></i> 
        <strong>Fuente:</strong> ${source}. 
        Este es un fragmento/resumen. Para el contenido completo, visite la fuente original.
      </div>
    `;
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  window.legalContentManager = new LegalContentManager();
}); 