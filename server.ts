import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fs from "fs/promises";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ISR Cache Configuration
const CACHE_FILE = path.join(process.cwd(), '.csv_cache');
const REVALIDATE_MS = 60 * 1000;
let cachedCsv: string | null = null;
let lastFetchTime = 0;
let isFetching = false;

// Initial cache load from disk
async function loadCacheFromDisk() {
  try {
    const stats = await fs.stat(CACHE_FILE);
    cachedCsv = await fs.readFile(CACHE_FILE, 'utf-8');
    lastFetchTime = stats.mtimeMs;
    console.log(`[ISR] Loaded cache from disk. Age: ${Math.round((Date.now() - lastFetchTime) / 1000)}s`);
  } catch (err) {
    console.log('[ISR] No local cache found on disk.');
  }
}

async function fetchCsv() {
  const csvUrl = process.env.VITE_DATABASE_URL || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRhyird8EfAwfyJx4tyy7stnR10wzr8k3kyhZ1tSH9JZGmcKkD2e_Q0JmAGJrl1y15PCyghiRS1zRlT/pub?output=csv';
  
  if (isFetching) return cachedCsv;
  isFetching = true;

  try {
    console.log(`[ISR] Fetching data: ${csvUrl}`);
    const response = await fetch(csvUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Node.js)'
      }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const text = await response.text();
    if (!text || text.trim().length === 0) throw new Error('Received empty CSV');

    cachedCsv = text;
    lastFetchTime = Date.now();
    
    await fs.writeFile(CACHE_FILE, text, 'utf-8');
    console.log(`[ISR] Cache updated: ${text.length} chars at ${new Date().toISOString()}`);
    
    return cachedCsv;
  } catch (error) {
    console.error('[ISR] Fetch system error:', error.message);
    if (cachedCsv) {
      console.log('[ISR] Using stale cache due to fetch error.');
      return cachedCsv;
    }
    throw error;
  } finally {
    isFetching = false;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Initial Load from disk
  await loadCacheFromDisk();
  
  // 2. Unconditional initial fetch at startup
  console.log('[ISR] Initial startup fetch...');
  fetchCsv().catch(e => console.error('[ISR] Initial fetch failed:', e.message));

  // Regular revalidation loop every 60s (optional background refresh)
  setInterval(() => {
    fetchCsv().catch(() => {});
  }, REVALIDATE_MS);

  // API Route for CSV Data with ISR (Stale-While-Revalidate)
  app.get('/api/data', async (req, res) => {
    const isExpired = !cachedCsv || (Date.now() - lastFetchTime) > REVALIDATE_MS;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Cache-Control', 'no-cache'); // Let server handle expiration

    if (!cachedCsv) {
      try {
        const data = await fetchCsv();
        res.setHeader('X-Cache-Status', 'MISS');
        return res.send(data);
      } catch (error) {
        return res.status(503).send('Data unavailable');
      }
    }

    if (isExpired && !isFetching) {
      fetchCsv().catch(() => {});
    }

    res.setHeader('X-Cache-Status', isExpired ? 'STALE' : 'HIT');
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
