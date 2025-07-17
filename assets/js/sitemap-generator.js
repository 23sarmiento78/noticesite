// Generador automático de Sitemap XML para SEO
class SitemapGenerator {
  constructor() {
    this.sitemapData = [];
    this.lastModified = new Date().toISOString();
    this.baseUrl = 'https://news.hgaruna.org';
    this.init();
  }

  async init() {
    // Solo generar sitemap en la página principal
    if (window.location.pathname === '/index.html' || window.location.pathname === '/') {
      await this.generateSitemap();
    }
  }

  async generateSitemap() {
    try {
      console.log('🔄 Generando sitemap XML para SEO...');
      
      // Esperar a que el RSS Manager cargue los feeds
      if (window.rssManager) {
        await this.waitForRSSManager();
      }

      // Recopilar URLs de noticias
      await this.collectNewsUrls();
      
      // Generar sitemap XML
      const sitemapXml = this.createSitemapXML();
      
      // Guardar sitemap (en producción se enviaría al servidor)
      this.saveSitemap(sitemapXml);
      
      // Actualizar robots.txt
      this.updateRobotsTxt();
      
      console.log('✅ Sitemap generado exitosamente');
    } catch (error) {
      console.error('❌ Error generando sitemap:', error);
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

  async collectNewsUrls() {
    this.sitemapData = [];

    // URLs estáticas del sitio
    const staticUrls = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/deportes.html', priority: '0.9', changefreq: 'hourly' },
      { url: '/tecnologia.html', priority: '0.9', changefreq: 'hourly' },
      { url: '/cultura.html', priority: '0.8', changefreq: 'daily' },
      { url: '/autos.html', priority: '0.8', changefreq: 'daily' },
      { url: '/ultimo.html', priority: '0.9', changefreq: 'hourly' },
      { url: '/politica_privacidad.html', priority: '0.3', changefreq: 'monthly' }
    ];

    // Agregar URLs estáticas
    staticUrls.forEach(item => {
      this.sitemapData.push({
        loc: this.baseUrl + item.url,
        lastmod: this.lastModified,
        changefreq: item.changefreq,
        priority: item.priority,
        type: 'static'
      });
    });

    // Recopilar URLs de noticias desde el cache del RSS Manager
    if (window.rssManager && window.rssManager.cache) {
      window.rssManager.cache.forEach((cached, feedId) => {
        if (cached.data && cached.data.items) {
          cached.data.items.forEach(item => {
            // Crear URL canónica para cada noticia
            const newsUrl = this.createNewsUrl(item, cached.data.feedInfo);
            
            this.sitemapData.push({
              loc: newsUrl,
              lastmod: item.pubDate || this.lastModified,
              changefreq: 'weekly',
              priority: '0.7',
              type: 'news',
              title: item.title,
              description: item.description,
              image: item.enclosure?.url || null
            });
          });
        }
      });
    }

    // Limitar a máximo 1000 URLs para evitar sitemaps muy grandes
    if (this.sitemapData.length > 1000) {
      this.sitemapData = this.sitemapData.slice(0, 1000);
    }
  }

  createNewsUrl(item, feedInfo) {
    // Crear URL canónica para cada noticia
    const slug = this.createSlug(item.title);
    const category = feedInfo?.categoria?.toLowerCase() || 'noticias';
    const date = new Date(item.pubDate || Date.now());
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    return `${this.baseUrl}/noticia/${category}/${dateStr}/${slug}.html`;
  }

  createSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  createSitemapXML() {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '         xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"\n';
    xml += '         xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

    this.sitemapData.forEach(item => {
      xml += '  <url>\n';
      xml += `    <loc>${this.escapeXml(item.loc)}</loc>\n`;
      xml += `    <lastmod>${item.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
      xml += `    <priority>${item.priority}</priority>\n`;

      // Agregar información de noticias si es una noticia
      if (item.type === 'news') {
        xml += '    <news:news>\n';
        xml += '      <news:publication>\n';
        xml += '        <news:name>HGARUNA News</news:name>\n';
        xml += '        <news:language>es</news:language>\n';
        xml += '      </news:publication>\n';
        xml += `      <news:publication_date>${item.lastmod}</news:publication_date>\n`;
        xml += `      <news:title>${this.escapeXml(item.title)}</news:title>\n`;
        xml += '    </news:news>\n';
      }

      // Agregar imagen si existe
      if (item.image) {
        xml += '    <image:image>\n';
        xml += `      <image:loc>${this.escapeXml(item.image)}</image:loc>\n`;
        xml += `      <image:title>${this.escapeXml(item.title || 'Noticia')}</image:title>\n`;
        xml += '    </image:image>\n';
      }

      xml += '  </url>\n';
    });

    xml += '</urlset>';
    return xml;
  }

  escapeXml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  saveSitemap(xml) {
    // En desarrollo, mostrar en consola
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('📄 Sitemap XML generado:', xml);
    }

    // En producción, enviar al servidor
    if (window.location.hostname === 'news.hgaruna.org') {
      this.uploadSitemap(xml);
    }
  }

  async uploadSitemap(xml) {
    try {
      const response = await fetch('/api/sitemap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
        },
        body: xml
      });

      if (response.ok) {
        console.log('✅ Sitemap subido al servidor');
      }
    } catch (error) {
      console.error('❌ Error subiendo sitemap:', error);
    }
  }

  updateRobotsTxt() {
    // Actualizar robots.txt para incluir el sitemap
    const robotsTxt = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${this.baseUrl}/sitemap.xml
Sitemap: ${this.baseUrl}/sitemap-news.xml

# Crawl-delay
Crawl-delay: 1`;
    
    console.log('🤖 Robots.txt actualizado');
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  window.sitemapGenerator = new SitemapGenerator();
}); 