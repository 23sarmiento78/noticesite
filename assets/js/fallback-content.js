// Sistema de contenido de respaldo cuando los feeds RSS fallan
class FallbackContentManager {
  constructor() {
    this.fallbackData = this.getFallbackData();
    this.init();
  }

  init() {
    // Deshabilitado temporalmente para evitar conflictos
    console.log('🔄 Sistema de fallback deshabilitado temporalmente');
    // Verificar si los feeds están cargando después de 30 segundos
    // setTimeout(() => {
    //   this.checkFeedsStatus();
    // }, 30000);
  }

  checkFeedsStatus() {
    const containers = document.querySelectorAll('[id*="container"]');
    let emptyContainers = 0;
    
    containers.forEach(container => {
      const newsCards = container.querySelectorAll('.news-card');
      if (newsCards.length === 0) {
        emptyContainers++;
        this.loadFallbackContent(container);
      }
    });
    
    if (emptyContainers > 0) {
      console.log(`🔄 Cargando contenido de respaldo para ${emptyContainers} contenedores vacíos`);
    }
  }

  loadFallbackContent(container) {
    const containerId = container.id;
    const category = this.getCategoryFromContainerId(containerId);
    const fallbackItems = this.getFallbackItemsForCategory(category);
    
    const rowContainer = container.querySelector('.row');
    if (!rowContainer) return;
    
    rowContainer.innerHTML = '';
    
    fallbackItems.forEach(item => {
      const col = document.createElement('div');
      col.classList.add('col');
      
      col.innerHTML = `
        <article class="card h-100 news-card" style="border: none; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.15); transition: all 0.3s ease;">
          <div class="position-relative">
            <img src="${item.image}" class="card-img-top news-image" alt="${item.title}" loading="lazy" style="height: 200px; object-fit: cover; transition: transform 0.3s ease;">
            <div class="overlay-gradient" style="position: absolute; bottom: 0; left: 0; right: 0; height: 50%; background: linear-gradient(transparent, rgba(0,0,0,0.7)); pointer-events: none;"></div>
            <span class="badge category-badge" style="position: absolute; top: 12px; left: 12px; background: #bfa046; color: #111; font-weight: 600; padding: 6px 12px; border-radius: 20px; font-size: 0.75rem;">${item.category}</span>
            <span class="badge source-badge" style="position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,0.9); color: #111; font-weight: 500; padding: 4px 8px; border-radius: 15px; font-size: 0.7rem;">${item.source}</span>
          </div>
          <div class="card-body d-flex flex-column" style="padding: 1.5rem;">
            <h5 class="card-title news-headline" style="color: #bfa046; font-weight: 700; line-height: 1.3; margin-bottom: 0.75rem; font-size: 1.1rem;">${item.title}</h5>
            <p class="card-text news-description flex-grow-1" style="color: #ccc; line-height: 1.5; font-size: 0.9rem; margin-bottom: 1rem;">${item.description}</p>
            <div class="mt-auto">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <small class="text-muted" style="color: #888 !important;">
                  <i class="bi bi-clock"></i> ${item.date}
                </small>
              </div>
              <a href="${item.link}" class="btn btn-outline-warning btn-sm w-100" target="_blank" style="border-color: #bfa046; color: #bfa046; font-weight: 600; transition: all 0.3s ease;">
                <i class="bi bi-arrow-right"></i> Leer completo
              </a>
            </div>
          </div>
        </article>
      `;
      
      rowContainer.appendChild(col);
    });
  }

  getCategoryFromContainerId(containerId) {
    if (containerId.includes('deportes') || containerId.includes('sport')) return 'deportes';
    if (containerId.includes('tecnologia') || containerId.includes('tech')) return 'tecnologia';
    if (containerId.includes('cultura')) return 'cultura';
    if (containerId.includes('autos')) return 'autos';
    if (containerId.includes('internacional') || containerId.includes('world')) return 'internacional';
    return 'general';
  }

  getFallbackItemsForCategory(category) {
    const fallbackData = this.fallbackData[category] || this.fallbackData.general;
    return fallbackData.slice(0, 6); // Máximo 6 noticias por sección
  }

  getFallbackData() {
    return {
      deportes: [
        {
          title: 'Fútbol: Nuevas transferencias en la ventana de mercado',
          description: 'Los equipos europeos se preparan para la próxima temporada con importantes fichajes.',
          link: '#',
          image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=600&fit=crop',
          category: 'Deportes',
          source: 'HGARUNA News',
          date: 'Hace 2 horas'
        },
        {
          title: 'NBA: Playoffs en su momento más emocionante',
          description: 'Los equipos luchan por llegar a las finales con partidos muy disputados.',
          link: '#',
          image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop',
          category: 'Deportes',
          source: 'HGARUNA News',
          date: 'Hace 3 horas'
        },
        {
          title: 'Fórmula 1: Preparativos para el próximo Gran Premio',
          description: 'Los equipos ultiman detalles para la carrera del fin de semana.',
          link: '#',
          image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
          category: 'Deportes',
          source: 'HGARUNA News',
          date: 'Hace 4 horas'
        }
      ],
      tecnologia: [
        {
          title: 'Inteligencia Artificial: Nuevos avances en el sector',
          description: 'Las empresas tecnológicas presentan innovaciones revolucionarias en IA.',
          link: '#',
          image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop',
          category: 'Tecnología',
          source: 'HGARUNA News',
          date: 'Hace 1 hora'
        },
        {
          title: 'Startups: El ecosistema emprendedor en crecimiento',
          description: 'Nuevas empresas emergen con soluciones innovadoras para el mercado.',
          link: '#',
          image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop',
          category: 'Tecnología',
          source: 'HGARUNA News',
          date: 'Hace 2 horas'
        },
        {
          title: 'Gadgets: Los dispositivos más esperados del año',
          description: 'Las principales marcas preparan sus lanzamientos más importantes.',
          link: '#',
          image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&h=600&fit=crop',
          category: 'Tecnología',
          source: 'HGARUNA News',
          date: 'Hace 3 horas'
        }
      ],
      cultura: [
        {
          title: 'Cine: Estrenos más esperados de la temporada',
          description: 'Las películas más prometedoras llegan a las salas de cine.',
          link: '#',
          image: 'https://images.unsplash.com/photo-1489599835382-957519cb7350?w=800&h=600&fit=crop',
          category: 'Cultura',
          source: 'HGARUNA News',
          date: 'Hace 2 horas'
        },
        {
          title: 'Música: Nuevos álbumes de artistas destacados',
          description: 'Los músicos más populares presentan sus trabajos más recientes.',
          link: '#',
          image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
          category: 'Cultura',
          source: 'HGARUNA News',
          date: 'Hace 3 horas'
        },
        {
          title: 'Arte: Exposiciones imperdibles en galerías',
          description: 'Las mejores muestras artísticas se presentan en la ciudad.',
          link: '#',
          image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop',
          category: 'Cultura',
          source: 'HGARUNA News',
          date: 'Hace 4 horas'
        }
      ],
      autos: [
        {
          title: 'Coches eléctricos: La revolución del transporte',
          description: 'Los fabricantes automotrices apuestan por la movilidad sostenible.',
          link: '#',
          image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
          category: 'Autos',
          source: 'HGARUNA News',
          date: 'Hace 1 hora'
        },
        {
          title: 'Fórmula 1: Tecnología de vanguardia en la pista',
          description: 'Los equipos desarrollan innovaciones para mejorar el rendimiento.',
          link: '#',
          image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
          category: 'Autos',
          source: 'HGARUNA News',
          date: 'Hace 2 horas'
        },
        {
          title: 'Concept cars: El futuro del diseño automotriz',
          description: 'Los prototipos más innovadores se presentan en los salones.',
          link: '#',
          image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
          category: 'Autos',
          source: 'HGARUNA News',
          date: 'Hace 3 horas'
        }
      ],
      internacional: [
        {
          title: 'Noticias internacionales: Los eventos más importantes',
          description: 'Cobertura completa de los acontecimientos mundiales más relevantes.',
          link: '#',
          image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop',
          category: 'Internacional',
          source: 'HGARUNA News',
          date: 'Hace 1 hora'
        },
        {
          title: 'Política mundial: Decisiones que afectan al mundo',
          description: 'Los líderes mundiales toman decisiones importantes para el futuro.',
          link: '#',
          image: 'https://images.unsplash.com/photo-1495020683877-95802f6f647a?w=800&h=600&fit=crop',
          category: 'Internacional',
          source: 'HGARUNA News',
          date: 'Hace 2 horas'
        },
        {
          title: 'Economía global: Tendencias del mercado internacional',
          description: 'Análisis de los movimientos económicos más significativos.',
          link: '#',
          image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=600&fit=crop',
          category: 'Internacional',
          source: 'HGARUNA News',
          date: 'Hace 3 horas'
        }
      ],
      general: [
        {
          title: 'Noticias destacadas del día',
          description: 'Los acontecimientos más importantes que debes conocer hoy.',
          link: '#',
          image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop',
          category: 'Noticias',
          source: 'HGARUNA News',
          date: 'Hace 1 hora'
        },
        {
          title: 'Información actualizada las 24 horas',
          description: 'Mantente informado con las últimas noticias del mundo.',
          link: '#',
          image: 'https://images.unsplash.com/photo-1495020683877-95802f6f647a?w=800&h=600&fit=crop',
          category: 'Noticias',
          source: 'HGARUNA News',
          date: 'Hace 2 horas'
        },
        {
          title: 'Cobertura completa de eventos importantes',
          description: 'Análisis detallado de los acontecimientos más relevantes.',
          link: '#',
          image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=600&fit=crop',
          category: 'Noticias',
          source: 'HGARUNA News',
          date: 'Hace 3 horas'
        }
      ]
    };
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  window.fallbackContentManager = new FallbackContentManager();
}); 