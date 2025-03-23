require('dotenv').config();
const RSSParser = require('rss-parser');
const { TwitterApi } = require('twitter-api-v2');

const parser = new RSSParser();
const twitterClient = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

async function publishNews(feedUrl) {
    try {
        const feed = await parser.parseURL(feedUrl);
        if (feed.items.length > 0) {
            const item = feed.items[0]; // Publicar el primer elemento
            const tweetText = `${item.title} ${item.link}`;
            await twitterClient.v2.tweet(tweetText);
            console.log(`Tweet publicado: ${tweetText}`);
        }
    } catch (error) {
        console.error('Error al publicar en Twitter:', error);
    }
}

// Ejemplo de uso
const rssFeeds = [
    { url: 'https://www.clarin.com/rss/espectaculos/' },
    { url: 'https://www.clarin.com/rss/deportes/' },
    // ... otros feeds
];

async function main() {
    for (const feed of rssFeeds) {
        await publishNews(feed.url);
    }
}

main();