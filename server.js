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

  // Try query1 and query2 as fallback
  const urls = [
    `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${period1}&period2=${period2}&interval=1d`,
    `https://query2.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${period1}&period2=${period2}&interval=1d`,
  ];

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Cache-Control': 'max-age=0',
  };

  let lastError = '';
  for (const url of urls) {
    try {
      const response = await fetch(url, { headers });
      if (!response.ok) { lastError = `HTTP ${response.status}`; continue; }
      const data = await response.json();
      const result = data?.chart?.result?.[0];
      if (!result) { lastError = 'No result in response'; continue; }
      const prices =
        result.indicators?.adjclose?.[0]?.adjclose ||
        result.indicators?.quote?.[0]?.close;
      if (!prices || prices.length === 0) { lastError = 'No prices array'; continue; }
      return res.json({ ticker, prices: prices.filter(p => p !== null && p !== undefined) });
    } catch (e) {
      lastError = e.message;
    }
  }
  res.status(500).json({ error: `Failed to fetch ${ticker}: ${lastError}` });
});

// Serve React build
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
