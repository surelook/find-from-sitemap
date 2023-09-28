# Find From Sitemap

This script allows you to parse sitemaps and check for the existence of specific elements on the pages listed in the sitemap.

## Prerequisites

Before running the script, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or later)
- npm (Node Package Manager)

## Usage

1. Install the required dependencies

    ```bash
    npm install
    ```

2. To run the script, use the following command:

    ```bash
    node index.js --sitemap <sitemap-url> --selector <css-selector>
    ```

    Replace `<sitemap-url>` with the URL of the sitemap you want to parse and `<css-selector>` with the CSS query selector for the element you want to check on each page.

    For example:

    ```bash
    npm run parse-sitemap -- --sitemap https://example.com/sitemap.xml --selector .hero
    ```

## License

This project is licensed under the MIT License.