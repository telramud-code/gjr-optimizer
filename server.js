const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Proxy Yahoo Finance requests
app.get('/yahoo/:ticker', async (req, res) => {
  const { ticker } = req.params;
  const { from, to } = req.query;
  const period1 = Math.floor(new Date(from).getTime() / 1000);
  const period2 = Math.floor(new Date(to).getTime() / 1000);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${period1}&period2=${period2}&interval=1d&events=adjclose`;
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      }
    });
    const data = await response.json();
    const result = data?.chart?.result?.[0];
    if (!result) return res.status(404).json({ error: `No data for ${ticker}` });
    const timestamps = result.timestamp;
    const adjCloses = result.events?.adjclose
      ? Object.values(result.events.adjclose).map(e => e.amount)
      : result.indicators?.adjclose?.[0]?.adjclose || result.indicators?.quote?.[0]?.close;
    if (!adjCloses || adjCloses.length === 0)
      return res.status(404).json({ error: `No prices for ${ticker}` });
    res.json({ ticker, prices: adjCloses.filter(p => p !== null) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Serve React build
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
