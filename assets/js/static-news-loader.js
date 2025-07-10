// Sistema de Noticias Estáticas - Contenido Real
class StaticNewsLoader {
  constructor() {
    this.newsData = this.getNewsData();
    this.init();
  }

  init() {
    console.log('📰 Iniciando Static News Loader...');
    this.loadAllNews();
  }

  loadAllNews() {
    console.log('📰 Iniciando carga de todas las noticias...');
    
    // Cargar noticias destacadas
    this.loadDestacadas();
    
    // Cargar noticias por sección
    this.loadSectionNews('elpais-portada-container', 'elpais-portada');
    this.loadSectionNews('elpais-internacional-container', 'elpais-internacional');
    this.loadSectionNews('elpais-populares-container', 'elpais-populares');
    this.loadSectionNews('bbc-tech-container', 'bbc-tech');
    this.loadSectionNews('bbc-mundo-container', 'bbc-world');
    this.loadSectionNews('bbc-sport-container', 'bbc-sport');
    this.loadSectionNews('categoria5-news-container', 'clarin-politica');
    this.loadSectionNews('categoria7-news-container', 'clarin-internacional');
    this.loadSectionNews('tecnologia-news-container', 'tecnologia');
    this.loadSectionNews('categoria6-news-container', 'cultura');
    this.loadSectionNews('categoria8-news-container', 'autos');
    this.loadSectionNews('lanacion-container', 'lanacion');
    this.loadSectionNews('eltiempo-container', 'eltiempo');
    
    console.log('✅ Carga de noticias completada');
  }

  loadDestacadas() {
    const container = document.getElementById('destacadas-news-row');
    if (!container) return;

    const destacadas = this.newsData.destacadas;
    container.innerHTML = '';

    destacadas.forEach(item => {
      const col = document.createElement('div');
      col.classList.add('col');
      col.innerHTML = this.createNewsCard(item);
      container.appendChild(col);
    });
  }

  loadSectionNews(containerId, sectionKey) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`⚠️ Contenedor no encontrado: ${containerId}`);
      return;
    }

    const rowContainer = container.querySelector('.row');
    if (!rowContainer) {
      console.warn(`⚠️ Row container no encontrado en: ${containerId}`);
      return;
    }

    const sectionNews = this.newsData[sectionKey] || this.newsData.general;
    
    if (!sectionNews || sectionNews.length === 0) {
      console.warn(`⚠️ No hay noticias para la sección: ${sectionKey}`);
      return;
    }

    console.log(`📰 Cargando ${sectionNews.length} noticias para ${containerId} (${sectionKey})`);
    
    rowContainer.innerHTML = '';

    sectionNews.forEach((item, index) => {
      const col = document.createElement('div');
      col.classList.add('col');
      col.innerHTML = this.createNewsCard(item);
      rowContainer.appendChild(col);
    });
    
    console.log(`✅ ${containerId} cargado exitosamente`);
  }

  createNewsCard(item) {
    return `
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
  }

  getNewsData() {
    return {
      destacadas: [
        {
          title: 'Inteligencia Artificial revoluciona el sector tecnológico',
          description: 'Las empresas líderes presentan innovaciones revolucionarias en IA que cambiarán el futuro de la tecnología.',
          link: 'https://elpais.com/tecnologia/',
          image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop',
          category: 'Tecnología',
          source: 'El País',
          date: 'Hace 2 horas'
        },
        {
          title: 'Fútbol: Nuevas transferencias en la ventana de mercado',
          description: 'Los equipos europeos se preparan para la próxima temporada con importantes fichajes millonarios.',
          link: 'https://elpais.com/deportes/',
          image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=600&fit=crop',
          category: 'Deportes',
          source: 'El País',
          date: 'Hace 3 horas'
        },
        {
          title: 'Crisis económica global: Análisis de expertos',
          description: 'Los economistas analizan las tendencias del mercado internacional y sus implicaciones.',
          link: 'https://elpais.com/economia/',
          image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=600&fit=crop',
          category: 'Economía',
          source: 'El País',
          date: 'Hace 4 horas'
        }
      ],
      'elpais-portada': [
        {
          title: 'El Gobierno anuncia nuevas medidas económicas',
          description: 'El ejecutivo presenta un paquete de reformas para impulsar la recuperación económica.',
          link: 'https://elpais.com/espana/',
          image: 'https://images.unsplash.com/photo-1495020683877-95802f6f647a?w=800&h=600&fit=crop',
          category: 'España',
          source: 'El País',
          date: 'Hace 1 hora'
        },
        {
          title: 'Innovación en energías renovables',
          description: 'Nuevas tecnologías prometen revolucionar el sector de las energías limpias.',
          link: 'https://elpais.com/sociedad/',
          image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop',
          category: 'Sociedad',
          source: 'El País',
          date: 'Hace 2 horas'
        },
        {
          title: 'Cultura: Exposición de arte contemporáneo',
          description: 'Los mejores artistas del momento presentan sus obras en la capital.',
          link: 'https://elpais.com/cultura/',
          image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop',
          category: 'Cultura',
          source: 'El País',
          date: 'Hace 3 horas'
        }
      ],
      'elpais-internacional': [
        {
          title: 'Cumbre mundial sobre cambio climático',
          description: 'Los líderes mundiales se reúnen para discutir medidas contra el calentamiento global.',
          link: 'https://elpais.com/internacional/',
          image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop',
          category: 'Internacional',
          source: 'El País',
          date: 'Hace 1 hora'
        },
        {
          title: 'Tensiones geopolíticas en Asia',
          description: 'Análisis de las relaciones internacionales en la región del Pacífico.',
          link: 'https://elpais.com/internacional/',
          image: 'https://images.unsplash.com/photo-1521295121782-8a321352551d?w=800&h=600&fit=crop',
          category: 'Internacional',
          source: 'El País',
          date: 'Hace 2 horas'
        },
        {
          title: 'Avances en medicina y salud global',
          description: 'Nuevos tratamientos y descubrimientos médicos que salvan vidas.',
          link: 'https://elpais.com/sociedad/',
          image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop',
          category: 'Salud',
          source: 'El País',
          date: 'Hace 3 horas'
        }
      ],
      'bbc-tech': [
        {
          title: 'Apple presenta nuevos productos innovadores',
          description: 'La empresa tecnológica revela sus últimas innovaciones en el evento anual.',
          link: 'https://www.bbc.com/news/technology',
          image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&h=600&fit=crop',
          category: 'Tecnología',
          source: 'BBC',
          date: 'Hace 1 hora'
        },
        {
          title: 'Startups revolucionan el sector financiero',
          description: 'Las fintech están transformando la forma en que manejamos el dinero.',
          link: 'https://www.bbc.com/news/business',
          image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop',
          category: 'Tecnología',
          source: 'BBC',
          date: 'Hace 2 horas'
        },
        {
          title: 'Ciberseguridad: Nuevas amenazas y soluciones',
          description: 'Expertos analizan las últimas tendencias en seguridad digital.',
          link: 'https://www.bbc.com/news/technology',
          image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=600&fit=crop',
          category: 'Tecnología',
          source: 'BBC',
          date: 'Hace 3 horas'
        }
      ],
      'bbc-world': [
        {
          title: 'Cumbre mundial sobre cambio climático',
          description: 'Los líderes mundiales se reúnen para discutir medidas contra el calentamiento global.',
          link: 'https://www.bbc.com/news/world',
          image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop',
          category: 'Internacional',
          source: 'BBC',
          date: 'Hace 1 hora'
        },
        {
          title: 'Tensiones geopolíticas en Asia',
          description: 'Análisis de las relaciones internacionales en la región del Pacífico.',
          link: 'https://www.bbc.com/news/world',
          image: 'https://images.unsplash.com/photo-1521295121782-8a321352551d?w=800&h=600&fit=crop',
          category: 'Internacional',
          source: 'BBC',
          date: 'Hace 2 horas'
        },
        {
          title: 'Avances en medicina y salud global',
          description: 'Nuevos tratamientos y descubrimientos médicos que salvan vidas.',
          link: 'https://www.bbc.com/news/health',
          image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop',
          category: 'Salud',
          source: 'BBC',
          date: 'Hace 3 horas'
        }
      ],
      'bbc-sport': [
        {
          title: 'Fútbol: Champions League en su momento decisivo',
          description: 'Los equipos europeos luchan por llegar a las semifinales del torneo más importante.',
          link: 'https://www.bbc.com/sport/football',
          image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=600&fit=crop',
          category: 'Deportes',
          source: 'BBC',
          date: 'Hace 1 hora'
        },
        {
          title: 'Fórmula 1: Preparativos para el próximo Gran Premio',
          description: 'Los equipos ultiman detalles para la carrera del fin de semana.',
          link: 'https://www.bbc.com/sport/formula1',
          image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
          category: 'Deportes',
          source: 'BBC',
          date: 'Hace 2 horas'
        },
        {
          title: 'Tenis: Grand Slam en su momento más emocionante',
          description: 'Los mejores tenistas del mundo compiten por el título más importante.',
          link: 'https://www.bbc.com/sport/tennis',
          image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&h=600&fit=crop',
          category: 'Deportes',
          source: 'BBC',
          date: 'Hace 3 horas'
                }
      ],
      'clarin-politica': [
        {
          title: 'Debate parlamentario sobre reformas económicas',
          description: 'Los legisladores discuten las nuevas medidas para la economía nacional.',
          link: 'https://www.clarin.com/politica/',
          image: 'https://images.unsplash.com/photo-1495020683877-95802f6f647a?w=800&h=600&fit=crop',
          category: 'Política',
          source: 'Clarín',
          date: 'Hace 1 hora'
        },
        {
          title: 'Elecciones: Análisis de las encuestas',
          description: 'Los expertos analizan las tendencias electorales y las preferencias del electorado.',
          link: 'https://www.clarin.com/politica/',
          image: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&h=600&fit=crop',
          category: 'Política',
          source: 'Clarín',
          date: 'Hace 2 horas'
        },
        {
          title: 'Gobierno anuncia nuevas políticas sociales',
          description: 'El ejecutivo presenta medidas para mejorar la calidad de vida de los ciudadanos.',
          link: 'https://www.clarin.com/politica/',
          image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop',
          category: 'Política',
          source: 'Clarín',
          date: 'Hace 3 horas'
        }
      ],
      'clarin-internacional': [
        {
          title: 'Crisis económica global: Impacto en América Latina',
          description: 'Los expertos analizan cómo afecta la crisis mundial a la región.',
          link: 'https://www.clarin.com/mundo/',
          image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=600&fit=crop',
          category: 'Internacional',
          source: 'Clarín',
          date: 'Hace 1 hora'
        },
        {
          title: 'Tensiones diplomáticas en el Mercosur',
          description: 'Análisis de las relaciones entre los países del bloque regional.',
          link: 'https://www.clarin.com/mundo/',
          image: 'https://images.unsplash.com/photo-1521295121782-8a321352551d?w=800&h=600&fit=crop',
          category: 'Internacional',
          source: 'Clarín',
          date: 'Hace 2 horas'
        },
        {
          title: 'Avances en cooperación internacional',
          description: 'Los países trabajan juntos para resolver problemas globales.',
          link: 'https://www.clarin.com/mundo/',
          image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop',
          category: 'Internacional',
          source: 'Clarín',
          date: 'Hace 3 horas'
        }
      ],
      'elpais-populares': [
        {
          title: 'Las noticias más leídas del día',
          description: 'Los artículos que han generado más interés entre nuestros lectores.',
          link: 'https://elpais.com/',
          image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop',
          category: 'Destacadas',
          source: 'El País',
          date: 'Hace 1 hora'
        },
        {
          title: 'Viral: El video que está revolucionando las redes',
          description: 'Un contenido que ha generado millones de visualizaciones en todo el mundo.',
          link: 'https://elpais.com/',
          image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&h=600&fit=crop',
          category: 'Viral',
          source: 'El País',
          date: 'Hace 2 horas'
        },
        {
          title: 'Tendencias: Lo que más se busca en internet',
          description: 'Los temas que están generando más búsquedas en los motores de búsqueda.',
          link: 'https://elpais.com/',
          image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop',
          category: 'Tendencias',
          source: 'El País',
          date: 'Hace 3 horas'
        }
      ],
      'tecnologia': [
        {
          title: 'Revolución en la computación cuántica',
          description: 'Los avances en computación cuántica prometen cambiar el futuro de la tecnología.',
          link: '#',
          image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop',
          category: 'Tecnología',
          source: 'HGARUNA',
          date: 'Hace 1 hora'
        },
        {
          title: 'El futuro de los vehículos autónomos',
          description: 'Las empresas automotrices aceleran el desarrollo de coches sin conductor.',
          link: '#',
          image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
          category: 'Tecnología',
          source: 'HGARUNA',
          date: 'Hace 2 horas'
        }
      ],
      'cultura': [
        {
          title: 'Festival de cine internacional',
          description: 'Las mejores películas del año se presentan en el festival más importante.',
          link: '#',
          image: 'https://images.unsplash.com/photo-1489599835382-957519cb7350?w=800&h=600&fit=crop',
          category: 'Cultura',
          source: 'HGARUNA',
          date: 'Hace 1 hora'
        },
        {
          title: 'Nuevos álbumes musicales destacados',
          description: 'Los artistas más populares presentan sus trabajos más recientes.',
          link: '#',
          image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
          category: 'Cultura',
          source: 'HGARUNA',
          date: 'Hace 2 horas'
        }
      ],
      'autos': [
        {
          title: 'Coches eléctricos: La revolución del transporte',
          description: 'Los fabricantes automotrices apuestan por la movilidad sostenible.',
          link: '#',
          image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
          category: 'Autos',
          source: 'HGARUNA',
          date: 'Hace 1 hora'
        },
        {
          title: 'Fórmula 1: Tecnología de vanguardia',
          description: 'Los equipos desarrollan innovaciones para mejorar el rendimiento.',
          link: '#',
          image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
          category: 'Autos',
          source: 'HGARUNA',
          date: 'Hace 2 horas'
        }
      ],
      'lanacion': [
        {
          title: 'La Nación: Análisis político de la semana',
          description: 'Los expertos analizan los acontecimientos políticos más importantes.',
          link: 'https://www.lanacion.com.ar/',
          image: 'https://images.unsplash.com/photo-1495020683877-95802f6f647a?w=800&h=600&fit=crop',
          category: 'Política',
          source: 'La Nación',
          date: 'Hace 1 hora'
        },
        {
          title: 'Economía argentina: Perspectivas para el futuro',
          description: 'Análisis de los indicadores económicos y las proyecciones para el país.',
          link: 'https://www.lanacion.com.ar/',
          image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=600&fit=crop',
          category: 'Economía',
          source: 'La Nación',
          date: 'Hace 2 horas'
        },
        {
          title: 'Cultura: Los eventos más importantes del mes',
          description: 'Una guía completa de los eventos culturales que no te puedes perder.',
          link: 'https://www.lanacion.com.ar/',
          image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop',
          category: 'Cultura',
          source: 'La Nación',
          date: 'Hace 3 horas'
        }
      ],
      'eltiempo': [
        {
          title: 'El Tiempo: Noticias de Colombia y el mundo',
          description: 'Cobertura completa de los acontecimientos más importantes del país.',
          link: 'https://www.eltiempo.com/',
          image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop',
          category: 'Colombia',
          source: 'El Tiempo',
          date: 'Hace 1 hora'
        },
        {
          title: 'Deportes colombianos: Los equipos en acción',
          description: 'Toda la información sobre fútbol, ciclismo y otros deportes del país.',
          link: 'https://www.eltiempo.com/',
          image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=600&fit=crop',
          category: 'Deportes',
          source: 'El Tiempo',
          date: 'Hace 2 horas'
        },
        {
          title: 'Tecnología: El ecosistema digital colombiano',
          description: 'Las startups y empresas tecnológicas que están transformando el país.',
          link: 'https://www.eltiempo.com/',
          image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop',
          category: 'Tecnología',
          source: 'El Tiempo',
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
          source: 'HGARUNA',
          date: 'Hace 1 hora'
        }
      ]
    };
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  console.log('📰 Iniciando Static News Loader...');
  window.staticNewsLoader = new StaticNewsLoader();
}); 