document.addEventListener("DOMContentLoaded", function () {
  const parser = new RSSParser();
  const rssFeeds = [
    // Clarín Argentina
    {
      title: "Espectáculos",
      url: "https://www.clarin.com/rss/espectaculos/",
      containerId: "categoria1-news-container",
      fuente: "Clarín",
    },
    {
      title: "Cine",
      url: "https://www.clarin.com/rss/espectaculos/cine/",
      containerId: "categoria2-news-container",
      fuente: "Clarín",
    },
    {
      title: "Fútbol",
      url: "https://www.clarin.com/rss/deportes/",
      containerId: "categoria3-news-container",
      fuente: "Clarín",
    },
    {
      title: "Tecnología",
      url: "https://www.clarin.com/rss/tecnologia/",
      containerId: "tecnologia-news-container",
      fuente: "Clarín",
    },
    {
      title: "Política",
      url: "https://www.clarin.com/rss/politica/",
      containerId: "categoria5-news-container",
      fuente: "Clarín",
    },
    {
      title: "Cultura",
      url: "https://www.clarin.com/rss/cultura/",
      containerId: "categoria6-news-container",
      fuente: "Clarín",
    },
    {
      title: "Internacional",
      url: "https://www.clarin.com/rss/mundo/",
      containerId: "categoria7-news-container",
      fuente: "Clarín",
    },
    {
      title: "Autos",
      url: "https://www.clarin.com/rss/autos/",
      containerId: "categoria8-news-container",
      fuente: "Clarín",
    },
    // BBC Mundo (usando allorigins para evitar CORS)
    {
      title: "BBC Mundo",
      url: "https://api.allorigins.win/get?url=http%3A%2F%2Ffeeds.bbci.co.uk%2Fmundo%2Frss.xml",
      containerId: "bbc-mundo-container",
      fuente: "BBC",
    },
    // La Nación Argentina usando nuestro endpoint
    {
      title: "La Nación Argentina",
      url: "/rss/http%3A%2F%2Fwww.lanacion.com.ar%2Frss%2Fportada",
      containerId: "lanacion-container",
      fuente: "La Nación",
    },
    // El Tiempo Colombia usando nuestro endpoint
    {
      title: "El Tiempo Colombia",
      url: "/rss/https%3A%2F%2Fwww.eltiempo.com%2Frss%2Fcolombia.xml",
      containerId: "eltiempo-container",
      fuente: "El Tiempo",
    },
    // El País España usando allorigins
    {
      title: "El País Internacional",
      url: "https://api.allorigins.win/get?url=https%3A%2F%2Ffeeds.elpais.com%2Fmrss-s%2Fpages%2Fep%2Fsite%2Felpais.com%2Finternacional",
      containerId: "elpais-internacional-container",
      fuente: "El País",
    },
    {
      title: "El País Economía",
      url: "https://api.allorigins.win/get?url=https%3A%2F%2Ffeeds.elpais.com%2Fmrss-s%2Fpages%2Fep%2Fsite%2Felpais.com%2Feconomia",
      containerId: "elpais-economia-container",
      fuente: "El País",
    },
    {
      title: "El País Deportes",
      url: "https://api.allorigins.win/get?url=https%3A%2F%2Ffeeds.elpais.com%2Fmrss-s%2Fpages%2Fep%2Fsite%2Felpais.com%2Fdeportes",
      containerId: "elpais-deportes-container",
      fuente: "El País",
    },
    {
      title: "El País Tecnología",
      url: "https://api.allorigins.win/get?url=https%3A%2F%2Ffeeds.elpais.com%2Fmrss-s%2Fpages%2Fep%2Fsite%2Felpais.com%2Ftecnologia",
      containerId: "elpais-tech-container",
      fuente: "El País",
    },
    {
      title: "El País Cultura",
      url: "https://api.allorigins.win/get?url=https%3A%2F%2Ffeeds.elpais.com%2Fmrss-s%2Fpages%2Fep%2Fsite%2Felpais.com%2Fcultura",
      containerId: "elpais-cultura-container",
      fuente: "El País",
    },
  ];
  const itemsPerPage = 12;
  let allItems = {};
  let currentPage = {};

  rssFeeds.forEach((feed) => {
    currentPage[feed.containerId] = 1;
    allItems[feed.containerId] = [];
  });

  // Guardar copia de todas las noticias para búsqueda
  let copiaAllItems = {};
  let copiaDestacadas = [];

  // Mapeo de containerId a categoría
  const containerIdToCategoria = {};
  rssFeeds.forEach((feed) => {
    containerIdToCategoria[feed.containerId] = feed.title;
  });

  function obtenerImagenNoticia(item) {
    if (item.enclosure && item.enclosure.url) {
      return item.enclosure.url;
    }
    return "assets/img/default.jpg";
  }

  // Modificar mostrarNoticiasEnCartas para aceptar items filtrados
  function mostrarNoticiasEnCartas(items, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const rowContainer = container.querySelector(
      ".row.row-cols-1.row-cols-md-3.g-4",
    );
    if (!rowContainer) return;
    rowContainer.innerHTML = "";
    if (items.length === 0) {
      rowContainer.innerHTML =
        '<div class="col"><div class="alert alert-warning text-center">No se encontraron resultados.</div></div>';
      return;
    }
    items.forEach((item) => {
      const imagenNoticia = obtenerImagenNoticia(item);
      // Buscar la categoría por containerId
      let categoria = "";
      for (const [cid, arr] of Object.entries(allItems)) {
        if (arr.includes(item)) {
          categoria = containerIdToCategoria[cid] || "";
          break;
        }
      }
      const col = document.createElement("div");
      col.classList.add("col");
      // Buscar fuente del feed
      let fuente = "Fuente";
      for (const feed of rssFeeds) {
        if (feed.containerId === containerId) {
          fuente = feed.fuente || feed.title;
          break;
        }
      }

      col.innerHTML = `
                <article class="card h-100 news-card" itemscope itemtype="http://schema.org/NewsArticle" style="border: none; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.15); transition: all 0.3s ease;">
                    <div class="position-relative">
                        <img src="${imagenNoticia}" class="card-img-top news-image" alt="${item.title}" loading="lazy" itemprop="image" style="height: 200px; object-fit: cover; transition: transform 0.3s ease;">
                        <div class="overlay-gradient" style="position: absolute; bottom: 0; left: 0; right: 0; height: 50%; background: linear-gradient(transparent, rgba(0,0,0,0.7)); pointer-events: none;"></div>
                        <span class="badge category-badge" style="position: absolute; top: 12px; left: 12px; background: #bfa046; color: #111; font-weight: 600; padding: 6px 12px; border-radius: 20px; font-size: 0.75rem;">${categoria}</span>
                        <span class="badge source-badge" style="position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,0.9); color: #111; font-weight: 500; padding: 4px 8px; border-radius: 15px; font-size: 0.7rem;">${fuente}</span>
                    </div>
                    <div class="card-body d-flex flex-column" style="padding: 1.5rem;">
                        <h5 class="card-title news-headline" itemprop="headline" style="color: #bfa046; font-weight: 700; line-height: 1.3; margin-bottom: 0.75rem; font-size: 1.1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${item.title}</h5>
                        <p class="card-text news-description flex-grow-1" itemprop="description" style="color: #ccc; line-height: 1.5; font-size: 0.9rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 1rem;">${item.description}</p>
                        <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <small class="text-muted" style="color: #888 !important;">
                                    <i class="bi bi-clock"></i> ${new Date(
                                      item.pubDate,
                                    ).toLocaleDateString("es-ES", {
                                      day: "numeric",
                                      month: "short",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                </small>
                            </div>
                            <a href="${item.link}" class="btn btn-outline-warning btn-sm w-100" itemprop="url" target="_blank" style="border-color: #bfa046; color: #bfa046; font-weight: 600; transition: all 0.3s ease;">
                                <i class="bi bi-arrow-right"></i> Leer completo
                            </a>
                        </div>
                    </div>
                    <meta itemprop="datePublished" content="${item.pubDate}" />
                    <meta itemprop="dateModified" content="${item.pubDate}" />
                    <div itemprop="image" itemscope itemtype="https://schema.org/ImageObject">
                        <meta itemprop="url" content="${imagenNoticia}" />
                        <meta itemprop="width" content="800" />
                        <meta itemprop="height" content="600" />
                    </div>
                </article>
            `;
      rowContainer.appendChild(col);
    });
  }

  // Modificar mostrarNoticiasDestacadas para guardar copia y diversificar fuentes
  function mostrarNoticiasDestacadas() {
    let todasNoticias = [];

    // Priorizar noticias de diferentes fuentes para diversidad
    const fuentes = [
      "elpais",
      "bbc",
      "categoria5",
      "categoria7",
      "lanacion",
      "eltiempo",
    ];
    let noticiasSeleccionadas = [];

    // Intentar obtener una noticia de cada fuente principal
    fuentes.forEach((fuente) => {
      const containerIds = Object.keys(allItems).filter((id) =>
        id.includes(fuente),
      );
      containerIds.forEach((containerId) => {
        if (allItems[containerId] && allItems[containerId].length > 0) {
          const noticia = allItems[containerId][0]; // Tomar la primera (más reciente)
          if (
            noticia &&
            !noticiasSeleccionadas.find((n) => n.title === noticia.title)
          ) {
            noticiasSeleccionadas.push(noticia);
          }
        }
      });
    });

    // Si no tenemos suficientes, agregar del resto
    Object.values(allItems).forEach((arr) => {
      todasNoticias = todasNoticias.concat(arr);
    });
    todasNoticias.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    // Completar hasta 3 noticias si es necesario
    todasNoticias.forEach((noticia) => {
      if (
        noticiasSeleccionadas.length < 3 &&
        !noticiasSeleccionadas.find((n) => n.title === noticia.title)
      ) {
        noticiasSeleccionadas.push(noticia);
      }
    });

    const destacadas = noticiasSeleccionadas.slice(0, 3);
    copiaDestacadas = destacadas;
    const container = document.getElementById("destacadas-news-row");
    if (!container) return;
    container.innerHTML = "";
    if (destacadas.length === 0) {
      container.innerHTML =
        '<div class="col"><div class="alert alert-warning text-center">No se encontraron resultados.</div></div>';
      return;
    }
    destacadas.forEach((item) => {
      // Buscar la categoría por containerId
      let categoria = "";
      for (const [cid, arr] of Object.entries(allItems)) {
        if (arr.includes(item)) {
          categoria = containerIdToCategoria[cid] || "";
          break;
        }
      }
      const imagenNoticia = obtenerImagenNoticia(item);
      const col = document.createElement("div");
      col.classList.add("col");
      // Buscar fuente del feed
      let fuente = "Fuente";
      for (const feed of rssFeeds) {
        for (const [cid, arr] of Object.entries(allItems)) {
          if (arr.includes(item)) {
            const feedMatch = rssFeeds.find((f) => f.containerId === cid);
            if (feedMatch) {
              fuente = feedMatch.fuente || feedMatch.title;
            }
            break;
          }
        }
      }

      col.innerHTML = `
                <article class="card h-100 featured-news-card" itemscope itemtype="http://schema.org/NewsArticle" style="border: none; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 40px rgba(191,160,70,0.2); transition: all 0.3s ease; background: linear-gradient(145deg, #1a1a1a 0%, #222 100%);">
                    <div class="position-relative">
                        <img src="${imagenNoticia}" class="card-img-top featured-image" alt="${item.title}" loading="lazy" itemprop="image" style="height: 250px; object-fit: cover; transition: transform 0.4s ease;">
                        <div class="overlay-gradient" style="position: absolute; bottom: 0; left: 0; right: 0; height: 60%; background: linear-gradient(transparent, rgba(0,0,0,0.8)); pointer-events: none;"></div>
                        <span class="badge featured-badge" style="position: absolute; top: 15px; left: 15px; background: linear-gradient(45deg, #bfa046, #d4b564); color: #111; font-weight: 700; padding: 8px 15px; border-radius: 25px; font-size: 0.8rem; box-shadow: 0 4px 15px rgba(191,160,70,0.4);">⭐ DESTACADA</span>
                        <span class="badge source-badge" style="position: absolute; top: 15px; right: 15px; background: rgba(255,255,255,0.95); color: #111; font-weight: 600; padding: 6px 12px; border-radius: 20px; font-size: 0.75rem;">${fuente}</span>
                        <span class="badge category-badge-featured" style="position: absolute; bottom: 15px; left: 15px; background: rgba(191,160,70,0.9); color: #111; font-weight: 600; padding: 6px 12px; border-radius: 20px; font-size: 0.75rem;">${categoria}</span>
                    </div>
                    <div class="card-body d-flex flex-column" style="padding: 2rem;">
                        <h4 class="card-title featured-headline" itemprop="headline" style="color: #bfa046; font-weight: 800; line-height: 1.2; margin-bottom: 1rem; font-size: 1.3rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${item.title}</h4>
                        <p class="card-text featured-description flex-grow-1" itemprop="description" style="color: #ddd; line-height: 1.6; font-size: 1rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 1.5rem;">${item.description}</p>
                        <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <small class="featured-date" style="color: #bfa046; font-weight: 500;">
                                    <i class="bi bi-calendar"></i> ${new Date(
                                      item.pubDate,
                                    ).toLocaleDateString("es-ES", {
                                      day: "numeric",
                                      month: "long",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                </small>
                            </div>
                            <a href="${item.link}" class="btn btn-warning w-100" itemprop="url" target="_blank" style="background: linear-gradient(45deg, #bfa046, #d4b564); border: none; color: #111; font-weight: 700; padding: 12px; border-radius: 8px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(191,160,70,0.3);">
                                <i class="bi bi-newspaper"></i> Leer noticia completa
                            </a>
                        </div>
                    </div>
                    <meta itemprop="datePublished" content="${item.pubDate}" />
                </article>
            `;
      container.appendChild(col);
    });
  }

  // Guardar copia de allItems después de cargar
  async function cargarNoticias() {
    for (const feed of rssFeeds) {
      try {
        let response;
        if (feed.url.startsWith("/rss/")) {
          // Usar nuestro propio endpoint RSS
          response = await fetch(feed.url);
        } else if (feed.url.includes("api.allorigins.win")) {
          // Para feeds usando allorigins
          response = await fetch(feed.url);
        } else {
          // Para otros feeds, usar allorigins como fallback
          response = await fetch(
            `https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`,
          );
        }

        if (!response.ok) {
          throw new Error(
            `Error en la respuesta del servidor: ${response.status}`,
          );
        }

        let parsedFeed;
        if (feed.url.startsWith("/rss/")) {
          // Nuestro endpoint devuelve JSON directamente
          const data = await response.json();
          parsedFeed = data;
        } else if (
          feed.url.includes("bbci.co.uk") ||
          feed.url.includes("elpais.com")
        ) {
          // Feeds XML directos
          const xmlText = await response.text();
          parsedFeed = await parser.parseString(xmlText);
        } else {
          // AllOrigins
          const data = await response.json();
          parsedFeed = await parser.parseString(data.contents);
        }

        allItems[feed.containerId] = parsedFeed.items || [];
        actualizarPaginacion(feed.containerId);
      } catch (error) {
        console.error(`Error al obtener noticias de ${feed.title}:`, error);
        // Inicializar como array vacío en caso de error
        allItems[feed.containerId] = [];
      }
    }
    // Guardar copia para búsqueda
    copiaAllItems = JSON.parse(JSON.stringify(allItems));
    mostrarNoticiasDestacadas();
  }

  function actualizarPaginacion(containerId) {
    // Definir límites por sección para mejor experiencia visual
    let maxItems = itemsPerPage;
    if (
      containerId.includes("elpais") ||
      containerId.includes("bbc") ||
      containerId.includes("lanacion") ||
      containerId.includes("eltiempo")
    ) {
      maxItems = 6; // Mostrar menos para fuentes internacionales
    }

    const startIndex = (currentPage[containerId] - 1) * maxItems;
    const endIndex = startIndex + maxItems;
    const itemsToShow = allItems[containerId].slice(startIndex, endIndex);
    mostrarNoticiasEnCartas(itemsToShow, containerId);

    const totalPages = Math.ceil(allItems[containerId].length / itemsPerPage);
    const paginationContainer = document.querySelector(
      `.${containerId}-pagination`,
    );
    if (!paginationContainer) return;
    paginationContainer.innerHTML = "";

    if (currentPage[containerId] > 1) {
      paginationContainer.innerHTML += `<li class="page-item"><a class="page-link" href="#" data-page="anterior" data-container="${containerId}">Anterior</a></li>`;
    }
    for (let i = 1; i <= totalPages; i++) {
      paginationContainer.innerHTML += `<li class="page-item ${i === currentPage[containerId] ? "active" : ""}"><a class="page-link" href="#" data-page="${i}" data-container="${containerId}">${i}</a></li>`;
    }
    if (currentPage[containerId] < totalPages) {
      paginationContainer.innerHTML += `<li class="page-item"><a class="page-link" href="#" data-page="siguiente" data-container="${containerId}">Siguiente</a></li>`;
    }
  }

  document.addEventListener("click", function (event) {
    if (
      event.target.tagName === "A" &&
      event.target.dataset.page &&
      event.target.dataset.container
    ) {
      const page = event.target.dataset.page;
      const containerId = event.target.dataset.container;
      if (page === "anterior") {
        if (currentPage[containerId] > 1) currentPage[containerId]--;
      } else if (page === "siguiente") {
        if (
          currentPage[containerId] <
          Math.ceil(allItems[containerId].length / itemsPerPage)
        )
          currentPage[containerId]++;
      } else {
        currentPage[containerId] = parseInt(page);
      }
      actualizarPaginacion(containerId);
    }
  });

  // Buscador global mejorado
  const buscador = document.getElementById("buscador-global");
  const resultadosBox = document.getElementById("buscador-resultados");
  if (buscador && resultadosBox) {
    buscador.addEventListener("input", function () {
      const texto = buscador.value.trim().toLowerCase();
      resultadosBox.innerHTML = "";
      if (!texto) {
        resultadosBox.style.display = "none";
        return;
      }
      // Unir todas las noticias de todos los feeds
      let todasNoticias = [];
      Object.entries(allItems).forEach(([cid, arr]) => {
        arr.forEach((item) => {
          todasNoticias.push({
            ...item,
            categoria: containerIdToCategoria[cid],
          });
        });
      });
      // Filtrar por título o categoría
      const filtradas = todasNoticias.filter(
        (item) =>
          (item.title && item.title.toLowerCase().includes(texto)) ||
          (item.categoria && item.categoria.toLowerCase().includes(texto)),
      );
      if (filtradas.length === 0) {
        resultadosBox.innerHTML =
          '<div class="list-group-item text-center text-muted">No se encontraron resultados.</div>';
        resultadosBox.style.display = "block";
        return;
      }
      filtradas.slice(0, 10).forEach((item) => {
        const div = document.createElement("div");
        div.className =
          "list-group-item d-flex justify-content-between align-items-center";
        div.innerHTML = `
                    <span>${item.title}</span>
                    <span class="badge bg-primary">${item.categoria}</span>
                `;
        div.onclick = () => window.open(item.link, "_blank");
        resultadosBox.appendChild(div);
      });
      resultadosBox.style.display = "block";
    });
    // Ocultar resultados al perder foco
    buscador.addEventListener("blur", function () {
      setTimeout(() => {
        resultadosBox.style.display = "none";
      }, 200);
    });
    buscador.addEventListener("focus", function () {
      if (buscador.value.trim()) resultadosBox.style.display = "block";
    });
  }

  cargarNoticias();
});
