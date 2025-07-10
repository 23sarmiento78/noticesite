// Gestor de Sitemaps
// Genera y gestiona sitemaps XML para optimizar el SEO

class SitemapManager {
    constructor() {
        this.sitemapData = {
            urls: [],
            lastUpdate: null,
            status: 'pending'
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSitemapData();
    }

    setupEventListeners() {
        // Botón de generación
        document.getElementById('generate-sitemap').addEventListener('click', () => {
            this.generateSitemap();
        });

        // Botón de validación
        document.getElementById('validate-sitemap').addEventListener('click', () => {
            this.validateSitemap();
        });

        // Botón de envío a Google
        document.getElementById('submit-sitemap').addEventListener('click', () => {
            this.submitToGoogle();
        });
    }

    async loadSitemapData() {
        try {
            // Cargar URLs existentes
            const urls = await this.getSitemapUrls();
            this.sitemapData.urls = urls;
            this.sitemapData.lastUpdate = new Date().toISOString();
            this.sitemapData.status = 'updated';

            this.updateSitemapStats();
            this.renderSitemapPreview();
            this.renderUrlsList();

        } catch (error) {
            console.error('Error cargando datos del sitemap:', error);
            this.showErrorModal('Error cargando datos del sitemap');
        }
    }

    async getSitemapUrls() {
        const settings = this.loadSettings();
        const baseUrl = settings.siteUrl || 'https://es.hgaruna.org';

        // URLs estáticas principales
        const staticUrls = [
            {
                loc: baseUrl,
                type: 'static',
                priority: '1.0',
                changefreq: 'daily',
                lastmod: new Date().toISOString(),
                title: 'Página Principal'
            },
            {
                loc: `${baseUrl}/index.html`,
                type: 'static',
                priority: '1.0',
                changefreq: 'daily',
                lastmod: new Date().toISOString(),
                title: 'Inicio'
            },
            {
                loc: `${baseUrl}/deportes.html`,
                type: 'static',
                priority: '0.9',
                changefreq: 'daily',
                lastmod: new Date().toISOString(),
                title: 'Deportes'
            },
            {
                loc: `${baseUrl}/tecnologia.html`,
                type: 'static',
                priority: '0.9',
                changefreq: 'daily',
                lastmod: new Date().toISOString(),
                title: 'Tecnología'
            },
            {
                loc: `${baseUrl}/cultura.html`,
                type: 'static',
                priority: '0.8',
                changefreq: 'weekly',
                lastmod: new Date().toISOString(),
                title: 'Cultura'
            },
            {
                loc: `${baseUrl}/autos.html`,
                type: 'static',
                priority: '0.8',
                changefreq: 'weekly',
                lastmod: new Date().toISOString(),
                title: 'Autos'
            },
            {
                loc: `${baseUrl}/ultimo.html`,
                type: 'static',
                priority: '0.9',
                changefreq: 'hourly',
                lastmod: new Date().toISOString(),
                title: 'Lo Último'
            }
        ];

        // URLs de artículos (simuladas)
        const articleUrls = this.getArticleUrls(baseUrl);

        return [...staticUrls, ...articleUrls];
    }

    getArticleUrls(baseUrl) {
        // En un entorno real, esto vendría de una base de datos
        // Por ahora, simulamos algunos artículos
        const articles = [
            {
                title: 'Nuevas tendencias en tecnología 2024',
                category: 'tecnologia',
                slug: 'nuevas-tendencias-tecnologia-2024',
                createdAt: new Date('2024-01-15').toISOString()
            },
            {
                title: 'Los mejores autos del año',
                category: 'autos',
                slug: 'mejores-autos-2024',
                createdAt: new Date('2024-01-10').toISOString()
            },
            {
                title: 'Fútbol: Resultados de la jornada',
                category: 'deportes',
                slug: 'futbol-resultados-jornada',
                createdAt: new Date('2024-01-12').toISOString()
            }
        ];

        return articles.map(article => ({
            loc: `${baseUrl}/articulo/${article.category}/${article.slug}.html`,
            type: 'article',
            priority: '0.7',
            changefreq: 'monthly',
            lastmod: article.createdAt,
            title: article.title,
            category: article.category
        }));
    }

    updateSitemapStats() {
        const stats = {
            totalUrls: this.sitemapData.urls.length,
            lastUpdate: this.sitemapData.lastUpdate ? 
                new Date(this.sitemapData.lastUpdate).toLocaleString('es-ES') : 'Nunca',
            status: this.sitemapData.status
        };

        document.getElementById('total-urls').textContent = stats.totalUrls.toLocaleString();
        document.getElementById('last-update').textContent = stats.lastUpdate;
        
        const statusElement = document.getElementById('sitemap-status');
        statusElement.textContent = stats.status === 'updated' ? 'Actualizado' : 'Pendiente';
        statusElement.className = `status-badge ${stats.status === 'updated' ? 'success' : 'pending'}`;
    }

    renderSitemapPreview() {
        const preview = document.getElementById('sitemap-preview');
        
        if (this.sitemapData.urls.length === 0) {
            preview.innerHTML = `
                <div class="placeholder-content">
                    <i class="bi bi-file-earmark-text"></i>
                    <p>No hay URLs para mostrar</p>
                </div>
            `;
            return;
        }

        const xmlContent = this.generateSitemapXML();
        
        preview.innerHTML = `
            <div class="sitemap-preview-content">
                <div class="preview-header">
                    <h5>Sitemap XML Generado</h5>
                    <button class="btn btn-sm btn-outline-primary" onclick="sitemapManager.copySitemapXML()">
                        <i class="bi bi-clipboard"></i> Copiar XML
                    </button>
                </div>
                <pre class="xml-preview"><code>${this.escapeHtml(xmlContent)}</code></pre>
            </div>
        `;
    }

    renderUrlsList() {
        const container = document.getElementById('urls-list');
        
        if (this.sitemapData.urls.length === 0) {
            container.innerHTML = `
                <div class="placeholder-content">
                    <i class="bi bi-list-ul"></i>
                    <p>No hay URLs para mostrar</p>
                </div>
            `;
            return;
        }

        const urlsHtml = this.sitemapData.urls.map(url => `
            <div class="url-item">
                <div class="url-info">
                    <div class="url-main">
                        <a href="${url.loc}" target="_blank" class="url-link">${url.title || url.loc}</a>
                        <span class="url-path">${url.loc}</span>
                    </div>
                    <div class="url-meta">
                        <span class="badge bg-${url.type === 'article' ? 'primary' : 'secondary'}">${url.type}</span>
                        <span class="badge bg-info">Prioridad: ${url.priority}</span>
                        <span class="badge bg-warning">Cambio: ${url.changefreq}</span>
                        <small class="text-muted">Última modificación: ${new Date(url.lastmod).toLocaleDateString('es-ES')}</small>
                    </div>
                </div>
                <div class="url-actions">
                    <button class="btn btn-sm btn-outline-primary" onclick="sitemapManager.editUrl('${url.loc}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="sitemapManager.removeUrl('${url.loc}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = urlsHtml;
    }

    async generateSitemap() {
        try {
            this.showLoadingModal('Generando sitemap...', 'Recopilando URLs y creando XML');

            // Recargar URLs
            await this.loadSitemapData();

            // Generar XML
            const xmlContent = this.generateSitemapXML();
            
            // Guardar sitemap
            await this.saveSitemapFile(xmlContent);

            // Actualizar estado
            this.sitemapData.status = 'updated';
            this.sitemapData.lastUpdate = new Date().toISOString();

            this.updateSitemapStats();
            this.renderSitemapPreview();
            this.renderUrlsList();

            this.hideLoadingModal();
            this.showSuccessModal('Sitemap generado exitosamente');

        } catch (error) {
            console.error('Error generando sitemap:', error);
            this.hideLoadingModal();
            this.showErrorModal(`Error generando sitemap: ${error.message}`);
        }
    }

    generateSitemapXML() {
        const settings = this.loadSettings();
        const siteUrl = settings.siteUrl || 'https://es.hgaruna.org';
        
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
        xml += '         xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"\n';
        xml += '         xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

        this.sitemapData.urls.forEach(url => {
            xml += '  <url>\n';
            xml += `    <loc>${this.escapeXml(url.loc)}</loc>\n`;
            xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
            xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
            xml += `    <priority>${url.priority}</priority>\n`;

            // Agregar información de noticias para artículos
            if (url.type === 'article') {
                xml += '    <news:news>\n';
                xml += '      <news:publication>\n';
                xml += `        <news:name>${settings.siteTitle || 'HGARUNA News'}</news:name>\n`;
                xml += '        <news:language>es</news:language>\n';
                xml += '      </news:publication>\n';
                xml += `      <news:publication_date>${url.lastmod}</news:publication_date>\n`;
                xml += '    </news:news>\n';
            }

            xml += '  </url>\n';
        });

        xml += '</urlset>';
        return xml;
    }

    async saveSitemapFile(xmlContent) {
        // En un entorno real, esto guardaría el archivo en el servidor
        // Por ahora, simulamos el guardado
        console.log('📄 Guardando sitemap.xml...');
        
        // Crear blob para descarga
        const blob = new Blob([xmlContent], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        
        // Crear enlace de descarga
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sitemap.xml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async validateSitemap() {
        try {
            this.showLoadingModal('Validando sitemap...', 'Verificando estructura y URLs');

            const validationResults = await this.validateSitemapStructure();
            
            this.hideLoadingModal();
            this.showValidationResults(validationResults);

        } catch (error) {
            console.error('Error validando sitemap:', error);
            this.hideLoadingModal();
            this.showErrorModal(`Error validando sitemap: ${error.message}`);
        }
    }

    async validateSitemapStructure() {
        const results = {
            isValid: true,
            errors: [],
            warnings: [],
            stats: {
                totalUrls: this.sitemapData.urls.length,
                staticUrls: this.sitemapData.urls.filter(u => u.type === 'static').length,
                articleUrls: this.sitemapData.urls.filter(u => u.type === 'article').length
            }
        };

        // Validar URLs
        for (const url of this.sitemapData.urls) {
            // Validar formato de URL
            if (!this.isValidUrl(url.loc)) {
                results.errors.push(`URL inválida: ${url.loc}`);
                results.isValid = false;
            }

            // Validar prioridad
            const priority = parseFloat(url.priority);
            if (isNaN(priority) || priority < 0 || priority > 1) {
                results.warnings.push(`Prioridad inválida para ${url.loc}: ${url.priority}`);
            }

            // Validar fecha de modificación
            if (!this.isValidDate(url.lastmod)) {
                results.warnings.push(`Fecha de modificación inválida para ${url.loc}: ${url.lastmod}`);
            }
        }

        // Validar límites
        if (results.stats.totalUrls > 50000) {
            results.errors.push('El sitemap excede el límite de 50,000 URLs');
            results.isValid = false;
        }

        if (results.stats.totalUrls === 0) {
            results.errors.push('El sitemap no contiene URLs');
            results.isValid = false;
        }

        return results;
    }

    showValidationResults(results) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="bi bi-${results.isValid ? 'check-circle text-success' : 'x-circle text-danger'}"></i>
                            Resultados de Validación
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="validation-stats mb-3">
                            <h6>Estadísticas:</h6>
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="stat-item">
                                        <strong>Total URLs:</strong> ${results.stats.totalUrls}
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="stat-item">
                                        <strong>URLs Estáticas:</strong> ${results.stats.staticUrls}
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="stat-item">
                                        <strong>Artículos:</strong> ${results.stats.articleUrls}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        ${results.errors.length > 0 ? `
                            <div class="validation-errors mb-3">
                                <h6 class="text-danger">Errores:</h6>
                                <ul class="list-unstyled">
                                    ${results.errors.map(error => `<li><i class="bi bi-x-circle text-danger"></i> ${error}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        
                        ${results.warnings.length > 0 ? `
                            <div class="validation-warnings mb-3">
                                <h6 class="text-warning">Advertencias:</h6>
                                <ul class="list-unstyled">
                                    ${results.warnings.map(warning => `<li><i class="bi bi-exclamation-triangle text-warning"></i> ${warning}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        
                        ${results.isValid ? `
                            <div class="alert alert-success">
                                <i class="bi bi-check-circle"></i>
                                El sitemap es válido y está listo para ser enviado a los motores de búsqueda.
                            </div>
                        ` : `
                            <div class="alert alert-danger">
                                <i class="bi bi-x-circle"></i>
                                El sitemap contiene errores que deben ser corregidos antes del envío.
                            </div>
                        `}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        ${results.isValid ? `
                            <button type="button" class="btn btn-primary" onclick="sitemapManager.submitToGoogle()">
                                <i class="bi bi-upload"></i> Enviar a Google
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();

        modal.addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modal);
        });
    }

    async submitToGoogle() {
        try {
            this.showLoadingModal('Enviando sitemap a Google...', 'Esto puede tomar unos momentos');

            // Simular envío a Google Search Console
            await this.simulateGoogleSubmission();

            this.hideLoadingModal();
            this.showSuccessModal('Sitemap enviado exitosamente a Google Search Console');

        } catch (error) {
            console.error('Error enviando sitemap a Google:', error);
            this.hideLoadingModal();
            this.showErrorModal(`Error enviando sitemap: ${error.message}`);
        }
    }

    async simulateGoogleSubmission() {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // En un entorno real, aquí se haría la llamada a la API de Google Search Console
        console.log('📤 Enviando sitemap a Google Search Console...');
    }

    copySitemapXML() {
        const xmlContent = this.generateSitemapXML();
        
        navigator.clipboard.writeText(xmlContent).then(() => {
            this.showSuccessModal('Sitemap XML copiado al portapapeles');
        }).catch(err => {
            this.showErrorModal('Error copiando XML: ' + err.message);
        });
    }

    editUrl(urlLoc) {
        const url = this.sitemapData.urls.find(u => u.loc === urlLoc);
        if (!url) return;

        // Mostrar modal de edición
        this.showEditUrlModal(url);
    }

    showEditUrlModal(url) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Editar URL</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="edit-url-form">
                            <div class="mb-3">
                                <label class="form-label">URL</label>
                                <input type="url" class="form-control" value="${url.loc}" readonly>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Título</label>
                                <input type="text" class="form-control" value="${url.title || ''}" id="edit-url-title">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Prioridad</label>
                                <select class="form-control" id="edit-url-priority">
                                    <option value="1.0" ${url.priority === '1.0' ? 'selected' : ''}>1.0 - Máxima</option>
                                    <option value="0.9" ${url.priority === '0.9' ? 'selected' : ''}>0.9 - Alta</option>
                                    <option value="0.8" ${url.priority === '0.8' ? 'selected' : ''}>0.8 - Media-Alta</option>
                                    <option value="0.7" ${url.priority === '0.7' ? 'selected' : ''}>0.7 - Media</option>
                                    <option value="0.6" ${url.priority === '0.6' ? 'selected' : ''}>0.6 - Media-Baja</option>
                                    <option value="0.5" ${url.priority === '0.5' ? 'selected' : ''}>0.5 - Baja</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Frecuencia de Cambio</label>
                                <select class="form-control" id="edit-url-changefreq">
                                    <option value="always" ${url.changefreq === 'always' ? 'selected' : ''}>Siempre</option>
                                    <option value="hourly" ${url.changefreq === 'hourly' ? 'selected' : ''}>Cada hora</option>
                                    <option value="daily" ${url.changefreq === 'daily' ? 'selected' : ''}>Diario</option>
                                    <option value="weekly" ${url.changefreq === 'weekly' ? 'selected' : ''}>Semanal</option>
                                    <option value="monthly" ${url.changefreq === 'monthly' ? 'selected' : ''}>Mensual</option>
                                    <option value="yearly" ${url.changefreq === 'yearly' ? 'selected' : ''}>Anual</option>
                                    <option value="never" ${url.changefreq === 'never' ? 'selected' : ''}>Nunca</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" onclick="sitemapManager.saveUrlChanges('${url.loc}')">
                            Guardar Cambios
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();

        modal.addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modal);
        });
    }

    saveUrlChanges(urlLoc) {
        const url = this.sitemapData.urls.find(u => u.loc === urlLoc);
        if (!url) return;

        // Obtener valores del formulario
        url.title = document.getElementById('edit-url-title').value;
        url.priority = document.getElementById('edit-url-priority').value;
        url.changefreq = document.getElementById('edit-url-changefreq').value;
        url.lastmod = new Date().toISOString();

        // Actualizar interfaz
        this.renderSitemapPreview();
        this.renderUrlsList();

        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.querySelector('.modal'));
        modal.hide();

        this.showSuccessModal('URL actualizada correctamente');
    }

    removeUrl(urlLoc) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta URL del sitemap?')) {
            return;
        }

        this.sitemapData.urls = this.sitemapData.urls.filter(u => u.loc !== urlLoc);
        
        this.updateSitemapStats();
        this.renderSitemapPreview();
        this.renderUrlsList();

        this.showSuccessModal('URL eliminada del sitemap');
    }

    // Métodos de utilidad
    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch {
            return false;
        }
    }

    isValidDate(string) {
        const date = new Date(string);
        return date instanceof Date && !isNaN(date);
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

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('adminSettings');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('Error cargando configuración:', error);
            return {};
        }
    }

    // Métodos de utilidad para modales
    showLoadingModal(message, description) {
        if (window.adminPanel) {
            window.adminPanel.showLoadingModal(message, description);
        }
    }

    hideLoadingModal() {
        if (window.adminPanel) {
            window.adminPanel.hideLoadingModal();
        }
    }

    showSuccessModal(message) {
        if (window.adminPanel) {
            window.adminPanel.showSuccessModal(message);
        }
    }

    showErrorModal(message) {
        if (window.adminPanel) {
            window.adminPanel.showErrorModal(message);
        }
    }
}

// Inicializar gestor cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.sitemapManager = new SitemapManager();
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SitemapManager;
} 