document.addEventListener('DOMContentLoaded', function() {
    const parser = new RSSParser();
    const rssFeeds = [
        'https://www.clarin.com/rss/espectaculos/cine/',
        'https://www.clarin.com/rss/autos/',
        'https://www.clarin.com/rss/tecnologia/',
        'https://www.clarin.com/rss/deportes/'
    ];
    const itemsPerPage = 15;
    let currentPage = 1;
    let allItems = [];
    const newsContainer = document.getElementById('news-cards-container');
    const paginationContainer = document.querySelector('.pagination');
    const errorMessageDiv = document.getElementById('error-message');

    function obtenerImagenNoticia(item) {
        if (item.enclosure && item.enclosure.url) {
            return item.enclosure.url;
        }
        return 'assets/img/default.jpg';
    }

    function mostrarNoticiasEnCartas(items, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        items.forEach((item, index) => {
            const imagenNoticia = obtenerImagenNoticia(item);
            const card = document.createElement('div');
            card.classList.add('col', 'mb-3');
            if (index < 3) {
                card.classList.add('featured');
            }
            card.innerHTML = `
                <div class="card h-100">
                    <img src="${imagenNoticia}" class="card-img-top" alt="Imagen de la noticia" loading="lazy">
                    <div class="card-body">
                        <h5 class="card-title">${item.title}</h5>
                        <p class="card-text">${item.description}</p>
                        <a href="${item.link}" class="btn btn-primary">Leer más</a>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    async function cargarNoticias() {
        errorMessageDiv.textContent = ''; // Clear previous error
        newsContainer.innerHTML = '<p>Cargando noticias...</p>'; // Show loading message
        allItems = [];

        for (const url of rssFeeds) {
            try {
                const response = await fetch(`http://localhost:3000/rss/${encodeURIComponent(url)}`);
                if (!response.ok) {
                    throw new Error(`Error en la respuesta del servidor: ${response.status}`);
                }
                const data = await response.text();
                const feed = await parser.parseString(data);
                allItems = allItems.concat(feed.items);
            } catch (error) {
                console.error(`Error al obtener noticias de ${url}:`, error);
                errorMessageDiv.textContent = 'Hubo un error al cargar las noticias. Por favor, intente de nuevo más tarde.';
                newsContainer.innerHTML = ''; // Clear loading message
                return; // Stop loading if an error occurs
            }
        }

        actualizarPaginacion();
    }

    function actualizarPaginacion() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const itemsToShow = allItems.slice(startIndex, endIndex);

        mostrarNoticiasEnCartas(itemsToShow, 'news-cards-container');

        const totalPages = Math.ceil(allItems.length / itemsPerPage);
        paginationContainer.innerHTML = '';

        if (currentPage > 1) {
            paginationContainer.innerHTML += `<li class="page-item"><a class="page-link" href="#">Anterior</a></li>`;
        }

        for (let i = 1; i <= totalPages; i++) {
            paginationContainer.innerHTML += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" href="#">${i}</a></li>`;
        }

        if (currentPage < totalPages) {
            paginationContainer.innerHTML += `<li class="page-item"><a class="page-link" href="#">Siguiente</a></li>`;
        }
    }

    paginationContainer.addEventListener('click', function(event) {
        if (event.target.tagName === 'A') {
            const page = event.target.textContent;
            if (page === 'Anterior') {
                if (currentPage > 1) currentPage--;
            } else if (page === 'Siguiente') {
                if (currentPage < Math.ceil(allItems.length / itemsPerPage)) currentPage++;
            } else {
                currentPage = parseInt(page);
            }
            actualizarPaginacion();
        }
    });

    cargarNoticias();
});