// scripts.js
// const apiKey = 'e69c0e8f872a4232ba96d27925f95f3e'; // <<< Replace with your real API key

// Function to fetch stock data and update charts
async function fetchStockData(symbol, chart, timestampElement) {
    const apiKey = 'e69c0e8f872a4232ba96d27925f95f3e'; // Replace this with your actual API key
    const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1week&start_date=2023-01-01&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        console.log(`Data fetched for ${symbol}:`, data); // Debugging line: log the fetched data

        if (data.status === 'ok' && data.values.length > 0) {
            // Log the raw data values
            console.log(`Parsed data for ${symbol}:`, data.values);

            // Map the raw data into the format for Chart.js
            const chartData = data.values.map(item => ({
                x: new Date(item.datetime),
                o: parseFloat(item.open),
                h: parseFloat(item.high),
                l: parseFloat(item.low),
                c: parseFloat(item.close)
            }));

            console.log(`Formatted data for ${symbol}:`, chartData); // Debugging line: log the formatted chart data

            // Update the chart with the new data
            chart.data.datasets[0].data = chartData;
            chart.update();

            // Update the timestamp
            timestampElement.textContent = `Last updated: ${new Date().toLocaleString()}`;
        } else {
            console.error(`Error fetching data for ${symbol}: No data returned`);
        }
    } catch (error) {
        console.error(`Error fetching data for ${symbol}: ${error}`);
        alert(`Error fetching data for ${symbol}: ${error}`); // Alert to show the error in case of an issue
    }
}

// Initialize the chart for a given symbol
function createChart(chartElement, symbol) {
    const ctx = chartElement.getContext('2d');
    return new Chart(ctx, {
        type: 'candlestick', // This is where the candlestick chart type is defined
        data: {
            datasets: [{
                label: `${symbol} Candlestick Chart`,
                data: [],  // Empty data will be filled later
                borderColor: '#FF5733',
                backgroundColor: '#FF5733',
                borderWidth: 1,
                // Set the width of the candlesticks to a smaller size
                barThickness: 5,  // Controls the width of each candlestick (adjust this value)
                categoryPercentage: 0.8,  // Controls the spacing between candlesticks
                barPercentage: 1, // Ensures candlesticks occupy full space
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'week',
                        tooltipFormat: 'll', // Date format for the tooltip
                        displayFormats: {
                            week: 'MMM dd, yyyy' // Format for date on x-axis
                        }
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    },
                    ticks: {
                        maxRotation: 0,  // Ensures that the labels on x-axis are not rotated
                        autoSkip: true,  // Skips ticks if needed
                    },
                },
                y: {
                    ticks: {
                        beginAtZero: false
                    },
                    title: {
                        display: true,
                        text: 'Price (USD)'
                    }
                }
            }
        }
    });
}

// Initialize and fetch data for each stock chart
document.addEventListener('DOMContentLoaded', () => {
    // DOW (DIA) Chart
    const dowChartElement = document.getElementById('dowChart');
    const dowTimestamp = document.getElementById('dowTimestamp');
    const dowChart = createChart(dowChartElement, 'DIA');
    fetchStockData('DIA', dowChart, dowTimestamp);

    // NASDAQ (QQQ) Chart
    const nasdaqChartElement = document.getElementById('nasdaqChart');
    const nasdaqTimestamp = document.getElementById('nasdaqTimestamp');
    const nasdaqChart = createChart(nasdaqChartElement, 'QQQ');
    fetchStockData('QQQ', nasdaqChart, nasdaqTimestamp);

    // S&P 500 (SPY) Chart
    const sp500ChartElement = document.getElementById('sp500Chart');
    const sp500Timestamp = document.getElementById('sp500Timestamp');
    const sp500Chart = createChart(sp500ChartElement, 'SPY');
    fetchStockData('SPY', sp500Chart, sp500Timestamp);

    // Tesla (TSLA) Chart
    const teslaChartElement = document.getElementById('teslaChart');
    const teslaTimestamp = document.getElementById('teslaTimestamp');
    const teslaChart = createChart(teslaChartElement, 'TSLA');
    fetchStockData('TSLA', teslaChart, teslaTimestamp);

    // Refresh charts every 5 minutes
    setInterval(() => {
        fetchStockData('DIA', dowChart, dowTimestamp);
        fetchStockData('QQQ', nasdaqChart, nasdaqTimestamp);
        fetchStockData('SPY', sp500Chart, sp500Timestamp);
        fetchStockData('TSLA', teslaChart, teslaTimestamp);
    }, 5 * 60 * 1000); // 5 minutes in milliseconds
});
