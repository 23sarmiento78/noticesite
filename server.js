const express = require('express');
const fetch = require('node-fetch'); // Importa node-fetch versión 2.x
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors()); // Habilita CORS para todas las rutas

app.get('/rss/:url(*)', async (req, res) => {
    const url = req.params.url;
    try {
        const response = await fetch(url, { // Utiliza node-fetch versión 2.x
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.text();
        res.send(data);
    } catch (error) {
        console.error('Error fetching RSS:', error);
        res.status(500).send('Error fetching RSS');
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});