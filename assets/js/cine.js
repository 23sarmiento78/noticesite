document.addEventListener('DOMContentLoaded', function() {
    const parser = new RSSParser();
    const rssFeeds = [
        'https://www.clarin.com/rss/espectaculos/cine/'
    ];
    const itemsPerPage = 15; // Mostrar 15 publicaciones
    let currentPage = 1;
    let allItems = [];

    // Función para obtener la imagen de la noticia
    function obtenerImagenNoticia(item) {
        if (item.enclosure && item.enclosure.url) {
            return item.enclosure.url;
        }
        return 'assets/img/default.jpg'; // Imagen predeterminada si no hay imagen en el feed
    }

    // Función para mostrar noticias en formato de cartas
    function mostrarNoticiasEnCartas(items, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = ''; // Limpiar el contenedor

        items.forEach((item, index) => {
            const imagenNoticia = obtenerImagenNoticia(item); // Obtener imagen de la noticia

            const card = document.createElement('div');
            card.classList.add('col', 'mb-3');
            if (index < 3) { // Las primeras 3 noticias son destacadas
                card.classList.add('featured');
            }
            card.innerHTML = `
                <div class="card h-100">
                    <img src="${imagenNoticia}" class="card-img-top" alt="Imagen de la noticia"  loading="lazy>
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

    // Función para cargar noticias y manejar la paginación
    async function cargarNoticias() {
        allItems = []; // Reiniciar el array de items

        for (const url of rssFeeds) {
            try {
                const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
                if (!response.ok) {
                    throw new Error(`Error en la respuesta del servidor: ${response.status}`);
                }
                const data = await response.json();
                const feed = await parser.parseString(data.contents);
                allItems = allItems.concat(feed.items); // Concatenar todos los items
            } catch (error) {
                console.error(`Error al obtener noticias de ${url}:`, error);
            }
        }

        actualizarPaginacion();
    }

    // Función para actualizar la paginación
    function actualizarPaginacion() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const itemsToShow = allItems.slice(startIndex, endIndex);

        mostrarNoticiasEnCartas(itemsToShow, 'cine-news-cards-container');

        // Actualizar la paginación
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

    // Evento para manejar la paginación
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

    // Cargar noticias al iniciar
    cargarNoticias();
}); 