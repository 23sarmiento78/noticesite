document.addEventListener('DOMContentLoaded', function() {
    const parser = new RSSParser();

    // Enlace RSS de Clarín Deportes
    const rssFeeds = [
        'https://www.clarin.com/rss/deportes/'
    ];

    // Función para obtener la imagen de la noticia
    function obtenerImagenNoticia(item) {
        if (item.enclosure && item.enclosure.url) {
            console.log(`Imagen encontrada: ${item.enclosure.url}`);
            return item.enclosure.url;
        }
        console.log('No se encontró imagen, usando imagen predeterminada');
        return 'assets/img/default.jpg'; // Imagen predeterminada si no hay imagen en el feed
    }

    // Función para mostrar noticias en un carrusel
    async function mostrarNoticiasEnCarrusel(feedUrls, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = ''; // Limpiar el contenedor

        let allItems = []; // Array para almacenar todos los items de los feeds

        // Obtener todos los items de todos los feeds
        for (const url of feedUrls) {
            try {
                const response = await fetch(`http://localhost:3000/rss/${encodeURIComponent(url)}`);
                if (!response.ok) {
                    throw new Error(`Error en la respuesta del servidor: ${response.status}`);
                }
                const data = await response.text();
                const feed = await parser.parseString(data);
                allItems = allItems.concat(feed.items); // Concatenar todos los items
            } catch (error) {
                console.error(`Error al obtener noticias de ${url}:`, error);
            }
        }

        let carouselInner = document.createElement('div');
        carouselInner.classList.add('carousel-inner');

        // Mostrar solo las primeras 9 noticias de todos los items
        allItems.slice(0, 9).forEach((item, index) => {
            const imagenNoticia = obtenerImagenNoticia(item); // Obtener imagen de la noticia

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

        // Agregar controles del carrusel
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

    // Mostrar noticias destacadas en el carrusel
    mostrarNoticiasEnCarrusel(rssFeeds, 'featured-news-carousel');
});
