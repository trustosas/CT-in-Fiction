import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ISR Cache Setup
let cachedCsv: string | null = null;
let lastFetchTime = 0;
const REVALIDATE_MS = 60 * 1000;
let isFetching = false;

async function fetchCsv() {
  const csvUrl = process.env.VITE_DATABASE_URL || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRhyird8EfAwfyJx4tyy7stnR10wzr8k3kyhZ1tSH9JZGmcKkD2e_Q0JmAGJrl1y15PCyghiRS1zRlT/pub?output=csv';
  console.log(`[ISR] Fetching fresh data from: ${csvUrl}`);
  
  const response = await fetch(csvUrl);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
  cachedCsv = await response.text();
  lastFetchTime = Date.now();
  console.log(`[ISR] Cache updated at ${new Date(lastFetchTime).toISOString()}`);
  return cachedCsv;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Route for CSV Data with ISR
  app.get('/api/data', async (req, res) => {
    const now = Date.now();
    
    // Serve stale cache while fetching fresh data in background if expired
    if (!cachedCsv || (now - lastFetchTime) > REVALIDATE_MS) {
      if (!isFetching) {
        isFetching = true;
        fetchCsv()
          .catch(err => console.error('[ISR] Background fetch failed:', err))
          .finally(() => { isFetching = false; });
      }
      
      // If we don't have ANY cache, wait for the first fetch
      if (!cachedCsv) {
        try {
          const data = await fetchCsv();
          return res.send(data);
        } catch (error) {
          return res.status(500).send('Initial data fetch failed');
        }
      }
    }
    
    // Return cached data (stale-while-revalidate pattern)
    res.setHeader('X-Cache-Status', (now - lastFetchTime) > REVALIDATE_MS ? 'STALE' : 'HIT');
    res.send(cachedCsv);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
