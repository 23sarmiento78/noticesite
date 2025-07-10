// Analizador SEO
// Analiza y optimiza el SEO de páginas web

class SEOAnalyzer {
    constructor() {
        this.currentAnalysis = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Botón de análisis
        document.getElementById('analyze-seo').addEventListener('click', () => {
            this.analyzeSEO();
        });

        // Validación de URL en tiempo real
        document.getElementById('seo-url').addEventListener('input', () => {
            this.validateUrl();
        });

        // Enter para analizar
        document.getElementById('seo-url').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.analyzeSEO();
            }
        });
    }

    validateUrl() {
        const urlInput = document.getElementById('seo-url');
        const analyzeBtn = document.getElementById('analyze-seo');
        const url = urlInput.value.trim();

        if (url && this.isValidUrl(url)) {
            analyzeBtn.disabled = false;
            urlInput.classList.remove('is-invalid');
            urlInput.classList.add('is-valid');
        } else {
            analyzeBtn.disabled = true;
            urlInput.classList.remove('is-valid');
            if (url) {
                urlInput.classList.add('is-invalid');
            }
        }
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch {
            return false;
        }
    }

    async analyzeSEO() {
        const url = document.getElementById('seo-url').value.trim();
        
        if (!url) {
            this.showErrorModal('Por favor ingresa una URL para analizar');
            return;
        }

        if (!this.isValidUrl(url)) {
            this.showErrorModal('Por favor ingresa una URL válida');
            return;
        }

        try {
            this.showLoadingModal('Analizando SEO...', 'Recopilando datos de la página');

            const analysis = await this.performSEOAnalysis(url);
            this.currentAnalysis = analysis;

            this.displayResults(analysis);
            this.showSuccessModal('Análisis SEO completado');

        } catch (error) {
            console.error('Error analizando SEO:', error);
            this.hideLoadingModal();
            this.showErrorModal(`Error analizando SEO: ${error.message}`);
        }
    }

    async performSEOAnalysis(url) {
        // Simular análisis SEO (en un entorno real, esto haría scraping de la página)
        await this.simulateAnalysis();
        
        return {
            url: url,
            timestamp: new Date().toISOString(),
            overallScore: this.generateRandomScore(60, 95),
            metrics: {
                title: this.analyzeTitle(),
                metaDescription: this.analyzeMetaDescription(),
                headings: this.analyzeHeadings(),
                images: this.analyzeImages(),
                links: this.analyzeLinks(),
                content: this.analyzeContent(),
                speed: this.analyzeSpeed(),
                mobile: this.analyzeMobile(),
                social: this.analyzeSocial()
            },
            recommendations: []
        };
    }

    async simulateAnalysis() {
        // Simular tiempo de análisis
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    generateRandomScore(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    analyzeTitle() {
        const score = this.generateRandomScore(70, 100);
        return {
            score: score,
            status: score >= 90 ? 'excellent' : score >= 70 ? 'good' : 'needs-improvement',
            details: {
                length: this.generateRandomScore(30, 70),
                hasKeywords: Math.random() > 0.3,
                isUnique: Math.random() > 0.2
            }
        };
    }

    analyzeMetaDescription() {
        const score = this.generateRandomScore(65, 95);
        return {
            score: score,
            status: score >= 90 ? 'excellent' : score >= 70 ? 'good' : 'needs-improvement',
            details: {
                length: this.generateRandomScore(120, 160),
                hasKeywords: Math.random() > 0.4,
                isCompelling: Math.random() > 0.3
            }
        };
    }

    analyzeHeadings() {
        const score = this.generateRandomScore(60, 90);
        return {
            score: score,
            status: score >= 80 ? 'excellent' : score >= 60 ? 'good' : 'needs-improvement',
            details: {
                h1Count: this.generateRandomScore(1, 3),
                h2Count: this.generateRandomScore(3, 8),
                h3Count: this.generateRandomScore(5, 15),
                hasProperStructure: Math.random() > 0.2
            }
        };
    }

    analyzeImages() {
        const score = this.generateRandomScore(70, 95);
        return {
            score: score,
            status: score >= 90 ? 'excellent' : score >= 70 ? 'good' : 'needs-improvement',
            details: {
                totalImages: this.generateRandomScore(5, 20),
                withAltText: this.generateRandomScore(3, 18),
                optimized: Math.random() > 0.3
            }
        };
    }

    analyzeLinks() {
        const score = this.generateRandomScore(65, 90);
        return {
            score: score,
            status: score >= 80 ? 'excellent' : score >= 65 ? 'good' : 'needs-improvement',
            details: {
                internalLinks: this.generateRandomScore(10, 30),
                externalLinks: this.generateRandomScore(3, 10),
                brokenLinks: this.generateRandomScore(0, 2)
            }
        };
    }

    analyzeContent() {
        const score = this.generateRandomScore(70, 95);
        return {
            score: score,
            status: score >= 85 ? 'excellent' : score >= 70 ? 'good' : 'needs-improvement',
            details: {
                wordCount: this.generateRandomScore(800, 2500),
                keywordDensity: this.generateRandomScore(1, 3),
                readability: this.generateRandomScore(60, 90)
            }
        };
    }

    analyzeSpeed() {
        const score = this.generateRandomScore(60, 95);
        return {
            score: score,
            status: score >= 90 ? 'excellent' : score >= 70 ? 'good' : 'needs-improvement',
            details: {
                loadTime: this.generateRandomScore(1, 5),
                pageSize: this.generateRandomScore(500, 2000),
                requests: this.generateRandomScore(20, 60)
            }
        };
    }

    analyzeMobile() {
        const score = this.generateRandomScore(75, 95);
        return {
            score: score,
            status: score >= 90 ? 'excellent' : score >= 75 ? 'good' : 'needs-improvement',
            details: {
                responsive: Math.random() > 0.1,
                touchFriendly: Math.random() > 0.2,
                viewport: Math.random() > 0.1
            }
        };
    }

    analyzeSocial() {
        const score = this.generateRandomScore(50, 90);
        return {
            score: score,
            status: score >= 80 ? 'excellent' : score >= 60 ? 'good' : 'needs-improvement',
            details: {
                hasOpenGraph: Math.random() > 0.3,
                hasTwitterCard: Math.random() > 0.4,
                hasSocialLinks: Math.random() > 0.5
            }
        };
    }

    displayResults(analysis) {
        this.hideLoadingModal();
        
        // Mostrar resultados
        document.getElementById('seo-results').style.display = 'block';
        
        // Actualizar puntuación general
        document.getElementById('overall-seo-score').textContent = analysis.overallScore;
        
        // Actualizar métricas
        this.updateMetrics(analysis.metrics);
        
        // Generar y mostrar recomendaciones
        const recommendations = this.generateRecommendations(analysis);
        this.displayRecommendations(recommendations);
    }

    updateMetrics(metrics) {
        // Actualizar estado de cada métrica
        Object.keys(metrics).forEach(metricKey => {
            const metric = metrics[metricKey];
            const statusElement = document.getElementById(`${metricKey}-status`);
            
            if (statusElement) {
                const icon = this.getStatusIcon(metric.status);
                const text = this.getStatusText(metric.status);
                
                statusElement.innerHTML = `
                    <i class="bi ${icon}"></i>
                    <span>${text}</span>
                `;
            }
        });
    }

    getStatusIcon(status) {
        switch(status) {
            case 'excellent': return 'bi-check-circle text-success';
            case 'good': return 'bi-check-circle text-primary';
            case 'needs-improvement': return 'bi-exclamation-triangle text-warning';
            default: return 'bi-x-circle text-danger';
        }
    }

    getStatusText(status) {
        switch(status) {
            case 'excellent': return 'Excelente';
            case 'good': return 'Bueno';
            case 'needs-improvement': return 'Mejorable';
            default: return 'Necesita Mejora';
        }
    }

    generateRecommendations(analysis) {
        const recommendations = [];
        const metrics = analysis.metrics;

        // Recomendaciones basadas en puntuación general
        if (analysis.overallScore < 70) {
            recommendations.push({
                priority: 'high',
                category: 'general',
                title: 'Puntuación SEO baja',
                description: 'La puntuación general de SEO es baja. Revisa todas las métricas y implementa las mejoras sugeridas.',
                action: 'Revisar y mejorar todas las métricas de SEO'
            });
        }

        // Recomendaciones específicas por métrica
        if (metrics.title.score < 80) {
            recommendations.push({
                priority: 'high',
                category: 'title',
                title: 'Optimizar título de página',
                description: `El título actual tiene ${metrics.title.details.length} caracteres. Ideal: 50-60 caracteres.`,
                action: 'Ajustar longitud del título y incluir palabras clave principales'
            });
        }

        if (metrics.metaDescription.score < 80) {
            recommendations.push({
                priority: 'high',
                category: 'meta',
                title: 'Mejorar meta descripción',
                description: `La descripción actual tiene ${metrics.metaDescription.details.length} caracteres. Ideal: 150-160 caracteres.`,
                action: 'Crear descripción atractiva con palabras clave'
            });
        }

        if (metrics.headings.score < 70) {
            recommendations.push({
                priority: 'medium',
                category: 'structure',
                title: 'Optimizar estructura de encabezados',
                description: `Encontrados ${metrics.headings.details.h1Count} H1, ${metrics.headings.details.h2Count} H2, ${metrics.headings.details.h3Count} H3.`,
                action: 'Usar jerarquía H1 > H2 > H3 y incluir palabras clave'
            });
        }

        if (metrics.images.score < 80) {
            recommendations.push({
                priority: 'medium',
                category: 'images',
                title: 'Optimizar imágenes',
                description: `${metrics.images.details.withAltText}/${metrics.images.details.totalImages} imágenes tienen texto alternativo.`,
                action: 'Agregar alt text descriptivo a todas las imágenes'
            });
        }

        if (metrics.speed.score < 80) {
            recommendations.push({
                priority: 'high',
                category: 'performance',
                title: 'Mejorar velocidad de carga',
                description: `Tiempo de carga: ${metrics.speed.details.loadTime}s. Tamaño: ${metrics.speed.details.pageSize}KB.`,
                action: 'Optimizar imágenes, minificar CSS/JS, usar CDN'
            });
        }

        if (metrics.mobile.score < 80) {
            recommendations.push({
                priority: 'high',
                category: 'mobile',
                title: 'Optimizar para móviles',
                description: 'La página necesita mejoras para dispositivos móviles.',
                action: 'Implementar diseño responsive y optimizar para touch'
            });
        }

        if (metrics.content.score < 75) {
            recommendations.push({
                priority: 'medium',
                category: 'content',
                title: 'Mejorar contenido',
                description: `Contenido: ${metrics.content.details.wordCount} palabras. Densidad de palabras clave: ${metrics.content.details.keywordDensity}%.`,
                action: 'Expandir contenido y optimizar densidad de palabras clave'
            });
        }

        if (metrics.social.score < 70) {
            recommendations.push({
                priority: 'low',
                category: 'social',
                title: 'Agregar metadatos sociales',
                description: 'Faltan metadatos para redes sociales.',
                action: 'Implementar Open Graph y Twitter Cards'
            });
        }

        return recommendations;
    }

    displayRecommendations(recommendations) {
        const container = document.getElementById('seo-recommendations-list');
        
        if (recommendations.length === 0) {
            container.innerHTML = `
                <div class="alert alert-success">
                    <i class="bi bi-check-circle"></i>
                    ¡Excelente! Tu página tiene una puntuación SEO muy alta.
                </div>
            `;
            return;
        }

        // Agrupar por prioridad
        const highPriority = recommendations.filter(r => r.priority === 'high');
        const mediumPriority = recommendations.filter(r => r.priority === 'medium');
        const lowPriority = recommendations.filter(r => r.priority === 'low');

        let html = '';

        // Prioridad alta
        if (highPriority.length > 0) {
            html += `
                <div class="recommendations-section">
                    <h5 class="text-danger">
                        <i class="bi bi-exclamation-triangle"></i>
                        Prioridad Alta (${highPriority.length})
                    </h5>
                    ${highPriority.map(rec => this.renderRecommendation(rec)).join('')}
                </div>
            `;
        }

        // Prioridad media
        if (mediumPriority.length > 0) {
            html += `
                <div class="recommendations-section">
                    <h5 class="text-warning">
                        <i class="bi bi-exclamation-circle"></i>
                        Prioridad Media (${mediumPriority.length})
                    </h5>
                    ${mediumPriority.map(rec => this.renderRecommendation(rec)).join('')}
                </div>
            `;
        }

        // Prioridad baja
        if (lowPriority.length > 0) {
            html += `
                <div class="recommendations-section">
                    <h5 class="text-info">
                        <i class="bi bi-info-circle"></i>
                        Prioridad Baja (${lowPriority.length})
                    </h5>
                    ${lowPriority.map(rec => this.renderRecommendation(rec)).join('')}
                </div>
            `;
        }

        container.innerHTML = html;
    }

    renderRecommendation(recommendation) {
        const priorityClass = {
            'high': 'danger',
            'medium': 'warning',
            'low': 'info'
        }[recommendation.priority];

        return `
            <div class="recommendation-item alert alert-${priorityClass}">
                <div class="recommendation-header">
                    <h6 class="mb-1">${recommendation.title}</h6>
                    <span class="badge bg-${priorityClass}">${recommendation.category}</span>
                </div>
                <p class="mb-2">${recommendation.description}</p>
                <div class="recommendation-action">
                    <strong>Acción:</strong> ${recommendation.action}
                </div>
            </div>
        `;
    }

    // Métodos de utilidad
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

// Inicializar analizador cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.seoAnalyzer = new SEOAnalyzer();
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SEOAnalyzer;
} 