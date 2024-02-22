const http = require('http');
const fs = require('fs');
const url = require('url');
const { parseString } = require('xml2js');
const fetch = require('node-fetch');

async function startServer() {
    const server = http.createServer(async (req, res) => {
        const parsedUrl = url.parse(req.url, true);
        const { pathname, query } = parsedUrl;

        if (pathname === 'rss') {
            const rssUrl = decodeURIComponent(query.url);
            const keyword = query.keyword;

            console.log('RSS URL:', rssUrl);
            console.log('Keyword:', keyword);

            if (!rssUrl || !keyword) {
                res.writeHead(400);
                res.end('Missing URL or keyword');
                return;
            }

            if (!validateUrl(rssUrl)) {
                res.writeHead(400);
                res.end('Invalid URL');
                return;
            }

            try {
                const response = await fetch(rssUrl);
                if (!response.ok) {
                    throw new Error('Failed to fetch RSS feed');
                }

                const xmlData = await response.text();
                const { rss: { channel: [channel] } } = await parseString(xmlData);

                if (!channel) {
                    console.error('Invalid RSS feed structure: missing channel');
                    res.writeHead(500);
                    res.end('Invalid RSS feed structure: missing channel');
                    return;
                }

                const items = Array.isArray(channel.item) ? channel.item : [channel.item];
                const filteredItems = items.filter(item =>
                    new RegExp(keyword, 'i').test(item.title)
                );

                const rssXml = generateRssXml(channel, filteredItems);

                res.writeHead(200, { 'Content-Type': 'application/xml' });
                res.end(rssXml);
            } catch (error) {
                console.error('Error:', error.message);
                res.writeHead(500);
                res.end('Internal Server Error');
            }
        } else if (pathname === '/') {
            // Servindo o arquivo index.html
            fs.readFile('./index.html', (err, data) => {
                if (err) {
                    res.writeHead(404);
                    res.end('File not found');
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            });
        } else {
            res.writeHead(404);
            res.end('File not found');
        }
    });

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

function validateUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}

function generateRssXml(channel, items) {
    const rssItems = items.map(item => `
        <item>
            <title>${item.title}</title>
            <link>${item.link}</link>
            <description>${item.description}</description>
            <pubDate>${item.pubDate}</pubDate>
        </item>
    `).join('');

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

startServer();
