const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const RSSParser = require('rss-parser');
const serverless = require('serverless-http');

const app = express();
const parser = new RSSParser();

// Configuración de CORS para permitir solo orígenes específicos
const corsOptions = {
    origin: 'https://es.hgaruna.org', // Cambia esta URL al origen permitido
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Endpoint para procesar un feed RSS desde una URL
app.get('/rss/:url', async (req, res) => {
    try {
        const rssUrl = decodeURIComponent(req.params.url); // Decodificar la URL del parámetro
        const response = await fetch(rssUrl);
        if (!response.ok) {
            throw new Error(`Error al obtener el feed RSS: ${response.statusText}`);
        }

        const feedText = await response.text();
        const feed = await parser.parseString(feedText); // Usar RSSParser para procesar el XML del feed

        // Formatear la respuesta para el cliente
        const formattedFeed = feed.items.map(item => ({
            title: item.title,
            link: item.link,
            description: item.contentSnippet || item.content || 'Sin descripción',
            pubDate: item.pubDate,
            image: item.enclosure ? item.enclosure.url : null,
        }));

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

// Serverless handler para AWS Lambda o entornos similares
const handler = serverless(app);
module.exports.handler = async (event, context) => {
    return await handler(event, context);
};
