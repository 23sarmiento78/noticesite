const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const RSSParser = require("rss-parser");
const { TwitterApi } = require("twitter-api-v2");
require("dotenv").config();

const app = express();
const parser = new RSSParser();

// Almacena los IDs de los artículos publicados por categoría
const publishedItemIds = {};

// Configuración de CORS para permitir solo orígenes específicos
const corsOptions = {
  origin: ["https://es.hgaruna.org", "http://localhost:3000"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Servir archivos estáticos
app.use(express.static("."));

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
    console.error("Error al publicar en Twitter:", error);
  }
}

// Endpoint para procesar un feed RSS desde una URL
app.get("/rss/:url", async (req, res) => {
  try {
    const rssUrl = decodeURIComponent(req.params.url);
    const response = await fetch(rssUrl);
    if (!response.ok) {
      throw new Error(`Error al obtener el feed RSS: ${response.statusText}`);
    }

    const feedText = await response.text();
    const feed = await parser.parseString(feedText);

    const formattedFeed = feed.items.map((item) => ({
      title: item.title,
      link: item.link,
      description: item.contentSnippet || item.content || "Sin descripción",
      pubDate: item.pubDate,
      image: item.enclosure ? item.enclosure.url : null,
      guid: item.guid, // Asumiendo que 'guid' es un identificador único
    }));

    res.json({
      title: feed.title,
      description: feed.description,
      link: feed.link,
      items: formattedFeed,
    });
  } catch (error) {
    console.error("Error al procesar el feed RSS:", error);
    res
      .status(500)
      .json({ message: "Error al procesar el feed RSS", error: error.message });
  }
});

// Función para publicar tweets periódicamente
async function publicarTweetsPeriodicamente() {
  const feeds = [
    // Clarín Argentina
    {
      title: "Espectáculos",
      url: "https://www.clarin.com/rss/espectaculos/",
      containerId: "categoria1-news-container",
      hashtags: "#Espectáculos #Famosos #Entretenimiento",
    },
    {
      title: "Cine",
      url: "https://www.clarin.com/rss/espectaculos/cine/",
      containerId: "categoria2-news-container",
      hashtags: "#Cine #Películas #Estrenos",
    },
    {
      title: "Fútbol",
      url: "https://www.clarin.com/rss/deportes/",
      containerId: "categoria3-news-container",
      hashtags: "#Fútbol #Deportes #NoticiasDeportivas",
    },
    {
      title: "Tecnología",
      url: "https://www.clarin.com/rss/tecnologia/",
      containerId: "tecnologia-news-container",
      hashtags: "#Tecnología #Innovación #Tech",
    },
    {
      title: "Política",
      url: "https://www.clarin.com/rss/politica/",
      containerId: "categoria5-news-container",
      hashtags: "#Política #NoticiasPolíticas #ActualidadPolítica",
    },
    {
      title: "Cultura",
      url: "https://www.clarin.com/rss/cultura/",
      containerId: "categoria6-news-container",
      hashtags: "#Cultura #Arte #EventosCulturales",
    },
    {
      title: "Internacional",
      url: "https://www.clarin.com/rss/mundo/",
      containerId: "categoria7-news-container",
      hashtags: "#Internacional #NoticiasMundiales",
    },
    {
      title: "Autos",
      url: "https://www.clarin.com/rss/autos/",
      containerId: "categoria8-news-container",
      hashtags: "#Autos #Vehículos #Motor",
    },
    // El País España
    {
      title: "El País Portada España",
      url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada",
      containerId: "elpais-portada-container",
      hashtags: "#España #Noticias #ElPaís",
    },
    {
      title: "El País Internacional",
      url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/internacional",
      containerId: "elpais-internacional-container",
      hashtags: "#Internacional #España #Mundo",
    },
    {
      title: "El País Lo Más Visto",
      url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada",
      containerId: "elpais-populares-container",
      hashtags: "#ElPaísMásVisto #España #Trending",
    },
    // La Nación Argentina
    {
      title: "La Nación",
      url: "https://www.lanacion.com.ar/rss",
      containerId: "lanacion-container",
      hashtags: "#Argentina #LaNación #Noticias",
    },
    // El Tiempo Colombia
    {
      title: "El Tiempo Colombia",
      url: "https://www.eltiempo.com/rss",
      containerId: "eltiempo-container",
      hashtags: "#Colombia #ElTiempo #Noticias",
    },
    // BBC Feeds
    {
      title: "BBC World",
      url: "https://feeds.bbci.co.uk/news/world/rss.xml",
      containerId: "bbc-mundo-container",
      hashtags: "#BBCWorld #Internacional #Noticias",
    },
    {
      title: "BBC Technology",
      url: "https://feeds.bbci.co.uk/news/technology/rss.xml",
      containerId: "bbc-tech-container",
      hashtags: "#BBCTech #Tecnología #Innovación",
    },
    {
      title: "BBC Sport",
      url: "https://feeds.bbci.co.uk/sport/rss.xml",
      containerId: "bbc-sport-container",
      hashtags: "#BBCSport #Deportes #Internacional",
    },
    // CNN en Español
    {
      title: "CNN Español",
      url: "http://cnnespanol.cnn.com/rss/",
      containerId: "cnn-espanol-container",
      hashtags: "#CNNEspañol #Internacional #Noticias",
    },
    // Buenos Aires Ciudad
    {
      title: "Buenos Aires Ciudad",
      url: "https://www.buenosaires.gob.ar/rss",
      containerId: "ba-ciudad-container",
      hashtags: "#BuenosAires #Argentina #Ciudad",
    },
  ];

  for (const feed of feeds) {
    try {
      const rssUrl = encodeURIComponent(feed.url);
      const response = await fetch(`http://localhost:3000/rss/${rssUrl}`);
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const item = data.items[0];
        const itemId = item.guid;

        if (
          !publishedItemIds[feed.title] ||
          !publishedItemIds[feed.title].includes(itemId)
        ) {
          let tweetText = `${item.title} ${item.link} ${feed.hashtags}`;
          await publishTweet(tweetText);

          if (!publishedItemIds[feed.title]) {
            publishedItemIds[feed.title] = [];
          }
          publishedItemIds[feed.title].push(itemId);
        } else {
          console.log(
            `Artículo duplicado encontrado en ${feed.title}: ${itemId}, tweet omitido.`,
          );
        }
      }
    } catch (error) {
      console.error(`Error al procesar el feed ${feed.title}:`, error);
    }
  }
}

// Ejecutar la función cada 5 minutos (300000 milisegundos)
setInterval(publicarTweetsPeriodicamente, 300000);

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
  publicarTweetsPeriodicamente(); // Publicar tweets al iniciar el servidor
});
