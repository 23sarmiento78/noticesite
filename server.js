const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const RSSParser = require('rss-parser');

const app = express();
const parser = new RSSParser();

app.use(cors());

app.get('/rss/:url', async (req, res) => {
    const url = decodeURIComponent(req.params.url);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
        }
        const data = await response.text();
        const feed = await parser.parseString(data);
        res.json(feed);
    } catch (error) {
        console.error(`Error fetching RSS feed: ${error}`);
        res.status(500).send('Error fetching RSS feed');
    }
});

// Cambia el puerto a 3001
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});