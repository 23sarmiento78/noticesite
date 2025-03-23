document.addEventListener('DOMContentLoaded', function() {
    const parser = new RSSParser();
    const rssFeeds = [
        {
            title: "Autos",
            url: "https://www.clarin.com/rss/autos/"
        },
        {
            title: "Espectáculos",
            url: "https://www.clarin.com/rss/espectaculos/"
        },
        {
            title: "Cine",
            url: "https://www.clarin.com/rss/espectaculos/cine/"
        },
        {
            title: "Fútbol",
            url: "https://www.clarin.com/rss/deportes/"
        }
    ];
    const itemsPerPage = 30; // Mostrar 30 publicaciones
    let currentPage = 1;
    let allItems = [];
    const carouselNewsContainer = document.getElementById('carouselNewsContainer');

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

        items.forEach((item) => {
            const imagenNoticia = obtenerImagenNoticia(item); // Obtener imagen de la noticia

            const card = document.createElement('div');
            card.classList.add('col', 'mb-3');
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

    // Función para cargar noticias y manejar la paginación
    async function cargarNoticias() {
        allItems = []; // Reiniciar el array de items

        for (const feed of rssFeeds) {
            try {
                const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`);
                if (!response.ok) {
                    throw new Error(`Error en la respuesta del servidor: ${response.status}`);
                }
                const data = await response.json();
                const parsedFeed = await parser.parseString(data.contents);
                allItems = allItems.concat(parsedFeed.items); // Concatenar todos los items
            } catch (error) {
                console.error(`Error al obtener noticias de ${feed.title}:`, error);
            }
        }

        // Mostrar noticias en el carrusel
        mostrarNoticiasEnCartas(allItems.filter(item => item.title.includes("Autos")), 'carouselNewsContainer');

        // Mostrar noticias en las categorías
        mostrarNoticiasEnCartas(allItems.filter(item => item.title.includes("Espectáculos")), 'categoria1-news-container');
        mostrarNoticiasEnCartas(allItems.filter(item => item.title.includes("Cine")), 'categoria2-news-container');
        mostrarNoticiasEnCartas(allItems.filter(item => item.title.includes("Fútbol")), 'categoria3-news-container');
    }

    // Función para actualizar la paginación
    function actualizarPaginacion() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const itemsToShow = allItems.slice(startIndex, endIndex);

        mostrarNoticiasEnCartas(itemsToShow, 'news-cards-container');

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

    // Función para cargar noticias desde un archivo específico
    function loadNewsFromFile(file) {
        fetch(file)
            .then(response => response.json())
            .then(data => {
                data.forEach((newsItem, index) => {
                    const carouselItem = document.createElement('div');
                    carouselItem.className = index === 0 ? 'carousel-item active' : 'carousel-item';
                    carouselItem.innerHTML = `
                        <img src="${newsItem.image}" class="d-block w-100" alt="${newsItem.title}">
                        <div class="carousel-caption d-none d-md-block">
                            <h5>${newsItem.title}</h5>
                            <p>${newsItem.description}</p>
                        </div>
                    `;
                    carouselNewsContainer.appendChild(carouselItem);
                });
            })
            .catch(error => console.error('Error al cargar las noticias:', error));
    }

    // Cargar noticias de los diferentes archivos
    loadNewsFromFile('assets/js/ultimo.js');
    loadNewsFromFile('assets/js/deportes.js');
    loadNewsFromFile('assets/js/cine.js');

    // Cargar noticias al iniciar
    cargarNoticias();
});