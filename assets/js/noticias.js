document.addEventListener('DOMContentLoaded', function() {
    const parser = new RSSParser();

    // Enlaces RSS de ESPN
    const rssFeeds = {
        sports: [
            'https://www.espn.com/espn/rss/news',
            'https://www.espn.com/espn/rss/nfl/news',
            'https://www.espn.com/espn/rss/nba/news',
            'https://www.espn.com/espn/rss/mlb/news',
            'https://www.espn.com/espn/rss/nhl/news',
            'https://www.espn.com/espn/rss/rpm/news',
            'https://soccernet.espn.com/rss/news',
            'https://www.espn.com/espn/rss/ncb/news',
            'https://www.espn.com/espn/rss/ncf/news'
        ],
        gamers: [
            // Agrega aquí tus feeds de gamers
        ]
    };

    // Función para obtener la imagen predeterminada según la URL del feed
    function obtenerImagenPredeterminada(url) {
        if (url.includes('nfl')) return 'assets/img/nfl.jpg';
        if (url.includes('nba')) return 'assets/img/nba.jpg';
        if (url.includes('mlb')) return 'assets/img/mlb.jpg';
        if (url.includes('nhl')) return 'assets/img/nhl.jpg';
        if (url.includes('rpm')) return 'assets/img/rpm.jpg';
        if (url.includes('soccer')) return 'assets/img/soccer.jpg';
        if (url.includes('ncb')) return 'assets/img/nba.jpg';
        if (url.includes('ncf')) return 'assets/img/soccer.jpg';
        return 'assets/img/nba.jpg';
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

            const imagenPredeterminada = obtenerImagenPredeterminada(item.link); // Usar link para obtener imagen

            const articleElement = document.createElement('div');
            articleElement.classList.add('col-md-4', 'mb-4');
            articleElement.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <img src="${imagenPredeterminada}" class="card-img-top" alt="Imagen predeterminada">
                        <h5 class="card-title">${item.title}</h5>
                        <a href="${item.link}" class="btn btn-primary">Leer más</a>
                    </div>
                </div>
            `;
            container.appendChild(articleElement);
            newsCount++;
        }
    }

    // Mostrar noticias de deportes
    mostrarNoticias(rssFeeds.sports, 'sports-news-container');

    // Mostrar noticias de gamers (si tienes feeds)
    mostrarNoticias(rssFeeds.gamers, 'gamer-news-container');
});