# Gopher

## Overview

Gopher is a REST API and plugin designed to extract web content for integration with ChatGPT. It allows users to obtain content from any website in markdown format, without the need to perform custom JavaScript functions. The primary goal of Gopher is to enable the AI model to process web content and provide valuable insights to users.

Gopher offers one main feature:

1. **Fetching Web Content in Markdown Format**: Gopher provides an endpoint to retrieve the content of a specified web page. Users can supply a target URL and the API returns the content in markdown format, paginated for manageability. If the content is too long, the response includes the current chunk number, total number of chunks, and a URL to access the next chunk, allowing users to navigate through the paginated content.

## Code Structure

### index.js

`index.js` is the main server file for the Gopher API. It sets up an Express server with rate limiting and CORS middleware and defines a GET endpoint: `/fetchContent`. The `/fetchContent` endpoint fetches the content of a specified web page, sanitizes the content, converts it to markdown, paginates it, and returns it to the user. The server listens on a specified port and handles error scenarios, such as rate limit violations and content fetching errors.

### Dependencies

- `express`: Web framework for creating the REST API server.
- `cors`: Middleware for enabling CORS.
- `axios`: HTTP client for fetching web content.
- `jsdom`: JavaScript-based DOM implementation for parsing and manipulating fetched content.
- `turndown`: Library for converting HTML content to markdown.
- `pdf-parse`: Library for parsing PDF content.
- `@types/node`: Type definitions for Node.js.

### /public/.well-known/ai-plugin.json

`ai-plugin.json` is the manifest file for the Gopher plugin, which provides metadata and configuration details about the plugin. It includes information such as the human-readable name, the model-readable name, descriptions for both humans and the language model, authentication type, API details (including the OpenAPI specification URL), logo URL, contact email, and legal information URL. The `description_for_model` field provides guidance to ChatGPT on how to use the plugin, including instructions for fetching web content, handling pagination, and summarizing page content.

### /public/.well-known/openapi.yaml

`openapi.yaml` is the OpenAPI specification file for the Gopher plugin. It defines the available API endpoints, their parameters, and the expected responses. The specification includes the `/fetchContent` endpoint, which allows users to fetch the content of a website by providing a target URL and an optional chunk number for pagination. The specification also includes descriptions, parameter schemas, and response schemas for the endpoint, as well as error codes and their meanings.

## API Usage

### Fetching Web Content

To fetch web content, make a GET request to the `/fetchContent` endpoint with the following query parameters:

- `url` (required): The target URL to fetch content from.
- `chunk` (optional): The chunk number to retrieve. If not specified, defaults to 1.

Example request: `GET /fetchContent?url=https://example.com&chunk=1`

The response will include:

- The paginated markdown content.
- A message with information about the total number of chunks and the URL to access the next chunk, if applicable.

## Setup and Deployment

1. Clone the repository.
2. Run `npm install` to install the dependencies.
3. Set the `PORT` environment variable to the desired port number, or let the application use the default port (3000).
4. Run `npm start` to start the server.
5. Once the server is running, access the Gopher API at `http://localhost:<PORT>/fetchContent?url=<URL>&chunk=<CHUNK>`.

## Updating Dependencies

To update the dependencies, modify the `dependencies` section in `package.json`:

```json
"dependencies": {
  "@types/node": "^18.0.6",
  "axios": "^1.4.0",
  "cors": "^2.8.5",
  "express": "^4.18.2",
  "jsdom": "^21.1.1",
  "node-fetch": "^3.2.6",
  "pdf-parse": "^1.1.1",
  "turndown": "^7.1.2"
}
```

After updating the dependency versions, run `npm install` to install the new versions.

## License

Gopher is licensed under the [AI-0-1.2 license](LICENSE.md].
