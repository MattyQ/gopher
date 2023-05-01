# fetch

## Plugin Overview

The Fetch plugin is a web content extraction tool designed to integrate seamlessly with ChatGPT. It provides users with the ability to fetch content from any website and execute custom JavaScript functions to extract relevant information from the site's Document Object Model (DOM). The plugin is designed to empower the AI model to process web content and provide valuable insights to users.

The Fetch plugin provides two key features:

1. **Fetching Web Content**: The plugin allows users to fetch the content of a specified web page using the `fetchContent` method. Users can provide a target URL and optionally specify the section of the page (`head` or `body`) to retrieve. The response includes the HTML content of the requested section, paginated to ensure manageability. The response also includes the current page number, total number of pages, and an array of URLs for each page, allowing users to navigate through the paginated content.

2. **Executing Custom JavaScript Functions**: The plugin enables users to extract specific data from a website by running a custom JavaScript function on the fetched content using the `executeFunction` method. Users can provide a target URL, the body of the custom JavaScript function (including a "return" statement), and optionally specify a page number for pagination. The response includes the result of executing the custom function, paginated if necessary.

The Fetch plugin is designed to be user-friendly, secure, and efficient, making it an ideal solution for those who want to obtain information from various websites quickly and effortlessly. Whether you're a developer, a researcher, or just someone looking for specific information online, Fetch is the perfect tool to simplify and streamline your web content extraction process.

## Files

### index.js

`index.js` is the main server file for the Fetch plugin. It sets up an Express server with rate limiting and CORS middleware, and defines two GET endpoints: `/fetchContent` and `/executeFunction`. The `/fetchContent` endpoint fetches the content of a specified web page, paginates the content, and returns it to the user. It also allows users to specify the section of the page (`head` or `body`) to retrieve. The `/executeFunction` endpoint executes a custom JavaScript function provided by the user on the content of a specified web page and returns the result. The server listens on a specified port and handles error scenarios, such as rate limit violations and function execution timeouts.

### /public/.well-known/ai-plugin.json

`ai-plugin.json` is the manifest file for the Fetch plugin, which provides metadata and configuration details about the plugin. It includes information such as the human-readable name, the model-readable name, descriptions for both humans and the language model, authentication type, API details (including the OpenAPI specification URL), logo URL, contact email, and legal information URL. The `description_for_model` field provides guidance to ChatGPT on how to use the plugin, including instructions for fetching web content, executing custom JavaScript functions, handling pagination, and summarizing page content.

### /public/.well-known/openapi.yaml

`openapi.yaml` is the OpenAPI specification file for the Fetch plugin. It defines the available API endpoints, their parameters, and the expected responses. The specification includes two endpoints: `/fetchContent` and `/executeFunction`. The `/fetchContent` endpoint allows users to fetch the content of a website by providing a target URL, an optional section ('head' or 'body'), and an optional page number for pagination. The `/executeFunction` endpoint allows users to execute a custom JavaScript function on website content by providing a target URL, the body of the custom JavaScript function (including a "return" statement), and an optional page number for pagination. The specification also includes descriptions, parameter schemas, and response schemas for each endpoint, as well as error codes and their meanings.

### /public/index.html

`index.html` is the public-facing HTML file that serves as the landing page for the Fetch plugin. It provides an overview of the plugin's features and functionality, including the ability to fetch web content and execute custom JavaScript functions for data extraction. The page includes a logo, a brief description of the plugin's key features, and a link to learn more about the development process. The page is styled with CSS to provide a clean and user-friendly interface.
