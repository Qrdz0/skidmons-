const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

let cachedData = null;
let lastFetch = 0;
const CACHE_TTL = 60000;

app.get('/api/items', async (req, res) => {
    const now = Date.now();
    if (cachedData && (now - lastFetch) < CACHE_TTL) {
        return res.json(cachedData);
    }
    try {
        const response = await fetch('https://www.rolimons.com/api/items');
        if (!response.ok) throw new Error(`Rolimon API error: ${response.status}`);
        cachedData = await response.json();
        lastFetch = now;
        res.json(cachedData);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch item data' });
    }
});

app.get('/api/item/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const response = await fetch(`https://www.rolimons.com/api/item/${id}`);
        if (!response.ok) throw new Error(`Rolimon API error: ${response.status}`);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch item' });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Skidmons backend running on port ${PORT}`);
});
