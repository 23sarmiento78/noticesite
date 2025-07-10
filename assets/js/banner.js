document.addEventListener("DOMContentLoaded", function () {
  const parser = new RSSParser();
  const rssFeeds = ["https://www.clarin.com/rss/deportes/"];
  const itemsPerPage = 9;
  let currentPage = 1;
  let allItems = [];

  // Función para esperar entre requests
  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Función para manejar retry con backoff exponencial
  async function fetchWithRetry(url, options = {}, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);

        if (response.status === 429) {
          const retryAfter = response.headers.get("retry-after");
          const waitTime = retryAfter
            ? parseInt(retryAfter) * 1000
            : Math.pow(2, attempt) * 1000;
          console.log(
            `⏳ Rate limited. Esperando ${waitTime / 1000}s antes del reintento ${attempt}/${maxRetries}`,
          );
          await delay(waitTime);
          continue;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        console.log(
          `⚠️ Intento ${attempt} falló, reintentando en ${Math.pow(2, attempt)}s...`,
        );
        await delay(Math.pow(2, attempt) * 1000);
      }
    }
  }

  function obtenerImagenNoticia(item) {
    if (item.enclosure && item.enclosure.url) {
      return item.enclosure.url;
    }
    return "assets/img/default.jpg";
  }

  // Cache para elementos DOM
  let cachedContainer = null;

  function mostrarNoticiasEnCarrusel(items, containerId) {
    // Optimización: cache del elemento DOM
    if (!cachedContainer) {
      cachedContainer = document.getElementById("carousel-inner-news");
      if (!cachedContainer) {
        console.error("Elemento carousel-inner-news no encontrado");
        return;
      }
    }

    // Optimización: usar DocumentFragment para operaciones DOM batch
    const fragment = document.createDocumentFragment();
    const carouselInner = document.createElement("div");
    carouselInner.classList.add("carousel-inner");

    // Optimización: usar requestAnimationFrame para operaciones DOM no críticas
    requestAnimationFrame(() => {
      items.forEach((item, index) => {
        const imagenNoticia = obtenerImagenNoticia(item);

        const carouselItem = document.createElement("div");
        carouselItem.classList.add("carousel-item");
        if (index === 0) {
          carouselItem.classList.add("active");
        }

        // Optimización: crear elementos en lugar de innerHTML
        const img = document.createElement("img");
        img.src = imagenNoticia;
        img.className = "d-block w-100";
        img.alt = "Imagen de la noticia";
        img.style.cssText = "height: 500px; object-fit: cover;";

        const caption = document.createElement("div");
        caption.className = "carousel-caption d-none d-md-block";
        caption.style.cssText =
          "background-color: rgba(0, 0, 0, 0.5); padding: 10px;";

        const title = document.createElement("h5");
        title.textContent = item.title || "Sin título";

        const link = document.createElement("a");
        link.href = item.link || "#";
        link.className = "btn btn-primary";
        link.textContent = "Leer más";
        link.target = "_blank";
        link.rel = "noopener";

        caption.appendChild(title);
        caption.appendChild(link);
        carouselItem.appendChild(img);
        carouselItem.appendChild(caption);
        carouselInner.appendChild(carouselItem);
      });

      fragment.appendChild(carouselInner);

      // Limpiar y agregar nuevo contenido de forma eficiente
      cachedContainer.textContent = ""; // Más eficiente que innerHTML = ''
      cachedContainer.appendChild(fragment);
    });

    // Se mantiene el resto del código para los controles del carrusel.
  }

  async function cargarNoticias() {
    allItems = [];

    for (let i = 0; i < rssFeeds.length; i++) {
      const url = rssFeeds[i];
      try {
        // Agregar delay entre requests para evitar rate limiting
        if (i > 0) {
          await delay(1000); // 1 segundo entre requests
        }

        let response;
        let data;

        try {
          // Intentar fetch directo primero
          response = await fetchWithRetry(url, {}, 2);
          const xmlText = await response.text();
          const feed = await parser.parseString(xmlText);
          allItems = allItems.concat(feed.items);
          console.log(`✓ Carga directa exitosa para ${url}`);
        } catch (directError) {
          console.log(`⚠️ Fetch directo falló, intentando con proxy CORS...`);
          // Fallback a proxy CORS
          response = await fetchWithRetry(
            `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
          );
          data = await response.json();
          const feed = await parser.parseString(data.contents);
          allItems = allItems.concat(feed.items);
          console.log(`✓ Proxy CORS exitoso para ${url}`);
        }
        // Ya manejado en el try-catch anterior
        console.log("Datos RSS recibidos:", feed);
        console.log("Todos los items:", allItems);
      } catch (error) {
        console.error(`Error al obtener noticias de ${url}:`, error);
        document.getElementById("carousel-inner-news").innerHTML =
          "<p>Error al cargar las noticias. Por favor, inténtelo más tarde.</p>"; // ID corregido
        return;
      }
    }

    mostrarNoticiasEnCarrusel(
      allItems.slice(0, itemsPerPage),
      "carousel-inner-news",
    );
  }

  cargarNoticias();
});
