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
    // El País España
    {
      title: "El País Internacional",
      url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/internacional",
      containerId: "elpais-internacional-container",
      fuente: "El País",
    },
    {
      title: "El País Economía",
      url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/economia",
      containerId: "elpais-economia-container",
      fuente: "El País",
    },
    {
      title: "El País Deportes",
      url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/deportes",
      containerId: "elpais-deportes-container",
      fuente: "El País",
    },
    {
      title: "El País Tecnología",
      url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/tecnologia",
      containerId: "elpais-tech-container",
      fuente: "El País",
    },
    {
      title: "El País Cultura",
      url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/cultura",
      containerId: "elpais-cultura-container",
      fuente: "El País",
    },
    // BBC Mundo
    {
      title: "BBC Mundo",
      url: "https://feeds.bbci.co.uk/mundo/rss.xml",
      containerId: "bbc-mundo-container",
      fuente: "BBC",
    },
    // Alternativas usando nuestro propio endpoint RSS
    {
      title: "La Nación Argentina",
      url: "/rss/https%3A%2F%2Fwww.lanacion.com.ar%2Frss",
      containerId: "lanacion-container",
      fuente: "La Nación",
    },
    {
      title: "El Tiempo Colombia",
      url: "/rss/https%3A%2F%2Fwww.eltiempo.com%2Frss",
      containerId: "eltiempo-container",
      fuente: "El Tiempo",
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
      col.innerHTML = `
                <div class="card h-100" itemscope itemtype="http://schema.org/NewsArticle">
                    <span class="badge bg-primary mb-2" style="position:absolute;top:10px;left:10px;z-index:2;">${categoria}</span>
                    <meta itemprop="datePublished" content="${item.pubDate}" />
                    <meta itemprop="dateModified" content="${item.pubDate}" />
                    <div itemprop="image" itemscope itemtype="https://schema.org/ImageObject">
                        <meta itemprop="url" content="${imagenNoticia}" />
                        <meta itemprop="width" content="800" />
                        <meta itemprop="height" content="600" />
                    </div>
                    <img src="${imagenNoticia}" class="card-img-top" alt="${item.title}" loading="lazy" itemprop="image">
                    <div class="card-body">
                        <h5 itemprop="headline">${item.title}</h5>
                        <p class="card-text" itemprop="description">${item.description}</p>
                        <a href="${item.link}" class="btn btn-primary" itemprop="url">Leer más</a>
                        <p class="card-text"><small>Publicado: ${new Date(item.pubDate).toLocaleTimeString()}</small></p>
                    </div>
                </div>
            `;
      rowContainer.appendChild(col);
    });
  }

  // Modificar mostrarNoticiasDestacadas para guardar copia
  function mostrarNoticiasDestacadas() {
    let todasNoticias = [];
    Object.values(allItems).forEach((arr) => {
      todasNoticias = todasNoticias.concat(arr);
    });
    todasNoticias.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    const destacadas = todasNoticias.slice(0, 3);
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
      col.innerHTML = `
                <div class="card h-100 shadow-lg" itemscope itemtype="http://schema.org/NewsArticle">
                    <span class="badge bg-primary mb-2" style="position:absolute;top:10px;left:10px;z-index:2;">${categoria}</span>
                    <meta itemprop="datePublished" content="${item.pubDate}" />
                    <img src="${imagenNoticia}" class="card-img-top" alt="${item.title}" loading="lazy" itemprop="image">
                    <div class="card-body">
                        <h5 itemprop="headline">${item.title}</h5>
                        <p class="card-text" itemprop="description">${item.description}</p>
                        <a href="${item.link}" class="btn btn-primary" itemprop="url" target="_blank">Leer más</a>
                        <p class="card-text"><small>Publicado: ${new Date(item.pubDate).toLocaleTimeString()}</small></p>
                    </div>
                </div>
            `;
      container.appendChild(col);
    });
  }

  // Guardar copia de allItems después de cargar
  async function cargarNoticias() {
    for (const feed of rssFeeds) {
      try {
        const response = await fetch(
          `https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`,
        );
        if (!response.ok) {
          throw new Error(
            `Error en la respuesta del servidor: ${response.status}`,
          );
        }
        const data = await response.json();
        const parsedFeed = await parser.parseString(data.contents);
        allItems[feed.containerId] = parsedFeed.items;
        actualizarPaginacion(feed.containerId);
      } catch (error) {
        console.error(`Error al obtener noticias de ${feed.title}:`, error);
      }
    }
    // Guardar copia para búsqueda
    copiaAllItems = JSON.parse(JSON.stringify(allItems));
    mostrarNoticiasDestacadas();
  }

  function actualizarPaginacion(containerId) {
    const startIndex = (currentPage[containerId] - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
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
