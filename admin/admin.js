// Panel de Administración - HGARUNA News
// Archivo principal de JavaScript

class AdminPanel {
    constructor() {
        this.currentTab = 'dashboard';
        this.settings = this.loadSettings();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDashboardData();
        this.updateDateTime();
        this.setupAutoRefresh();
    }

    setupEventListeners() {
        // Sidebar toggle
        document.getElementById('sidebar-toggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('collapsed');
        });

        // Tab navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.switchTab(e.currentTarget.dataset.tab);
            });
        });

        // Settings save
        const saveSettingsBtn = document.getElementById('save-settings');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        }

        // Settings reset
        const resetSettingsBtn = document.getElementById('reset-settings');
        if (resetSettingsBtn) {
            resetSettingsBtn.addEventListener('click', () => {
                this.resetSettings();
            });
        }

        // Copy article
        const copyArticleBtn = document.getElementById('copy-article');
        if (copyArticleBtn) {
            copyArticleBtn.addEventListener('click', () => {
                this.copyArticleToClipboard();
            });
        }

        // Download article
        const downloadArticleBtn = document.getElementById('download-article');
        if (downloadArticleBtn) {
            downloadArticleBtn.addEventListener('click', () => {
                this.downloadArticle();
            });
        }
    }

    switchTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Show selected tab
        const targetTab = document.getElementById(tabName);
        if (targetTab) {
            targetTab.classList.add('active');
        }

        // Add active class to selected nav item
        const selectedNav = document.querySelector(`[data-tab="${tabName}"]`);
        if (selectedNav) {
            selectedNav.classList.add('active');
        }

        this.currentTab = tabName;

        // Load tab-specific data
        this.loadTabData(tabName);
    }

    loadTabData(tabName) {
        switch(tabName) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'article-generator':
                this.loadArticleGeneratorData();
                break;
            case 'sitemap-manager':
                this.loadSitemapData();
                break;
            case 'seo-analyzer':
                this.loadSEOData();
                break;
            case 'settings':
                this.loadSettingsData();
                break;
        }
    }

    loadDashboardData() {
        // Simular datos del dashboard
        this.updateDashboardStats({
            totalArticles: 1250,
            totalViews: 45678,
            seoScore: 85,
            aiArticles: 342
        });

        this.updateActivityList();
    }

    updateDashboardStats(stats) {
        const totalArticlesEl = document.getElementById('total-articles');
        const totalViewsEl = document.getElementById('total-views');
        const seoScoreEl = document.getElementById('seo-score');
        const aiArticlesEl = document.getElementById('ai-articles');

        if (totalArticlesEl) totalArticlesEl.textContent = stats.totalArticles.toLocaleString();
        if (totalViewsEl) totalViewsEl.textContent = stats.totalViews.toLocaleString();
        if (seoScoreEl) seoScoreEl.textContent = `${stats.seoScore}%`;
        if (aiArticlesEl) aiArticlesEl.textContent = stats.aiArticles.toLocaleString();
    }

    updateActivityList() {
        const activityList = document.getElementById('activity-list');
        if (!activityList) return;

        const activities = [
            {
                icon: 'bi-plus-circle',
                color: 'text-success',
                text: 'Artículo creado: "Nuevas tendencias en tecnología"',
                time: 'Hace 2 horas'
            },
            {
                icon: 'bi-arrow-up-circle',
                color: 'text-primary',
                text: 'Sitemap actualizado',
                time: 'Hace 4 horas'
            },
            {
                icon: 'bi-search',
                color: 'text-info',
                text: 'Análisis SEO completado',
                time: 'Hace 6 horas'
            },
            {
                icon: 'bi-gear',
                color: 'text-warning',
                text: 'Configuración actualizada',
                time: 'Hace 1 día'
            }
        ];

        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <i class="bi ${activity.icon} ${activity.color}"></i>
                <div class="activity-content">
                    <p>${activity.text}</p>
                    <small>${activity.time}</small>
                </div>
            </div>
        `).join('');
    }

    loadArticleGeneratorData() {
        // Cargar configuración guardada
        const settings = this.loadSettings();
        const categorySelect = document.getElementById('article-category');
        const toneSelect = document.getElementById('article-tone');
        const lengthSelect = document.getElementById('article-length');

        if (categorySelect && settings.defaultCategory) {
            categorySelect.value = settings.defaultCategory;
        }
        if (toneSelect && settings.defaultTone) {
            toneSelect.value = settings.defaultTone;
        }
        if (lengthSelect && settings.defaultLength) {
            lengthSelect.value = settings.defaultLength;
        }
    }

    loadSitemapData() {
        // Cargar datos del sitemap
        this.updateSitemapStats({
            totalUrls: 1250,
            lastUpdate: new Date().toLocaleString(),
            status: 'updated'
        });
    }

    updateSitemapStats(stats) {
        const totalUrlsEl = document.getElementById('total-urls');
        const lastUpdateEl = document.getElementById('last-update');
        const statusEl = document.getElementById('sitemap-status');

        if (totalUrlsEl) totalUrlsEl.textContent = stats.totalUrls.toLocaleString();
        if (lastUpdateEl) lastUpdateEl.textContent = stats.lastUpdate;
        
        if (statusEl) {
            statusEl.textContent = stats.status === 'updated' ? 'Actualizado' : 'Pendiente';
            statusEl.className = `status-badge ${stats.status === 'updated' ? 'success' : 'pending'}`;
        }
    }

    loadSEOData() {
        // Cargar datos SEO
        console.log('Cargando datos SEO...');
    }

    loadSettingsData() {
        const settings = this.loadSettings();
        
        // Cargar valores en los campos
        const openaiKeyEl = document.getElementById('openai-api-key');
        const googleSearchEl = document.getElementById('google-search-console');
        const defaultCategoryEl = document.getElementById('default-category');
        const defaultToneEl = document.getElementById('default-tone');
        const sitemapPriorityEl = document.getElementById('sitemap-priority');
        const sitemapChangefreqEl = document.getElementById('sitemap-changefreq');

        if (openaiKeyEl && settings.openaiApiKey) {
            openaiKeyEl.value = settings.openaiApiKey;
        }
        if (googleSearchEl && settings.googleSearchConsole) {
            googleSearchEl.value = settings.googleSearchConsole;
        }
        if (defaultCategoryEl && settings.defaultCategory) {
            defaultCategoryEl.value = settings.defaultCategory;
        }
        if (defaultToneEl && settings.defaultTone) {
            defaultToneEl.value = settings.defaultTone;
        }
        if (sitemapPriorityEl && settings.sitemapPriority) {
            sitemapPriorityEl.value = settings.sitemapPriority;
        }
        if (sitemapChangefreqEl && settings.sitemapChangefreq) {
            sitemapChangefreqEl.value = settings.sitemapChangefreq;
        }
    }

    saveSettings() {
        const settings = {
            openaiApiKey: document.getElementById('openai-api-key')?.value || '',
            googleSearchConsole: document.getElementById('google-search-console')?.value || '',
            defaultCategory: document.getElementById('default-category')?.value || 'tecnologia',
            defaultTone: document.getElementById('default-tone')?.value || 'informativo',
            sitemapPriority: document.getElementById('sitemap-priority')?.value || '0.5',
            sitemapChangefreq: document.getElementById('sitemap-changefreq')?.value || 'daily'
        };

        localStorage.setItem('adminSettings', JSON.stringify(settings));
        this.settings = settings;

        this.showSuccessModal('Configuración guardada exitosamente');
    }

    resetSettings() {
        if (confirm('¿Estás seguro de que quieres restablecer toda la configuración?')) {
            localStorage.removeItem('adminSettings');
            this.settings = {};
            this.loadSettingsData();
            this.showSuccessModal('Configuración restablecida');
        }
    }

    loadSettings() {
        const saved = localStorage.getItem('adminSettings');
        return saved ? JSON.parse(saved) : {
            defaultCategory: 'tecnologia',
            defaultTone: 'informativo',
            sitemapPriority: '0.5',
            sitemapChangefreq: 'daily'
        };
    }

    copyArticleToClipboard() {
        const articleOutput = document.getElementById('article-output');
        if (!articleOutput) return;

        const text = articleOutput.innerText;
        
        navigator.clipboard.writeText(text).then(() => {
            this.showSuccessModal('Artículo copiado al portapapeles');
        }).catch(err => {
            this.showErrorModal('Error al copiar: ' + err.message);
        });
    }

    downloadArticle() {
        const articleOutput = document.getElementById('article-output');
        if (!articleOutput) return;

        const text = articleOutput.innerText;
        const title = document.getElementById('article-title')?.value || 'articulo-generado';
        
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showSuccessModal('Artículo descargado exitosamente');
    }

    showLoadingModal(message = 'Procesando...', description = 'Por favor espera mientras se completa la operación') {
        const loadingMessage = document.getElementById('loading-message');
        const loadingDescription = document.getElementById('loading-description');
        
        if (loadingMessage) loadingMessage.textContent = message;
        if (loadingDescription) loadingDescription.textContent = description;
        
        const modal = new bootstrap.Modal(document.getElementById('loading-modal'));
        modal.show();
    }

    hideLoadingModal() {
        const modal = bootstrap.Modal.getInstance(document.getElementById('loading-modal'));
        if (modal) {
            modal.hide();
        }
    }

    showSuccessModal(message) {
        const successMessage = document.getElementById('success-message');
        if (successMessage) successMessage.textContent = message;
        
        const modal = new bootstrap.Modal(document.getElementById('success-modal'));
        modal.show();
    }

    showErrorModal(message) {
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) errorMessage.textContent = message;
        
        const modal = new bootstrap.Modal(document.getElementById('error-modal'));
        modal.show();
    }

    updateDateTime() {
        const now = new Date();
        const dateString = now.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Actualizar fecha en el header si existe
        const dateElement = document.querySelector('.header-info p');
        if (dateElement) {
            dateElement.textContent = `Última actualización: ${dateString}`;
        }
    }

    setupAutoRefresh() {
        // Actualizar fecha cada minuto
        setInterval(() => {
            this.updateDateTime();
        }, 60000);

        // Actualizar dashboard cada 5 minutos
        setInterval(() => {
            if (this.currentTab === 'dashboard') {
                this.loadDashboardData();
            }
        }, 300000);
    }

    // Métodos de utilidad
    formatNumber(num) {
        return num.toLocaleString();
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('es-ES');
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validateUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
}

// Inicializar el panel cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminPanel;
} 