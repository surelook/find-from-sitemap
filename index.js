const { promisify } = require("util");
const parseString = promisify(require("xml2js").parseString);
const axios = require("axios");
const cheerio = require("cheerio");
const { Command } = require("commander");

const program = new Command();

program
  .requiredOption("--sitemap <url>", "URL of the sitemap")
  .requiredOption(
    "--selector <selector>",
    "CSS query selector to check for element existence"
  );

program.parse(process.argv);

const options = program.opts();

// Function to parse a sitemap index and extract URLs from referenced sitemaps
async function parseSitemapIndexFromURL(sitemapIndexUrl, querySelector) {
  try {
    const response = await axios.get(sitemapIndexUrl);
    const sitemapIndexXml = response.data;
    const parsedData = await parseString(sitemapIndexXml);

    // Initialize an array to store results
    const results = [];

    // Function to process a sitemap entry
    async function processSitemapEntry(entry, pageIndex) {
      const sitemapUrl = entry.loc[0];
      try {
        const sitemapResponse = await axios.get(sitemapUrl);
        const sitemapXml = sitemapResponse.data;
        const sitemapData = await parseString(sitemapXml);

        if (sitemapData.urlset && sitemapData.urlset.url) {
          for (const sitemapEntry of sitemapData.urlset.url) {
            if (sitemapEntry.loc && sitemapEntry.loc.length > 0) {
              const url = sitemapEntry.loc[0];
              const pageResponse = await axios.get(url);
              const pageHtml = pageResponse.data;
              const $ = cheerio.load(pageHtml);

              // Use querySelector to check for the existence of an element
              const elementExists = $(querySelector).length > 0;

              if (elementExists) {
                results.push(url);
              }
              console.log(
                `Processed page ${pageIndex + 1}/${
                  results.length
                }: ${url}, Element Exists: ${elementExists}`
              );
            }
          }
        }
      } catch (error) {
        console.error("Error fetching or parsing linked sitemap:", error);
      }
    }

    // Process sitemap entries in the sitemap index
    if (parsedData.sitemapindex && parsedData.sitemapindex.sitemap) {
      for (
        let pageIndex = 0;
        pageIndex < parsedData.sitemapindex.sitemap.length;
        pageIndex++
      ) {
        const entry = parsedData.sitemapindex.sitemap[pageIndex];
        await processSitemapEntry(entry, pageIndex);
      }
    }

    return results;
  } catch (error) {
    console.error("Error fetching or parsing sitemap index:", error);
    throw error;
  }
}

// Example usage
const sitemapIndexUrl = options.sitemap;
const querySelector = options.selector;

parseSitemapIndexFromURL(sitemapIndexUrl, querySelector)
  .then((urls) => {
    console.log("List of URLs that contain the element:");
    urls.forEach((url, index) => {
      console.log(`${index + 1}: ${url}`);
    });
  })
  .catch((error) => {
    console.error("An error occurred:", error);
  });
