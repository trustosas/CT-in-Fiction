import express from "express";
import { createServer as createViteServer } from "vite";
import Papa from "papaparse";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable JSON parsing with generous limit for image uploads
  app.use(express.json({ limit: "25mb" }));

  // Configuration
  const CSV_URL = process.env.VITE_DATABASE_URL;
  const R2_WORKER_ENDPOINT = process.env.R2_WORKER_ENDPOINT;
  const R2_API_KEY = process.env.R2_API_KEY;
  const R2_PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN;

  // Image upload endpoint (relays to Cloudflare R2 Worker securely)
  app.post("/api/upload", async (req, res) => {
    try {
      const { filename, contentType, dataBase64 } = req.body;

      if (!dataBase64) {
        return res.status(400).json({ error: "No image data provided" });
      }

      const cleanFilename = (filename || `upload-${Date.now()}.webp`)
        .toLowerCase()
        .replace(/[^a-z0-9.-]/g, "-");

      // If R2 Worker is configured, relay directly to the worker
      if (R2_WORKER_ENDPOINT) {
        const buffer = Buffer.from(dataBase64, "base64");
        const targetUrl = `${R2_WORKER_ENDPOINT.replace(/\/+$/, "")}/${cleanFilename}`;

        const headers: Record<string, string> = {
          "Content-Type": contentType || "image/webp",
        };
        if (R2_API_KEY) {
          headers["x-api-key"] = R2_API_KEY;
          headers["Authorization"] = `Bearer ${R2_API_KEY}`;
        }

        const r2Response = await fetch(targetUrl, {
          method: "PUT",
          headers,
          body: buffer,
        });

        if (!r2Response.ok) {
          const errText = await r2Response.text();
          throw new Error(`R2 Worker upload failed: ${r2Response.status} ${errText}`);
        }

        let publicUrl = "";
        try {
          const r2Json = await r2Response.json();
          publicUrl = r2Json.url || r2Json.imageUrl || r2Json.publicUrl || "";
        } catch (e) {
          // Worker returned raw or non-json response
        }

        if (!publicUrl) {
          const baseDomain = R2_PUBLIC_DOMAIN || R2_WORKER_ENDPOINT;
          publicUrl = `${baseDomain.replace(/\/+$/, "")}/${cleanFilename}`;
        }

        return res.json({ url: publicUrl, filename: cleanFilename });
      }

      // Fallback if R2 credentials are not set yet (returns base64 data URI for immediate local preview)
      const dataUri = `data:${contentType || "image/webp"};base64,${dataBase64}`;
      return res.json({
        url: dataUri,
        filename: cleanFilename,
        warning: "R2_WORKER_ENDPOINT is not configured. Using data URI placeholder.",
      });
    } catch (error) {
      console.error("Upload failed:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Image upload failed",
      });
    }
  });

  // API route for characters (Legacy CSV fallback)
  app.get("/api/characters", async (req, res) => {
    if (!CSV_URL) {
      return res.json([]);
    }
    try {
      const isForce = !!req.query.t;
      
      const targetUrl = isForce 
        ? `${CSV_URL}${CSV_URL.includes('?') ? '&' : '?'}_t=${Date.now()}` 
        : CSV_URL;

      const response = await fetch(targetUrl, {
        cache: isForce ? 'no-store' : 'default',
        headers: isForce ? { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } : {}
      });
      
      if (!response.ok) throw new Error('Failed to fetch from Google');
      
      const csvText = await response.text();
      const lines = csvText.split('\n');
      const dataLines = lines.slice(6).join('\n');
      
      Papa.parse(dataLines, {
        header: false,
        skipEmptyLines: 'greedy',
        complete: (results) => {
          const characters = results.data.map((row: any, index: number) => {
            const name = row[4] || '';
            const type = row[6] || '';
            const motifValues = row.slice(34).map((val: any) => {
              const sVal = String(val).trim().toUpperCase();
              return sVal === 'TRUE' || sVal === '1' || sVal === 'YES';
            });
            const isPublished = ['TRUE', '1', 'YES', 'T', 'Y'].includes(String(row[29]).trim().toUpperCase());
            const isWorkArtOpaque = ['TRUE', '1', 'YES', 'T', 'Y'].includes(String(row[32]).trim().toUpperCase());

            return {
              id: `char-${index}`,
              medium: row[0] || '',
              source: row[1] || '',
              year: row[2] || '',
              workImageUrl: row[3] || '',
              name: name.trim(),
              imageUrl: row[5] || '',
              type: type.trim(),
              leadEnergetic: row[9] || '',
              auxiliaryEnergetic: row[10] || '',
              tertiaryEnergetic: row[11] || '',
              polarEnergetic: row[12] || '',
              leadFunction: row[13] || '',
              auxiliaryFunction: row[14] || '',
              tertiaryFunction: row[15] || '',
              polarFunction: row[16] || '',
              judgmentAxis: row[17] || '',
              perceptionAxis: row[18] || '',
              behaviourQualia: row[19] || '',
              quadra: row[20] || '',
              emotionalAttitude: row[21] || '',
              unguardedness: row[22] || '',
              guardedness: row[23] || '',
              rawQuadra: row[24] || '',
              alternateType: row[7] || '',
              subtype: row[8] || '',
              initialDevelopment: row[25] || '',
              finalDevelopment: row[26] || '',
              analysis: row[27] || '',
              notes: row[28] || '',
              isPublished,
              publishedDate: row[30] || '',
              editedDate: row[31] || '',
              isWorkArtOpaque,
              author: row[33] || '',
              motifValues: motifValues.length > 0 ? motifValues : undefined
            };
          }).filter((char: any) => 
            char.name && 
            (char.type || char.rawQuadra) && 
            char.isPublished &&
            char.author && char.author.trim() !== ''
          );
          
          if (isForce) {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
          } else {
            res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
          }
          res.json(characters);
        },
        error: (error: any) => {
          res.status(500).json({ error: error.message });
        }
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Vercel Analytics reporting endpoint placeholder
  app.post("/va", (req, res) => {
    res.status(204).end();
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
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
