document.addEventListener('DOMContentLoaded', function() {
    const parser = new RSSParser();
    const rssFeeds = [
        'https://www.clarin.com/rss/deportes/'
    ];
    const itemsPerPage = 9;
    let currentPage = 1;
    let allItems = [];

    function obtenerImagenNoticia(item) {
        if (item.enclosure && item.enclosure.url) {
            return item.enclosure.url;
        }
        return 'assets/img/default.jpg';
    }

    function mostrarNoticiasEnCarrusel(items, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        let carouselInner = document.createElement('div');
        carouselInner.classList.add('carousel-inner');

        items.forEach((item, index) => {
            const imagenNoticia = obtenerImagenNoticia(item);

            const carouselItem = document.createElement('div');
            carouselItem.classList.add('carousel-item');
            if (index === 0) {
                carouselItem.classList.add('active');
            }
            carouselItem.innerHTML = `
                <img src="${imagenNoticia}" class="d-block w-100" alt="Imagen de la noticia" style="height: 500px; object-fit: cover;">
                <div class="carousel-caption d-none d-md-block" style="background-color: rgba(0, 0, 0, 0.5); padding: 10px;">
                    <h5>${item.title}</h5>
                    <a href="${item.link}" class="btn btn-primary">Leer más</a>
                </div>
            `;
            carouselInner.appendChild(carouselItem);
        });

        container.appendChild(carouselInner);

        container.innerHTML += `
            <a class="carousel-control-prev" href="#${containerId}" role="button" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
            </a>
            <a class="carousel-control-next" href="#${containerId}" role="button" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
            </a>
        `;
    }

    async function cargarNoticias() {
        allItems = [];

        for (const url of rssFeeds) {
            try {
                const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
                if (!response.ok) {
                    throw new Error(`Error en la respuesta del servidor: ${response.status}`);
                }
                const data = await response.json();
                const feed = await parser.parseString(data.contents);
                allItems = allItems.concat(feed.items);
                console.log("Datos RSS recibidos:", feed);
                console.log("Todos los items:", allItems);
            } catch (error) {
                console.error(`Error al obtener noticias de ${url}:`, error);
                document.getElementById('featured-news-carousel').innerHTML = '<p>Error al cargar las noticias. Por favor, inténtelo más tarde.</p>';
                return;
            }
        }

        actualizarPaginacion();
    }

    function actualizarPaginacion() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const itemsToShow = allItems.slice(startIndex, endIndex);

        mostrarNoticiasEnCarrusel(itemsToShow, 'featured-news-carousel');

        const totalPages = Math.ceil(allItems.length / itemsPerPage);
        const paginationContainer = document.querySelector('.pagination');
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

    document.querySelector('.pagination').addEventListener('click', function(event) {
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