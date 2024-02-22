const http = require('http');
const url = require('url');
const { parseString } = require('xml2js');

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const { pathname, query } = parsedUrl;
    
    console.log('entrou pathname');

    if (pathname !== '/rss') {
        res.writeHead(404);
        res.end('File not found');
        return;
    }

    const { url: rssUrl, keyword } = query;

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
        const fetch = await import('node-fetch');
        const response = await fetch.default(rssUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch RSS feed');
        }

        const xmlData = await response.text();
        const result = await parseString(xmlData, { explicitArray: false });

        const channel = result?.rss?.channel;
        if (!channel || !Array.isArray(channel.item)) {
            console.error('Invalid RSS feed structure');
            res.writeHead(500);
            res.end('Invalid RSS feed structure');
            return;
        }

        const filteredItems = channel.item.filter(item =>
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
    console.log(`test`, items);
    const rssItems = items.map(item => `
        <item>
            <title>${item.title}</title>
            <link>${item.link}</link>
            <description>${item.description}</description>
            <pubDate>${item.pubDate}</pubDate>
        </item>
    `).join('');

    return `
        <?xml version="1.0" encoding="UTF-8" ?>
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
