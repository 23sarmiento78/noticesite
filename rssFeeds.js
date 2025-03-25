document.addEventListener('DOMContentLoaded', function() {
    const parser = new RSSParser();
    const rssFeeds = [
        {
            title: "Espectáculos",
            url: "https://www.clarin.com/rss/espectaculos/",
            containerId: "categoria1-news-container"
        },
        {
            title: "Cine",
            url: "https://www.clarin.com/rss/espectaculos/cine/",
            containerId: "categoria2-news-container"
        },
        {
            title: "Fútbol",
            url: "https://www.clarin.com/rss/deportes/",
            containerId: "categoria3-news-container"
        },
        {
            title: "Tecnología",
            url: "https://www.clarin.com/rss/tecnologia/",
            containerId: "tecnologia-news-container"
        },
        {
            title: "buena-vida",
            url: "https://www.clarin.com/rss/buena-vida/",
            containerId: "buena-vida-news-container"
        },
        {
            title: "tecnologia",
            url: "https://www.clarin.com/rss/tecnologia/",
            containerId: "categoria4-news-container"
        },
        {
            title: "politica",
            url: "https://www.clarin.com/rss/politica/",
            containerId: "categoria5-news-container"
        },
        {
            title: "cultura",
            url: "https://www.clarin.com/rss/cultura/",
            containerId: "categoria6-news-container"
        },
        {
            title: "mundo",
            url: "https://www.clarin.com/rss/mundo/",
            containerId: "categoria7-news-container"
        },
        {
            title: "Autos",
            url: "https://www.clarin.com/rss/autos/",
            containerId: "categoria8--news-container"
        },
        {
            title: "viajes",
            url: "https://www.clarin.com/rss/viajes/",
            containerId: "categoria9-news-container"
        },
        {
            title: "viajes",
            url: "https://www.clarin.com/rss/internacional/",
            containerId: "categoria10-news-container"
        },
    ];
    const itemsPerPage = 12;
    let allItems = {};
    let currentPage = {};

    rssFeeds.forEach(feed => {
        currentPage[feed.containerId] = 1;
        allItems[feed.containerId] =[];
    });

    function obtenerImagenNoticia(item) {
        if (item.enclosure && item.enclosure.url) {
            return item.enclosure.url;
        }
        return 'assets/img/default.jpg';
    }

    function mostrarNoticiasEnCartas(items, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const newsGrid = container.querySelector('.news-grid'); // Selector corregido
        if (!newsGrid) return;
        newsGrid.innerHTML = '';

        items.forEach((item, index) => {
            const imagenNoticia = obtenerImagenNoticia(item);
            const col = document.createElement('div');
            col.style.width = 'calc(33.33% - 20px)';
            col.innerHTML = `
                <div class="card h-100" itemscope itemtype="http://schema.org/NewsArticle">
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
                        <p class="card-text"><small class="text-body-secondary">Publicado: ${new Date(item.pubDate).toLocaleTimeString()}</small></p>
                    </div>
                </div>
            `;
            newsGrid.appendChild(col);
        });
    }

    async function cargarNoticias() {
        for (const feed of rssFeeds) {
            try {
                const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`);
                if (!response.ok) {
                    throw new Error(`Error en la respuesta del servidor: ${response.status}`);
                }
                const data = await response.json();
                const parsedFeed = await parser.parseString(data.contents);
                allItems[feed.containerId] = parsedFeed.items;
                actualizarPaginacion(feed.containerId);
            } catch (error) {
                console.error(`Error al obtener noticias de ${feed.title}:`, error);
            }
        }
    }

    function actualizarPaginacion(containerId) {
        const startIndex = (currentPage[containerId] - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const itemsToShow = allItems[containerId].slice(startIndex, endIndex);
        mostrarNoticiasEnCartas(itemsToShow, containerId);

        const totalPages = Math.ceil(allItems[containerId].length / itemsPerPage);
        const paginationContainer = document.querySelector(`.${containerId}-pagination`);
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';

        if (currentPage[containerId] > 1) {
            paginationContainer.innerHTML += `<li class="page-item"><a class="page-link" href="#" data-page="anterior" data-container="${containerId}">Anterior</a></li>`;
        }
        for (let i = 1; i <= totalPages; i++) {
            paginationContainer.innerHTML += `<li class="page-item ${i === currentPage[containerId] ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}" data-container="${containerId}">${i}</a></li>`;
        }
        if (currentPage[containerId] < totalPages) {
            paginationContainer.innerHTML += `<li class="page-item"><a class="page-link" href="#" data-page="siguiente" data-container="${containerId}">Siguiente</a></li>`;
        }
    }

    document.addEventListener('click', function(event) {
        if (event.target.tagName === 'A' && event.target.dataset.page && event.target.dataset.container) {
            const page = event.target.dataset.page;
            const containerId = event.target.dataset.container;
            if (page === 'anterior') {
                if (currentPage[containerId] > 1) currentPage[containerId]--;
            } else if (page === 'siguiente') {
                if (currentPage[containerId] < Math.ceil(allItems[containerId].length / itemsPerPage)) currentPage[containerId]++;
            } else {
                currentPage[containerId] = parseInt(page);
            }
            actualizarPaginacion(containerId);
        }
    });

    cargarNoticias();
});