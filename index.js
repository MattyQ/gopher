const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { JSDOM } = require('jsdom');
const TurndownService = require('turndown');
const pdfParse = require('pdf-parse');
const app = express();

const rateLimitMap = new Map();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60 * 1000;
const MAX_CONTENT_LENGTH = 90000;
const EDGE_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36';
const UNNECESSARY_ELEMENTS = ['head', 'script', 'style'];

app.use(express.json());
app.use(express.static('public'));

const edgeHeaders = {
  'User-Agent': EDGE_USER_AGENT,
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Referer': 'https://chat.openai.com/'
};


app.use((req, res, next) => {
  const clientIP = req.ip;
  const currentTime = Date.now();
  const entry = rateLimitMap.get(clientIP) || { count: 0, timestamp: currentTime };
  if (currentTime - entry.timestamp > RATE_WINDOW || entry.count < RATE_LIMIT) {
    rateLimitMap.set(clientIP, { count: entry.count + 1, timestamp: currentTime });
    return next();
  }
  return res.status(429).send('Too many requests. Please try again later.');
});

app.use(cors());

const maxContentLength = MAX_CONTENT_LENGTH - 100;
const PAGE_SIZE = maxContentLength;

function sanitizeContent(content) {
  const dom = new JSDOM(content);
  const { window } = dom;
  const { document } = window;
  UNNECESSARY_ELEMENTS.forEach((unnecessaryElement) => {
    const elements = document.querySelectorAll(unnecessaryElement);
    elements.forEach((element) => {
      element.remove();
    });
  });
  const elements = document.querySelectorAll('*');
  elements.forEach((element) => {
    for (const attr of element.attributes) {
      if (!['class', 'id', 'href'].includes(attr.name)) {
        element.removeAttribute(attr.name);
      }
    }
  });
  return dom.serialize();
}

const turndownService = new TurndownService();

app.get('/fetchContent', async (request, response) => {
  const targetUrl = request.query.url;
  const chunk = parseInt(request.query.chunk) || 1;

  try {
    const webContentResponse = await axios.get(targetUrl, { headers: edgeHeaders, responseType: 'arraybuffer' });
    const contentType = webContentResponse.headers['content-type'];

    let result;

    if (contentType.includes('text/html')) {
      const dom = new JSDOM(webContentResponse.data);
      const bodyContent = dom.window.document.body.outerHTML;
      const sanitizedContent = sanitizeContent(bodyContent);
      const markdownContent = turndownService.turndown(sanitizedContent);
      const totalPages = Math.ceil(markdownContent.length / PAGE_SIZE);
      const start = (chunk - 1) * PAGE_SIZE;
      const end = chunk * PAGE_SIZE;
      const contentPage = markdownContent.slice(start, end);
      const nextPage = chunk < totalPages ? `${request.protocol}://${request.get('host')}${request.path}?url=${encodeURIComponent(targetUrl)}&chunk=${chunk + 1}` : null;
      const morePages = totalPages - chunk;
      const nextPageMessage = morePages > 0 ? `This response has been chunked due to its length. There are ${morePages} more pages. To access the next chunk, fetch this URL: ${nextPage}\n\n` : '';

      result = nextPageMessage + "\n\n" + contentPage;

    } else if (contentType.includes('application/json')) {
      const jsonData = JSON.parse(webContentResponse.data.toString());
      result = JSON.stringify(jsonData, null, 2);

    } else if (contentType.startsWith('image/')) {
      result = `![Image](${targetUrl})`;

    } else if (contentType.includes('text/plain') || contentType.includes('application/xml')) {
      result = webContentResponse.data.toString();

    } else if (contentType.includes('application/pdf')) {
      const pdfData = await pdfParse(webContentResponse.data);
      const textContent = pdfData.text;
      result = turndownService.turndown(textContent);
    } else {
      result = 'The content type of the fetched resource is not supported.';
    }

    response.setHeader('Content-Type', 'text/plain');
    response.send(result);

  } catch (error) {
    console.error('Error details:', error);
    response.status(500).send('Error fetching website content.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

module.exports = app;
