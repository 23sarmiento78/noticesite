document.addEventListener('DOMContentLoaded', function() {
    const parser = new RSSParser();
    const rssFeeds = [
        'https://www.clarin.com/rss/cultura/'
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
        const container = document.getElementById('carousel-inner-news'); // ID corregido
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

        // Se mantiene el resto del código para los controles del carrusel.
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
                document.getElementById('carousel-inner-news').innerHTML = '<p>Error al cargar las noticias. Por favor, inténtelo más tarde.</p>'; // ID corregido
                return;
            }
        }

        mostrarNoticiasEnCarrusel(allItems.slice(0,itemsPerPage),'carousel-inner-news');
    }

    cargarNoticias();
});