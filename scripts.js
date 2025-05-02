// scripts.js
// const apiKey = '4286428c8c92414e82296180f2c21770'; // <<< Replace with your real API key
// Function to fetch stock data and update charts
async function fetchStockData(symbol, chart, timestampElement, titleElement, displayName) {
    const apiKey = '4286428c8c92414e82296180f2c21770'; // Replace with your real TwelveData API key
    
    // Calculate date one year ago from today
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    // Format date to YYYY-MM-DD
    const startDate = oneYearAgo.toISOString().split('T')[0];
    const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1week&start_date=${startDate}&apikey=${apiKey}`;
    // const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=3day&start_date=${startDate}&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        console.log(`Data fetched for ${symbol}:`, data);

        if (data.status === 'ok' && data.values.length > 0) {
            const chartData = data.values.map(item => ({
                x: new Date(item.datetime),
                o: parseFloat(item.open),
                h: parseFloat(item.high),
                l: parseFloat(item.low),
                c: parseFloat(item.close)
            }));

            // Sort the data by date ascending (older first)
            chartData.sort((a, b) => a.x - b.x);

            // Update the chart
            chart.data.datasets[0].data = chartData;
            chart.update();

            // Get current date and time for the timestamp
            const now = new Date();
            const currentTime = now.toLocaleTimeString('en-US', { hour12: false });
            const currentDate = now.toLocaleDateString('en-US');
            
            // Update last updated time
            timestampElement.textContent = `Last updated: ${currentDate} ${currentTime}`;

            // Update the title element with the latest price
            const latestData = chartData[chartData.length - 1];
            const latestPrice = latestData.c.toFixed(2);
            titleElement.textContent = `${displayName}: $${latestPrice}`;
        } else {
            console.error(`Error fetching data for ${symbol}:`, data);
        }
    } catch (error) {
        console.error(`Error fetching data for ${symbol}: ${error}`);
        alert(`Error fetching data for ${symbol}: ${error}`);
    }
}

// Create Chart
function createChart(chartElement) {
    const ctx = chartElement.getContext('2d');
    return new Chart(ctx, {
        type: 'candlestick',
        data: {
            datasets: [{
                label: '',
                data: [],
                borderColor: '#00ff99',
                backgroundColor: '#00ff99',
                borderWidth: 1,
                barThickness: 3,  // Reduced for 3-day candles
                categoryPercentage: 0.8,
                barPercentage: 1,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',  // Changed from 'week' to 'day'
                        displayFormats: {
                            day: 'MMM dd'  // Updated display format for days
                        }
                    },
                    ticks: {
                        source: 'auto',
                        autoSkip: true,
                        maxTicksLimit: 12,  // Limit the number of x-axis ticks
                        color: '#ffffff',
                        maxRotation: 45,
                        minRotation: 45,
                        font: {
                            size: 14
                        }
                    },
                    grid: {
                        color: '#444',
                        display: true
                    }
                },
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Price (USD)',
                        color: '#ffffff',
                        font: {
                            size: 14
                        }
                    },
                    ticks: {
                        color: '#ffffff',
                        font: {
                            size: 14
                        }
                    },
                    grid: {
                        color: '#444'
                    }
                }
            }
        }
    });
}

// Calendar and Clock Functions
let calendar = document.querySelector('.calendar');
let month_picker = document.querySelector('#month-picker');
let calendar_days = document.querySelector('.calendar-days');
let year_element = document.querySelector('#year');
const month_names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Clock Functions
function startTime() {
    const today = new Date();
    let h = today.getHours();
    let m = today.getMinutes();
    let s = today.getSeconds();
    
    // Add leading zeros
    h = checkTime(h);
    m = checkTime(m);
    s = checkTime(s);
    
    document.getElementById('time').innerHTML = h + ":" + m + ":" + s;
    setTimeout(startTime, 1000);
}

function checkTime(i) {
    if (i < 10) {i = "0" + i};
    return i;
}

function tdate() {
    const today = new Date();
    
    // Get weekday
    const weekday = today.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Get day and month
    const day = today.getDate();
    const month = today.toLocaleDateString('en-US', { month: 'long' });
    
    // Get year
    const year = today.getFullYear();
    
    // Update the DOM elements
    document.getElementById('weekday').textContent = weekday;
    document.getElementById('monthday').textContent = `${day} ${month}`;
    document.getElementById('year-display').textContent = year;
}

// Calendar Functions
function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function getFebDays(year) {
    return isLeapYear(year) ? 29 : 28;
}

function generateCalendar() {
    if (!calendar_days) return;

    const today = new Date();
    
    // Format the header date
    const headerDate = today.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    // Update header with formatted date
    document.getElementById('calendar-header').textContent = headerDate;

    const currMonth = today.getMonth();
    const currYear = today.getFullYear();
    const days_of_month = [31, getFebDays(currYear), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    calendar_days.innerHTML = '';

    // Get first day of the month
    let first_day = new Date(currYear, currMonth, 1);
    let first_day_weekday = first_day.getDay();

    // Create empty cells for days before the first day of the month
    for (let i = 0; i < first_day_weekday; i++) {
        let empty_day = document.createElement('div');
        calendar_days.appendChild(empty_day);
    }

    // Create cells for each day of the month
    for (let day = 1; day <= days_of_month[currMonth]; day++) {
        let day_element = document.createElement('div');
        day_element.textContent = day;

        // Highlight current date
        if (day === today.getDate()) {
            day_element.classList.add('curr-date');
        }

        calendar_days.appendChild(day_element);
    }
}

// Initialize charts
document.addEventListener('DOMContentLoaded', () => {
    generateCalendar();
    
    // Update calendar daily at midnight
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timeUntilMidnight = tomorrow - now;
    
    setTimeout(() => {
        generateCalendar();
        // After first update, update daily
        setInterval(generateCalendar, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);

    // Initialize charts with proper display names
    const charts = [
        { symbol: 'DIA', displayName: 'DOW', chartId: 'dowChart', timeId: 'dowTimestamp', titleId: 'dowTitle' },
        { symbol: 'QQQ', displayName: 'NASDAQ', chartId: 'nasdaqChart', timeId: 'nasdaqTimestamp', titleId: 'nasdaqTitle' },
        { symbol: 'SPY', displayName: 'S&P500', chartId: 'sp500Chart', timeId: 'sp500Timestamp', titleId: 'sp500Title' },
        { symbol: 'TSLA', displayName: 'TESLA', chartId: 'teslaChart', timeId: 'teslaTimestamp', titleId: 'teslaTitle' },
        { symbol: 'BTC/USD', displayName: 'BTC/USD', chartId: 'btcChart', timeId: 'btcTimestamp', titleId: 'btcTitle' }
    ];

    // Initialize charts
    charts.forEach(({ symbol, displayName, chartId, timeId, titleId }) => {
        const chartElement = document.getElementById(chartId);
        const timestampElement = document.getElementById(timeId);
        const titleElement = document.getElementById(titleId);

        const chart = createChart(chartElement);

        fetchStockData(symbol, chart, timestampElement, titleElement, displayName);

        setInterval(() => {
            fetchStockData(symbol, chart, timestampElement, titleElement, displayName);
        }, 10 * 60 * 1000);
    });

    // Start clock and date
    startTime();
    tdate();
});
