const express = require('express');
    const cors = require('cors');
    const fetch = require('node-fetch');
    const RSSParser = require('rss-parser');
    const serverless = require('serverless-http');

    const app = express();
    const parser = new RSSParser();

    const corsOptions = {
        origin: 'https://es.hgaruna.org',
        optionsSuccessStatus: 200
    };

    app.use(cors(corsOptions));

    app.get('/rss/:url', async (req, res) => {
        // ... tu código ...
    });

    const handler = serverless(app);
    module.exports.handler = async (event, context) => {
        return await handler(event, context);
    };