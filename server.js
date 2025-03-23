const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const RSSParser = require('rss-parser');
const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();

const app = express();
const parser = new RSSParser();

// Almacena los IDs de los artículos publicados
const publishedItemIds = [];

// Configuración de CORS para permitir solo orígenes específicos
const corsOptions = {
    origin: 'https://es.hgaruna.org',
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Configuración de la API de Twitter
const twitterClient = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

// Función para publicar un tweet
async function publishTweet(tweetText) {
    try {
        await twitterClient.v2.tweet(tweetText);
        console.log(`Tweet publicado: ${tweetText}`);
    } catch (error) {
        console.error('Error al publicar en Twitter:', error);
    }
}

// Endpoint para procesar un feed RSS desde una URL
app.get('/rss/:url', async (req, res) => {
    try {
        const rssUrl = decodeURIComponent(req.params.url);
        const response = await fetch(rssUrl);
        if (!response.ok) {
            throw new Error(`Error al obtener el feed RSS: ${response.statusText}`);
        }

        const feedText = await response.text();
        const feed = await parser.parseString(feedText);

        const formattedFeed = feed.items.map(item => ({
            title: item.title,
            link: item.link,
            description: item.contentSnippet || item.content || 'Sin descripción',
            pubDate: item.pubDate,
            image: item.enclosure ? item.enclosure.url : null,
            guid: item.guid, // Asumiendo que 'guid' es un identificador único
        }));

        if (feed.items.length > 0) {
            const item = feed.items[0];
            const itemId = item.guid; // Usamos 'guid' como identificador único

            if (!publishedItemIds.includes(itemId)) {
                let tweetText = `${item.title} ${item.link}`;

                // Agrega hashtags
                tweetText += ' #Noticias #Actualidad #ÚltimaHora #LoÚltimo #AlMomento'; // Agrega hashtags aquí

                await publishTweet(tweetText);
                publishedItemIds.push(itemId); // Almacena el ID del artículo publicado
            } else {
                console.log(`Artículo duplicado encontrado: ${itemId}, tweet omitido.`);
            }
        }

        res.json({
            title: feed.title,
            description: feed.description,
            link: feed.link,
            items: formattedFeed,
        });
    } catch (error) {
        console.error('Error al procesar el feed RSS:', error);
        res.status(500).json({ message: 'Error al procesar el feed RSS', error: error.message });
    }
});

// Función para publicar tweets periódicamente
function publicarTweetsPeriodicamente() {
    const feedUrl = encodeURIComponent('https://www.clarin.com/rss/deportes/'); // Reemplaza con tu URL
    fetch(`http://localhost:3000/rss/${feedUrl}`)
        .then(response => response.json())
        .then(data => console.log('Tweets publicados'))
        .catch(error => console.error('Error al publicar tweets:', error));
}

// Ejecutar la función cada 5 minutos (300000 milisegundos)
setInterval(publicarTweetsPeriodicamente, 300000);

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    publicarTweetsPeriodicamente(); // Publicar tweets al iniciar el servidor
});