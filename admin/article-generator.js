// Generador de Artículos con IA
// Integración con ChatGPT para crear artículos optimizados para SEO

class ArticleGenerator {
    constructor() {
        this.isGenerating = false;
        this.currentArticle = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSavedSettings();
    }

    setupEventListeners() {
        // Botón de generación
        document.getElementById('generate-article').addEventListener('click', () => {
            this.generateArticle();
        });

        // Botón de vista previa
        document.getElementById('preview-article').addEventListener('click', () => {
            this.previewArticle();
        });

        // Validación en tiempo real
        document.getElementById('article-title').addEventListener('input', () => {
            this.validateForm();
        });

        document.getElementById('article-category').addEventListener('change', () => {
            this.validateForm();
        });

        // Auto-guardado de configuración
        document.querySelectorAll('#article-generator .form-control').forEach(input => {
            input.addEventListener('change', () => {
                this.saveFormSettings();
            });
        });
    }

    loadSavedSettings() {
        const settings = this.loadSettings();
        
        if (settings.defaultCategory) {
            document.getElementById('article-category').value = settings.defaultCategory;
        }
        if (settings.defaultTone) {
            document.getElementById('article-tone').value = settings.defaultTone;
        }
        if (settings.defaultLength) {
            document.getElementById('article-length').value = settings.defaultLength;
        }
    }

    validateForm() {
        const title = document.getElementById('article-title').value.trim();
        const category = document.getElementById('article-category').value;
        const generateBtn = document.getElementById('generate-article');
        const previewBtn = document.getElementById('preview-article');

        const isValid = title.length > 0 && category.length > 0;
        
        generateBtn.disabled = !isValid || this.isGenerating;
        previewBtn.disabled = !this.currentArticle;
    }

    async generateArticle() {
        if (this.isGenerating) return;

        const formData = this.getFormData();
        
        if (!this.validateFormData(formData)) {
            return;
        }

        const apiKey = this.getAPIKey();
        if (!apiKey) {
            this.showErrorModal('Por favor configura tu API key de OpenAI en la sección de Configuración');
            return;
        }

        this.isGenerating = true;
        this.updateGenerateButton(true);
        this.showLoadingModal('Generando artículo con IA...', 'Esto puede tomar unos momentos');

        try {
            const article = await this.callChatGPT(formData, apiKey);
            this.currentArticle = article;
            
            this.displayArticle(article);
            this.analyzeSEO(article);
            this.enableOutputActions();
            
            this.showSuccessModal('Artículo generado exitosamente');
            
        } catch (error) {
            console.error('Error generando artículo:', error);
            this.showErrorModal(`Error generando artículo: ${error.message}`);
        } finally {
            this.isGenerating = false;
            this.updateGenerateButton(false);
            this.hideLoadingModal();
        }
    }

    getFormData() {
        return {
            title: document.getElementById('article-title').value.trim(),
            category: document.getElementById('article-category').value,
            keywords: document.getElementById('article-keywords').value.trim(),
            tone: document.getElementById('article-tone').value,
            length: document.getElementById('article-length').value,
            prompt: document.getElementById('article-prompt').value.trim()
        };
    }

    validateFormData(data) {
        if (!data.title) {
            this.showErrorModal('Por favor ingresa un título para el artículo');
            return false;
        }

        if (!data.category) {
            this.showErrorModal('Por favor selecciona una categoría');
            return false;
        }

        if (data.title.length < 10) {
            this.showErrorModal('El título debe tener al menos 10 caracteres');
            return false;
        }

        if (data.title.length > 100) {
            this.showErrorModal('El título no debe exceder 100 caracteres');
            return false;
        }

        return true;
    }

    getAPIKey() {
        // Intentar obtener de configuración guardada
        const settings = this.loadSettings();
        if (settings.openaiApiKey) {
            return settings.openaiApiKey;
        }

        // Intentar obtener del campo de configuración
        const configKey = document.getElementById('openai-api-key')?.value;
        if (configKey) {
            return configKey;
        }

        return null;
    }

    async callChatGPT(formData, apiKey) {
        const prompt = this.buildPrompt(formData);
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: this.getSystemPrompt()
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: this.getMaxTokens(formData.length),
                temperature: 0.7,
                top_p: 1,
                frequency_penalty: 0.1,
                presence_penalty: 0.1
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(this.getErrorMessage(response.status, errorData));
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        return this.parseArticleContent(content, formData);
    }

    getSystemPrompt() {
        return `Eres un periodista experto y escritor de contenido SEO. Tu tarea es crear artículos de alta calidad que sean:

1. **Optimizados para SEO**: Incluyen palabras clave de forma natural, títulos atractivos y estructura clara
2. **Informativos y precisos**: Basados en hechos y datos actuales
3. **Enganchosos**: Capturan la atención del lector desde el primer párrafo
4. **Bien estructurados**: Con introducción, desarrollo y conclusión claros
5. **Accesibles**: Lenguaje claro y comprensible para el público general

Formato de respuesta:
- Título principal en la primera línea
- Contenido del artículo con párrafos bien separados
- Incluir subtítulos con ## cuando sea apropiado
- Usar listas con - cuando sea útil
- Finalizar con una conclusión impactante

No incluyas explicaciones adicionales, solo el contenido del artículo.`;
    }

    buildPrompt(formData) {
        const lengthGuide = this.getLengthGuide(formData.length);
        const toneGuide = this.getToneGuide(formData.tone);
        
        let prompt = `Escribe un artículo sobre "${formData.title}" con las siguientes especificaciones:

**Categoría**: ${formData.category}
**Tono**: ${formData.tone}
**Longitud**: ${lengthGuide}
**Palabras clave**: ${formData.keywords || 'relevantes al tema'}

${toneGuide}

${formData.prompt ? `**Instrucciones adicionales**: ${formData.prompt}` : ''}

**Requisitos específicos**:
- Título atractivo y optimizado para SEO (50-60 caracteres)
- Introducción que capture la atención
- Desarrollo con información relevante y actualizada
- Conclusión que resuma los puntos principales
- Incluir datos, estadísticas o ejemplos cuando sea apropiado
- Optimizar para palabras clave de forma natural
- Estructura clara con subtítulos cuando sea necesario

Responde solo con el contenido del artículo, sin explicaciones adicionales.`;

        return prompt;
    }

    getLengthGuide(length) {
        switch(length) {
            case 'corto': return '300-500 palabras (artículo conciso y directo)';
            case 'medio': return '800-1200 palabras (artículo completo y detallado)';
            case 'largo': return '1500-2000 palabras (artículo exhaustivo y profundo)';
            default: return '800-1200 palabras';
        }
    }

    getToneGuide(tone) {
        switch(tone) {
            case 'informativo':
                return '**Tono informativo**: Objetivo, basado en hechos, sin opiniones personales. Presenta información de manera clara y neutral.';
            case 'analitico':
                return '**Tono analítico**: Profundo, reflexivo, con análisis de causas y consecuencias. Incluye diferentes perspectivas.';
            case 'entrevista':
                return '**Tono de entrevista**: Conversacional, con citas y declaraciones. Simula una entrevista o conversación.';
            case 'opinion':
                return '**Tono de opinión**: Personal pero fundamentado, con argumentos sólidos y evidencia de apoyo.';
            case 'noticia':
                return '**Tono de noticia**: Actual, inmediato, con las 5W (qué, quién, cuándo, dónde, por qué). Estilo periodístico.';
            default:
                return '**Tono informativo**: Objetivo y basado en hechos.';
        }
    }

    getMaxTokens(length) {
        switch(length) {
            case 'corto': return 800;
            case 'medio': return 1500;
            case 'largo': return 2500;
            default: return 1500;
        }
    }

    getErrorMessage(status, errorData) {
        switch(status) {
            case 401:
                return 'API key inválida o expirada. Verifica tu configuración.';
            case 429:
                return 'Límite de solicitudes excedido. Intenta de nuevo en unos minutos.';
            case 500:
                return 'Error interno del servidor de OpenAI. Intenta de nuevo.';
            default:
                return errorData.error?.message || `Error ${status}: ${errorData.error?.type || 'Desconocido'}`;
        }
    }

    parseArticleContent(content, formData) {
        const lines = content.split('\n').filter(line => line.trim());
        
        // Extraer título (primera línea)
        const title = lines[0].replace(/^#+\s*/, '').trim();
        
        // Contenido del artículo (resto de líneas)
        const articleContent = lines.slice(1).join('\n').trim();
        
        return {
            title: title,
            content: articleContent,
            category: formData.category,
            keywords: formData.keywords,
            tone: formData.tone,
            length: formData.length,
            wordCount: this.countWords(articleContent),
            createdAt: new Date().toISOString(),
            seoScore: this.calculateSEOScore(title, articleContent, formData.keywords)
        };
    }

    countWords(text) {
        return text.split(/\s+/).filter(word => word.length > 0).length;
    }

    calculateSEOScore(title, content, keywords) {
        let score = 0;
        
        // Título (25 puntos)
        if (title.length >= 30 && title.length <= 60) {
            score += 25;
        } else if (title.length > 0) {
            score += 15;
        }
        
        // Contenido (35 puntos)
        const wordCount = this.countWords(content);
        if (wordCount >= 800) {
            score += 35;
        } else if (wordCount >= 500) {
            score += 25;
        } else if (wordCount >= 300) {
            score += 15;
        }
        
        // Palabras clave (25 puntos)
        if (keywords) {
            const keywordArray = keywords.split(',').map(k => k.trim().toLowerCase());
            const contentLower = content.toLowerCase();
            const titleLower = title.toLowerCase();
            
            keywordArray.forEach(keyword => {
                if (titleLower.includes(keyword)) score += 8;
                if (contentLower.includes(keyword)) score += 3;
            });
        }
        
        // Estructura (15 puntos)
        if (content.includes('##') || content.includes('<h2>')) score += 8;
        if (content.split('\n\n').length > 5) score += 7;
        
        return Math.min(score, 100);
    }

    displayArticle(article) {
        const output = document.getElementById('article-output');
        
        output.innerHTML = `
            <div class="article-display">
                <h2 class="article-title">${article.title}</h2>
                <div class="article-meta">
                    <span class="badge bg-primary">${article.category}</span>
                    <span class="badge bg-secondary">${article.tone}</span>
                    <span class="badge bg-info">${article.wordCount} palabras</span>
                    <span class="badge bg-success">SEO: ${article.seoScore}%</span>
                </div>
                <div class="article-content">
                    ${article.content.replace(/\n/g, '<br>')}
                </div>
                <div class="article-footer">
                    <small class="text-muted">
                        Generado el ${new Date(article.createdAt).toLocaleString('es-ES')}
                    </small>
                </div>
            </div>
        `;
    }

    analyzeSEO(article) {
        const analysis = document.getElementById('seo-analysis');
        const keywordDensity = this.calculateKeywordDensity(article.content, article.keywords);
        
        analysis.innerHTML = `
            <h4>Análisis SEO</h4>
            <div class="seo-metrics">
                <div class="seo-metric">
                    <span class="metric-label">Densidad de palabras clave:</span>
                    <span class="metric-value">${keywordDensity}%</span>
                </div>
                <div class="seo-metric">
                    <span class="metric-label">Longitud del artículo:</span>
                    <span class="metric-value">${article.wordCount} palabras</span>
                </div>
                <div class="seo-metric">
                    <span class="metric-label">Puntuación SEO:</span>
                    <span class="metric-value">${article.seoScore}/100</span>
                </div>
                <div class="seo-metric">
                    <span class="metric-label">Longitud del título:</span>
                    <span class="metric-value">${article.title.length} caracteres</span>
                </div>
            </div>
            <div class="seo-recommendations">
                ${this.generateSEORecommendations(article)}
            </div>
        `;
        
        analysis.style.display = 'block';
    }

    calculateKeywordDensity(content, keywords) {
        if (!keywords) return 0;
        
        const keywordArray = keywords.split(',').map(k => k.trim().toLowerCase());
        const contentLower = content.toLowerCase();
        const totalWords = this.countWords(content);
        
        let keywordCount = 0;
        keywordArray.forEach(keyword => {
            const regex = new RegExp(keyword, 'gi');
            const matches = contentLower.match(regex);
            if (matches) {
                keywordCount += matches.length;
            }
        });
        
        return totalWords > 0 ? Math.round((keywordCount / totalWords) * 100 * 100) / 100 : 0;
    }

    generateSEORecommendations(article) {
        const recommendations = [];
        
        // Título
        if (article.title.length < 30) {
            recommendations.push('<div class="recommendation warning">⚠️ El título es muy corto. Considera agregar más contexto.</div>');
        } else if (article.title.length > 60) {
            recommendations.push('<div class="recommendation warning">⚠️ El título es muy largo. Considera acortarlo.</div>');
        } else {
            recommendations.push('<div class="recommendation success">✅ El título tiene la longitud ideal para SEO.</div>');
        }
        
        // Contenido
        if (article.wordCount < 300) {
            recommendations.push('<div class="recommendation warning">⚠️ El contenido es muy corto. Considera expandir la información.</div>');
        } else if (article.wordCount >= 800) {
            recommendations.push('<div class="recommendation success">✅ El contenido tiene buena longitud para SEO.</div>');
        }
        
        // Puntuación SEO
        if (article.seoScore >= 80) {
            recommendations.push('<div class="recommendation success">✅ Excelente puntuación SEO.</div>');
        } else if (article.seoScore >= 60) {
            recommendations.push('<div class="recommendation info">ℹ️ Buena puntuación SEO, pero hay espacio para mejorar.</div>');
        } else {
            recommendations.push('<div class="recommendation warning">⚠️ La puntuación SEO necesita mejoras.</div>');
        }
        
        return recommendations.join('');
    }

    previewArticle() {
        if (!this.currentArticle) return;
        
        const previewWindow = window.open('', '_blank');
        const html = this.generatePreviewHTML(this.currentArticle);
        
        previewWindow.document.write(html);
        previewWindow.document.close();
    }

    generatePreviewHTML(article) {
        return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article.title} - Vista Previa</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; }
        .article-container { max-width: 800px; margin: 0 auto; padding: 2rem; }
        .article-title { color: #333; margin-bottom: 1rem; }
        .article-meta { margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid #eee; }
        .article-content { font-size: 1.1rem; }
        .badge { margin-right: 0.5rem; }
    </style>
</head>
<body>
    <div class="article-container">
        <h1 class="article-title">${article.title}</h1>
        <div class="article-meta">
            <span class="badge bg-primary">${article.category}</span>
            <span class="badge bg-secondary">${article.tone}</span>
            <span class="badge bg-info">${article.wordCount} palabras</span>
            <span class="badge bg-success">SEO: ${article.seoScore}%</span>
        </div>
        <div class="article-content">
            ${article.content.replace(/\n/g, '<br>')}
        </div>
        <div class="mt-4 pt-3 border-top">
            <small class="text-muted">
                Generado el ${new Date(article.createdAt).toLocaleString('es-ES')} | 
                Palabras clave: ${article.keywords || 'No especificadas'}
            </small>
        </div>
    </div>
</body>
</html>`;
    }

    enableOutputActions() {
        document.getElementById('copy-article').disabled = false;
        document.getElementById('download-article').disabled = false;
        document.getElementById('preview-article').disabled = false;
    }

    updateGenerateButton(isGenerating) {
        const btn = document.getElementById('generate-article');
        const icon = btn.querySelector('i');
        
        if (isGenerating) {
            btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Generando...';
            btn.disabled = true;
        } else {
            btn.innerHTML = '<i class="bi bi-magic"></i> Generar Artículo';
            btn.disabled = false;
        }
    }

    saveFormSettings() {
        const settings = this.loadSettings();
        
        settings.defaultCategory = document.getElementById('article-category').value;
        settings.defaultTone = document.getElementById('article-tone').value;
        settings.defaultLength = document.getElementById('article-length').value;
        
        this.saveSettings(settings);
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

    saveSettings(settings) {
        try {
            localStorage.setItem('adminSettings', JSON.stringify(settings));
        } catch (error) {
            console.error('Error guardando configuración:', error);
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

// Inicializar generador cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.articleGenerator = new ArticleGenerator();
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ArticleGenerator;
} 