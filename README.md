# Fetch

## Overview

Fetch is a REST API and plugin designed to extract web content for integration with ChatGPT. It allows users to obtain content from any website and perform custom JavaScript functions to extract relevant information from the site's Document Object Model (DOM). The primary goal of Fetch is to enable the AI model to process web content and provide valuable insights to users.

Fetch offers two main features:

1. **Fetching Web Content**: Fetch provides an endpoint to retrieve the content of a specified web page. Users can supply a target URL and the API returns the HTML content paginated for manageability. Additionally, the response includes the current chunk number, total number of chunks, and a URL to access the next chunk, allowing users to navigate through the paginated content.

2. **Sanitizing and Converting Web Content to Markdown**: The API sanitizes the fetched content by removing unnecessary elements and attributes. It then converts the sanitized HTML content into markdown format, making it more accessible and easier to process for ChatGPT.

## Code Structure

### index.js

`index.js` is the main server file for the Fetch API. It sets up an Express server with rate limiting and CORS middleware and defines a GET endpoint: `/fetchContent`. The `/fetchContent` endpoint fetches the content of a specified web page, sanitizes the content, converts it to markdown, paginates it, and returns it to the user. The server listens on a specified port and handles error scenarios, such as rate limit violations and content fetching errors.

### Dependencies

- `express`: Web framework for creating the REST API server.
- `cors`: Middleware for enabling CORS.
- `axios`: HTTP client for fetching web content.
- `jsdom`: JavaScript-based DOM implementation for parsing and manipulating fetched content.
- `turndown`: Library for converting HTML content to markdown.

### /public/.well-known/ai-plugin.json

`ai-plugin.json` is the manifest file for the Fetch plugin, which provides metadata and configuration details about the plugin. It includes information such as the human-readable name, the model-readable name, descriptions for both humans and the language model, authentication type, API details (including the OpenAPI specification URL), logo URL, contact email, and legal information URL. The `description_for_model` field provides guidance to ChatGPT on how to use the plugin, including instructions for fetching web content, handling pagination, and summarizing page content.

### /public/.well-known/openapi.yaml

`openapi.yaml` is the OpenAPI specification file for the Fetch plugin. It defines the available API endpoints, their parameters, and the expected responses. The specification includes the `/fetchContent` endpoint, which allows users to fetch the content of a website by providing a target URL and an optional chunk number for pagination. The specification also includes descriptions, parameter schemas, and response schemas for the endpoint, as well as error codes and their meanings.

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
5. Deploy the server to a platform of your choice (e.g., Heroku, AWS, Google Cloud Platform).

## Limitations and Considerations

- Rate Limiting: The Fetch API enforces rate limiting to prevent abuse. Users may encounter a "429: Too many requests" error if they exceed the allowed rate.
- Content Fetching Errors: Occasionally, errors may occur while fetching web content, which may result in a "500: Error fetching website content" response.
- Content Accuracy: Although the Fetch plugin sanitizes and converts web content to markdown format, it may not always accurately represent the original source's formatting, structure, or content.
- Content Length: If the fetched content is too long, it will be chunked into smaller sections. Users must follow the provided URLs to access subsequent chunks.
- User Permissions and Legal Considerations: The Fetch plugin is designed to access publicly available web content. Users should respect website terms of use, intellectual property rights, and data privacy laws.
