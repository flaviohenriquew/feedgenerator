const http = require("http");
const fs = require("fs");
const url = require("url");
const { parseString } = require("xml2js");
const fetch = require("node-fetch");

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { pathname, query } = parsedUrl;
  const decodedUrl = decodeURIComponent(req.url);

  if (req.headers.referer) {
    let referer = req.headers.referer;
    if (referer.endsWith("/")) {
      referer = referer.slice(0, -1) + decodedUrl;
    }
    console.log(referer);
    res.setHeader("X-Referer", referer);
  }

  if (pathname.startsWith("/rss")) {
    const rssUrl = decodeURIComponent(query.url);
    const keyword = query.keyword;

    // console.log("pathname:", pathname);
    // console.log("RSS URL:", rssUrl);
    // console.log("Keyword:", keyword);

    if (!rssUrl || !keyword) {
      res.writeHead(400);
      res.end("Missing URL or keyword");
      return;
    }

    if (!validateUrl(rssUrl)) {
      res.writeHead(400);
      res.end("Invalid URL");
      return;
    }

    try {
      const response = await fetch.default(rssUrl);

      if (!response.ok) {
        console.log(response);
        throw new Error("Failed to fetch RSS feed");
      }

      const xmlData = await response.text();

      const result = await parseString(xmlData);
      let channel;

      parseString(xmlData, { explicitArray: false }, (err, result) => {
        if (err) {
          console.error(err);
          return;
        }

        const channelData = result.rss.channel;
        channel = {
          title: channelData.title,
          link: channelData.link,
          description: channelData.description,
          language: channelData.language,
          lastBuildDate: channelData.lastBuildDate,
          docs: channelData.docs,
          generator: channelData.generator,
          ttl: channelData.ttl,
          item: channelData.item,
        };
      });

      if (!channel) {
        console.error("Invalid RSS feed structure: missing channel");
        res.writeHead(500);
        res.end("Invalid RSS feed structure: missing channel");
        return;
      }

      const items = Array.isArray(channel.item) ? channel.item : [channel.item];
      const filteredItems = items.filter((item) =>
        new RegExp(keyword, "i").test(item.title)
      );

      const rssXml = generateRssXml(channel, filteredItems);

      res.writeHead(200, {
        "Content-Type": "application/xml",
        Refresh: "900", // Atualiza a página automaticamente a cada 900 segundos (15 minutos)
      });
      //    console.log(rssXml);
      res.end(rssXml);
    } catch (error) {
      console.error("Error:", error.message);
      res.writeHead(500);
      res.end("Internal Server Error");
    }
  } else if (pathname.startsWith("/ordenar")) {
    // Novo endpoint para ordenar a playlist .m3u
    const playlistUrl = decodeURIComponent(query.url);

    if (!playlistUrl) {
      res.writeHead(400);
      res.end("Missing URL");
      return;
    }

    if (!validateUrl(playlistUrl)) {
      res.writeHead(400);
      res.end("Invalid URL");
      return;
    }

    try {
      const response = await fetch(playlistUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch M3U playlist");
      }

      const playlistData = await response.text();
      const playlistOrdenada = ordenarPlaylistM3U(playlistData);

      res.writeHead(200, {
        "Content-Type": "text/plain",
        "Content-Disposition": "attachment; filename=playlist_ordenada.m3u",
      });
      res.end(playlistOrdenada);
    } catch (error) {
      console.error("Error:", error.message);
      res.writeHead(500);
      res.end("Internal Server Error");
    }
  } else if (pathname === "/") {
    // Servindo o arquivo index.html
    fs.readFile("./index.html", (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("File not found");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
  } else {
    res.writeHead(404);
    res.end("File not found");
  }
});

function validateUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

// Função para ordenar a playlist .m3u
function ordenarPlaylistM3U(conteudo) {
  const linhas = conteudo.split("\n");
  const canais = [];

  // Iterar pelas linhas e identificar os canais
  for (let i = 0; i < linhas.length; i++) {
    const linha_info = linhas[i];
    const linha_link = linhas[i + 1];

    // Verifica se a linha é um canal (inicia com #EXTINF)
    if (linha_info.startsWith("#EXTINF")) {
      canais.push({ info: linha_info, link: linha_link });
      i++; // Pula a linha do link correspondente
    }
  }

  // Ordenar os canais alfabeticamente pelo nome
  canais.sort((a, b) => {
    const nomeA = a.info.toLowerCase();
    const nomeB = b.info.toLowerCase();
    return nomeA.localeCompare(nomeB);
  });

  // Reconstruir a playlist ordenada
  let playlistOrdenada = "#EXTM3U\n";
  canais.forEach(canal => {
    playlistOrdenada += `${canal.info}\n${canal.link}\n`;
  });

  return playlistOrdenada;
}

function generateRssXml(channel, items) {
  const rssItems = items
    .map(
      (item) => `
        <item>
            <title>${item.title}</title>
            <link>${item.link}</link>
            <description>${item.description}</description>
            <pubDate>${item.pubDate}</pubDate>
        </item>
    `
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" ?>
        <rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">
            <channel>
                <title>${channel.title}</title>
                <link>${channel.link}</link>
                <description>${channel.description}</description>
                <language>${channel.language}</language>
                <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
                ${rssItems}
            </channel>
        </rss>
    `;
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
