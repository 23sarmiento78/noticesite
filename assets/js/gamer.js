document.addEventListener('DOMContentLoaded', function() {
    const parser = new RSSParser();

    // Enlaces RSS de noticias de videojuegos
    const gamerFeeds = [
        'https://www.ign.com/rss/videos/feed?tags=xbox-one',
        // Agrega aquí otros feeds de noticias de videojuegos
    ];

    // Función para obtener la imagen predeterminada según la URL del feed
    function obtenerImagenPredeterminada(url) {
        return 'assets/img/banner-1.jpg'; // Usar banner-1.jpg para todas las noticias de videojuegos
    }

    // Función para mostrar noticias de un feed RSS
    async function mostrarNoticias(feedUrls, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = ''; // Limpiar el contenedor

        let newsCount = 0; // Contador de noticias mostradas
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

        // Mostrar solo las primeras 9 noticias de todos los items
        for (const item of allItems) {
            if (newsCount >= 9) {
                break; // Salir del bucle si se han mostrado 9 noticias
            }

            // Obtener la URL de la miniatura o usar la imagen predeterminada
            let imageUrl = obtenerImagenPredeterminada(item.link); // Imagen predeterminada
            if (item.media && item.media.thumbnail && item.media.thumbnail.url) {
                // No usar la miniatura del feed, siempre usar banner-1.jpg
            }

            // Verificar si la URL de la imagen es válida
            const img = new Image();
            img.onload = function() {
                // La imagen se cargó correctamente, mostrar la noticia
                const articleElement = document.createElement('div');
                articleElement.classList.add('col-md-4', 'mb-4');
                articleElement.innerHTML = `
                    <div class="card">
                        <div class="card-body">
                            <img src="${imageUrl}" class="card-img-top" alt="Imagen predeterminada">
                            <h5 class="card-title">${item.title}</h5>
                            <a href="${item.link}" class="btn btn-primary">Leer más</a>
                        </div>
                    </div>
                `;
                container.appendChild(articleElement);
            };
            img.onerror = function() {
                // La imagen no se cargó, usar la imagen predeterminada
                imageUrl = obtenerImagenPredeterminada(item.link);
                const articleElement = document.createElement('div');
                articleElement.classList.add('col-md-4', 'mb-4');
                articleElement.innerHTML = `
                    <div class="card">
                        <div class="card-body">
                            <img src="${imageUrl}" class="card-img-top" alt="Imagen predeterminada">
                            <h5 class="card-title">${item.title}</h5>
                            <a href="${item.link}" class="btn btn-primary">Leer más</a>
                        </div>
                    </div>
                `;
                container.appendChild(articleElement);
            };
            img.src = imageUrl; // Iniciar la carga de la imagen

            newsCount++;
        }
    }

    // Mostrar noticias de videojuegos
    mostrarNoticias(gamerFeeds, 'gamer-news-container');
});