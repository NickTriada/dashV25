const puppeteer = require('puppeteer');

async function getGasPrices() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920,1080'
    ]
  });

  const page = await browser.newPage();
  
  // Set a realistic viewport and user agent
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  try {
    console.log('Navigating to GasBuddy...');
    await page.goto('https://www.gasbuddy.com/gasprices/california/san-jose', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // Wait for window.__APOLLO_STATE__ to contain at least one Station
    await page.waitForFunction(() => {
      if (!window.__APOLLO_STATE__ || !window.__APOLLO_STATE__.ROOT_QUERY) return false;
      return Object.keys(window.__APOLLO_STATE__).some(k => k.startsWith('Station:'));
    }, { timeout: 60000 });

    // Get the __APOLLO_STATE__ object directly from the page context
    const apolloState = await page.evaluate(() => window.__APOLLO_STATE__);

    // Get all station objects from apolloState
    const stationKeys = Object.keys(apolloState).filter(k => k.startsWith('Station:'));
    const stations = stationKeys.slice(0, 10).map(key => {
      const station = apolloState[key];
      return {
        name: station.name,
        price: (
          station['prices({"fuel":1})'] &&
          station['prices({"fuel":1})'][0] &&
          (
            station['prices({"fuel":1})'][0].cash?.formattedPrice ||
            station['prices({"fuel":1})'][0].credit?.formattedPrice ||
            'N/A'
          )
        ),
        address: [
          station.address?.line1,
          station.address?.locality
        ].filter(Boolean).join(', ')
      };
    });

    console.log(`Found ${stations.length} stations`);
    return stations;
  } catch (error) {
    console.error('Scraping failed:', error);
    return [];
  } finally {
    await browser.close();
  }
}

// Export the function for use in other files
module.exports = { getGasPrices };

// If running directly, print the results
if (require.main === module) {
  getGasPrices().then(stations => {
    stations.forEach((s, i) => {
      console.log(`${i + 1}. ${s.name}; ${s.price}; ${s.address};`);
    });
  });
}
