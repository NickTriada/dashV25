const express = require('express');
const path = require('path');
const { getGasPrices } = require('./gas_scrapper');

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files
app.use(express.static(path.join(__dirname)));

// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// API endpoint for gas prices
app.get('/api/gas-prices', async (req, res) => {
    try {
        const stations = await getGasPrices();
        res.json(stations);
    } catch (error) {
        console.error('Error fetching gas prices:', error);
        res.status(500).json({ error: 'Failed to fetch gas prices' });
    }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 