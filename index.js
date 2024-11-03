const http = require("http");
const fs = require("fs");
const url = require("url");
const { parseString } = require("xml2js");
const path = require("path");

const mimeTypes = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".doc": "application/msword"
};

function getContentType(filePath) {
  const extname = path.extname(filePath);
  const baseType = mimeTypes[extname] || "application/octet-stream";
  return baseType.includes("text") || baseType === "application/javascript"
    ? `${baseType}; charset=UTF-8`
    : baseType;
}

async function getVoicesByLanguage(languageCode) {
  const edgeTTS = await import("edge-tts/out/index.js");
  const voices = await edgeTTS.getVoices();
  return voices.filter(voice => voice.Locale === languageCode);
}

// Função para ordenar a playlist M3U
function ordenarPlaylistM3U(conteudo) {
  const linhas = conteudo.split("\n");
  const canais = [];

  for (let i = 0; i < linhas.length; i++) {
    const linha_info = linhas[i];
    const linha_link = linhas[i + 1];
    if (linha_info.startsWith("#EXTINF")) {
      canais.push({ info: linha_info, link: linha_link });
      i++;
    }
  }

  canais.sort((a, b) => a.info.toLowerCase().localeCompare(b.info.toLowerCase()));

  return `#EXTM3U\n${canais.map(canal => `${canal.info}\n${canal.link}`).join("\n")}`;
}

// Servir arquivos estáticos
function serveStaticFile(filePath, contentType, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("File not found");
      return;
    }
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

// Função para manipular RSS
async function handleRssRequest(query, res) {
  const rssUrl = query.url; // Mantém o URL codificado
  const keyword = query.keyword;

  if (!rssUrl || !keyword || !validateUrl(rssUrl)) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=UTF-8" });
    res.end("Missing or invalid URL or keyword");
    return;
  }

  try {
    const fetch = await import("node-fetch");
    const response = await fetch.default(rssUrl); // Usa o URL codificado diretamente
    if (!response.ok) throw new Error("Failed to fetch RSS feed");

    const xmlData = await response.text();
    let channel;
    parseString(xmlData, { explicitArray: false }, (err, result) => {
      if (err) throw err;
      channel = result.rss.channel;
    });

    if (!channel) throw new Error("Invalid RSS feed structure: missing channel");

    const items = Array.isArray(channel.item) ? channel.item : [channel.item];
    const filteredItems = items.filter(item => new RegExp(keyword, "i").test(item.title));
    const rssXml = generateRssXml(channel, filteredItems);

    res.writeHead(200, {
      "Content-Type": "application/xml; charset=UTF-8",
      "Cache-Control": "no-cache",
      Refresh: "900"
    });
    res.end(rssXml);
  } catch (error) {
    console.error(error);
    res.writeHead(500, { "Content-Type": "text/plain; charset=UTF-8" });
    res.end("Internal Server Error");
  }
}

// Função para manipular playlists M3U
async function handleM3URequest(query, res) {
  const m3uUrl = query.url;
  if (!m3uUrl || !validateUrl(m3uUrl)) {
    res.writeHead(400);
    res.end("Missing or invalid URL parameter");
    return;
  }

  try {
    const fetch = await import("node-fetch");
    const response = await fetch.default(m3uUrl);
    if (!response.ok) throw new Error("Failed to fetch M3U file");

    const m3uData = await response.text();
    const playlistOrdenada = ordenarPlaylistM3U(m3uData);

    res.writeHead(200, {
      "Content-Type": "text/plain",
      "Content-Disposition": "attachment; filename=playlist_ordenada.m3u",
    });
    res.end(playlistOrdenada);
  } catch (error) {
    console.error(error);
    res.writeHead(500);
    res.end("Internal Server Error");
  }
}

// Função para carregar vozes por idioma
async function handleGetVoices(query, res) {
  const languageCode = query.language || 'pt-BR';
  try {
    const voices = await getVoicesByLanguage(languageCode);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(voices));
  } catch (error) {
    console.error(error);
    res.writeHead(500);
    res.end("Internal Server Error");
  }
}

// Função para carregar idiomas
async function handleGetLanguages(res) {
  try {
    const edgeTTS = await import("edge-tts/out/index.js");
    const voices = await edgeTTS.getVoices();
    const languages = [...new Set(voices.map(voice => voice.Locale))];
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(languages));
  } catch (error) {
    console.error(error);
    res.writeHead(500);
    res.end("Internal Server Error");
  }
}

// Função para manipular efeitos de voz
async function handleVoiceEffects(res) {
  try {
    const edgeTTS = await import("edge-tts/out/index.js");
    const categories = edgeTTS.Categories || [];
    const personalities = edgeTTS.Personalities || [];
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ categories, personalities }));
  } catch (error) {
    console.error(error);
    res.writeHead(500);
    res.end("Internal Server Error");
  }
}

// Função para gerar áudio
async function handleGenerateAudio(req, res) {
  let body = "";
  req.on("data", chunk => (body += chunk));
  req.on("end", async () => {
    try {
      const { text, voice, volume, speed, pitch, format, category, personality } = JSON.parse(body);
      if (!text || !voice) throw new Error("Texto e voz são obrigatórios");

      const edgeTTS = await import("edge-tts/out/index.js");
      const fileExtension = format.includes("MP3") ? "mp3" : "wav";
      const audioPath = `/tmp/output.${fileExtension}`;

      await edgeTTS.ttsSave(text, audioPath, {
        voice,
        volume: `${volume}%` || "+0%",
        rate: `${speed}%` || "+0%",
        pitch: `${pitch}Hz` || "+0Hz",
        category,
        personality,
      });

      res.writeHead(200, {
        "Content-Type": fileExtension === "mp3" ? "audio/mpeg" : "audio/wav",
        "Content-Disposition": `attachment; filename=output.${fileExtension}`,
      });
      fs.createReadStream(audioPath).pipe(res).on("finish", () => fs.unlinkSync(audioPath));
    } catch (error) {
      console.error(error);
      res.writeHead(500);
      res.end("Internal Server Error");
    }
  });
}

// Função de roteamento
function routeRequest(pathname, query, req, res) {
  if (pathname.startsWith("/rss")) return handleRssRequest(query, res);
  if (pathname === "/ordenar") return handleM3URequest(query, res);
  if (pathname === "/get-voices") return handleGetVoices(query, res);
  if (pathname === "/get-languages") return handleGetLanguages(res);
  if (pathname === "/get-voice-effects") return handleVoiceEffects(res);
  if (pathname === "/generate-audio") return handleGenerateAudio(req, res);

  const staticFiles = {
    "/": "./public/index.html",
    "/js/audioPlayer.js": "./public/js/audioPlayer.js",
    "/js/main.js": "./public/js/main.js",
    "/js/playlist.js": "./public/js/playlist.js",
    "/js/rss.js": "./public/js/rss.js",
    "/js/tts.js": "./public/js/tts.js",
    "/js/utils.js": "./public/js/utils.js",
    "/js/voiceEffects.js": "./public/js/voiceEffects.js",
    "/css/styles.css": "./public/css/styles.css",
  };

  if (staticFiles[pathname]) {
    const filePath = staticFiles[pathname];
    const contentType = getContentType(filePath);

    // Ler arquivos de texto com "utf-8" e outros arquivos sem especificação
    const encoding = contentType.includes("charset=UTF-8") ? "utf-8" : null;

    fs.readFile(filePath, encoding, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("File not found");
        return;
      }
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    });
    return;
  }

  res.writeHead(404);
  res.end("File not found");
}

// Helper para obter o tipo de conteúdo
function getContentType(pathname) {
  const ext = pathname.split(".").pop();
  const contentTypes = {
    js: "application/javascript",
    css: "text/css",
    html: "text/html",
  };
  return contentTypes[ext] || "text/plain";
}

// Função para validar URL
function validateUrl(urlString) {
  try {
    new URL(urlString);
    const regex = /^https:\/\/[\w.-]+\/[\w.:;/?&=-]*$/;
    return regex.test(urlString);
    //return true;
  } catch {
    return false;
  }
}

// Função para gerar XML de RSS
function escapeXml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateRssXml(channel, items) {
  const rssItems = items
    .map(
      (item) => `
        <item>
          <title>${escapeXml(item.title)}</title>
          <link>${escapeXml(item.link)}</link>
          <description>${escapeXml(item.description)}</description>
          <pubDate>${escapeXml(item.pubDate)}</pubDate>
        </item>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">
      <channel>
        <title>${escapeXml(channel.title)}</title>
        <link>${escapeXml(channel.link)}</link>
        <description>${escapeXml(channel.description)}</description>
        <language>${escapeXml(channel.language)}</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        ${rssItems}
      </channel>
    </rss>`;
}

// Servidor HTTP
const server = http.createServer((req, res) => {
  const { pathname, query } = url.parse(req.url, true);
  routeRequest(pathname, query, req, res);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
