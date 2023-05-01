const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { JSDOM } = require('jsdom');
const app = express();
const vm = require('vm'); // Import the 'vm' module for creating a sandbox

const rateLimitMap = new Map(); // In-memory rate limit map
const RATE_LIMIT = 10; // Max requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute in milliseconds

app.use(express.json());
app.use(express.static('public'));

const edgeHeaders = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3 Edge/16.16299',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
};

// Middleware to enforce rate limiting
app.use((req, res, next) => {
  const clientIP = req.ip; // Use client IP as identifier
  const currentTime = Date.now();

  const entry = rateLimitMap.get(clientIP);
  if (entry) {
    const { count, timestamp } = entry;
    // Check if the rate window has expired
    if (currentTime - timestamp > RATE_WINDOW) {
      // Reset the count and timestamp for the new rate window
      rateLimitMap.set(clientIP, { count: 1, timestamp: currentTime });
      return next();
    }
    // Check if the client has exceeded the allowed rate limit
    if (count >= RATE_LIMIT) {
      return res.status(429).send('Too many requests. Please try again later.');
    }
    // Update request count in the map
    rateLimitMap.set(clientIP, { count: count + 1, timestamp });
  } else {
    // Create a new entry for the client IP
    rateLimitMap.set(clientIP, { count: 1, timestamp: currentTime });
  }

  next();
});

// Apply CORS middleware globally to all routes
app.use(cors());

const PAGE_SIZE = 60000; // Reduced page size

// GET endpoint to fetch the content of a website
app.get('/fetchContent', async (request, response) => {
  const targetUrl = request.query.url;
  const page = parseInt(request.query.page) || 1;
  const section = request.query.section || 'body'; // Default to 'body' section

  try {
    const webContentResponse = await axios.get(targetUrl, { headers: edgeHeaders });
    const dom = new JSDOM(webContentResponse.data);
    const headContent = dom.window.document.head.outerHTML;
    const bodyContent = dom.window.document.body.outerHTML;

    // Choose the content section based on the query parameter
    const selectedContent = section === 'head' ? headContent : bodyContent;

    // Paginate the selected content
    const totalPages = Math.ceil(selectedContent.length / PAGE_SIZE);
    const start = (page - 1) * PAGE_SIZE;
    const end = page * PAGE_SIZE;
    const contentPage = selectedContent.slice(start, end);

    // Generate URLs for each page
    const pageUrls = Array.from({ length: totalPages }, (_, i) => {
      return `${request.protocol}://${request.get('host')}${request.path}?url=${encodeURIComponent(targetUrl)}&section=${section}&page=${i + 1}`;
    });

    const result = {
      content: contentPage,
      page: page,
      totalPages: totalPages,
      pageUrls: pageUrls
    };

    response.setHeader('Content-Type', 'application/json');
    response.send(result);
  } catch (error) {
    response.status(500).send('Error fetching website content.');
  }
});

// GET endpoint to execute a custom JavaScript function on a website's content
app.get('/executeFunction', async (request, response) => {
  const targetUrl = request.query.url;
  const customFunctionBody = request.query.functionBody;
  const page = parseInt(request.query.page) || 1;

  if (!customFunctionBody) {
    return response.status(400).send('Function body is missing in the query parameters.');
  }

  try {
    const webContentResponse = await axios.get(targetUrl, { headers: edgeHeaders });
    const dom = new JSDOM(webContentResponse.data);
    const { window } = dom;
    const { document } = window;
    // Create a sandbox context for executing the custom function
    const sandbox = {
      document,
      result: undefined
    };
    // Wrap the customFunctionBody inside an anonymous function and execute it in the sandbox
    const script = new vm.Script(`result = (() => { ${customFunctionBody} })();`);
    script.runInNewContext(sandbox, { timeout: 1000 });

    // Convert the result to a string representation
    const fullResult = (sandbox.result === null || sandbox.result === undefined) ? '' : String(sandbox.result);
    const totalPages = Math.ceil(fullResult.length / PAGE_SIZE);
    const start = (page - 1) * PAGE_SIZE;
    const end = page * PAGE_SIZE;
    const stringResult = fullResult.slice(start, end);

    // Generate URLs for each page
    const pageUrls = Array.from({ length: totalPages }, (_, i) => {
      return `${request.protocol}://${request.get('host')}${request.path}?url=${encodeURIComponent(targetUrl)}&functionBody=${encodeURIComponent(customFunctionBody)}&page=${i + 1}`;
    });

    const result = {
      content: stringResult,
      page: page,
      totalPages: totalPages,
      pageUrls: pageUrls
    };

    response.setHeader('Content-Type', 'application/json');
    response.send(result);
  } catch (error) {
    if (error.message && error.message.includes('Script execution timed out')) {
      response.status(400).send('The custom function took too long to execute.');
    } else {
      response.status(500).send('Error executing custom JavaScript function on website content.');
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
