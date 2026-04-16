import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple in-memory cache for image metadata
const metadataCache = new Map<string, { isLogo: boolean }>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Route for image metadata analysis
  app.get("/api/image-metadata", async (req, res) => {
    const imageUrl = req.query.url as string;
    if (!imageUrl) {
      return res.status(400).json({ error: "URL is required" });
    }

    if (metadataCache.has(imageUrl)) {
      return res.json(metadataCache.get(imageUrl));
    }

    try {
      const response = await axios.get(imageUrl, { responseType: "arraybuffer", timeout: 5000 });
      const buffer = Buffer.from(response.data);
      const metadata = await sharp(buffer).metadata();

      const aspectRatio = (metadata.width || 1) / (metadata.height || 1);
      const hasAlpha = metadata.hasAlpha;
      
      // Heuristics for a logo:
      // 1. Has an alpha channel (transparency)
      // 2. Or is extremely wide/tall (titles)
      const isLogo = !!(hasAlpha || aspectRatio > 2.2 || aspectRatio < 0.45);

      const result = { isLogo };
      metadataCache.set(imageUrl, result);
      res.json(result);
    } catch (error) {
      console.error("Error analyzing image:", imageUrl, error instanceof Error ? error.message : error);
      // Fallback to a safe default if analysis fails
      res.json({ isLogo: false });
    }
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
