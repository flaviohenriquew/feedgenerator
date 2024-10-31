const http = require("http");
const fs = require("fs");
const url = require("url");
const { parseString } = require("xml2js");

// Função para ordenar a playlist M3U
function ordenarPlaylistM3U(conteudo) {
  const linhas = conteudo.split("\n");
  const canais = [];

  // Iterar pelas linhas para extrair canais
  for (let i = 0; i < linhas.length; i++) {
    const linha_info = linhas[i];
    const linha_link = linhas[i + 1];

    if (linha_info.startsWith("#EXTINF")) {
      canais.push({ info: linha_info, link: linha_link });
      i++; // Pular a próxima linha (link) que já foi adicionada
    }
  }

  // Ordenar os canais por nome
  canais.sort((a, b) => a.info.toLowerCase().localeCompare(b.info.toLowerCase()));

  // Reconstruir a playlist ordenada
  let playlistOrdenada = "#EXTM3U\n";
  canais.forEach((canal) => {
    playlistOrdenada += `${canal.info}\n${canal.link}\n`;
  });

  return playlistOrdenada;
}

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
      const fetch = await import("node-fetch");
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
  } else if (pathname === "/ordenar") {
    const m3uUrl = query.url;

    if (!m3uUrl) {
      res.writeHead(400);
      res.end("Missing URL parameter");
      return;
    }

    if (!validateUrl(m3uUrl)) {
      res.writeHead(400);
      res.end("Invalid URL");
      return;
    }

    try {
      const fetch = await import("node-fetch");
      const response = await fetch.default(m3uUrl);
      
      if (!response.ok) {
        throw new Error("Failed to fetch M3U file");
      }
      
      const m3uData = await response.text();
      const playlistOrdenada = ordenarPlaylistM3U(m3uData);
      
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
  } if (pathname === "/generate-audio") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      console.log("Recebido body:", body);
      let text, voice;
      try {
        ({ text, voice } = JSON.parse(body));
      } catch (parseError) {
        console.error("Erro ao fazer o parse do JSON:", parseError);
        res.writeHead(400);
        res.end("Formato JSON inválido");
        return;
      }
  
      if (!text || !voice) {
        res.writeHead(400);
        res.end("Texto e voz são obrigatórios");
        return;
      }
  
      try {
        console.log("Tentando importar edge-tts...");
        const edgeTTS = await import("edge-tts/out/index.js"); //const edgeTTS = await import("edge-tts"); // Importa dinamicamente o edge-tts
        console.log("edge-tts importado com sucesso:", edgeTTS);
  
        const audioPath = "./output.mp3";
        console.log("Iniciando a conversão do texto para áudio...");
        
        const stream = edgeTTS.tts({ text, voice });
        const writeStream = fs.createWriteStream(audioPath);

        stream.pipe(writeStream);
          
        writeStream.on("finish", () => {
          console.log("Conversão concluída, enviando o arquivo de áudio...");
          res.writeHead(200, {
            "Content-Type": "audio/mpeg",
            "Content-Disposition": "attachment; filename=output.mp3",
          });
  
          fs.createReadStream(audioPath)
            .pipe(res)
            .on("finish", () => {
              console.log("Áudio enviado, deletando arquivo temporário...");
              fs.unlinkSync(audioPath);
            });
        });

        writeStream.on("error", (error) => {
          console.error("Erro ao salvar o áudio:", error);
          res.writeHead(500);
          res.end("Erro ao salvar o áudio.");
        });

      } catch (error) {
        console.error("Erro ao gerar o áudio:", error);
        res.writeHead(500);
        res.end("Erro ao gerar o áudio.");
      }
    });
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
