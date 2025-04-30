// scripts.js
// const apiKey = 'e69c0e8f872a4232ba96d27925f95f3e'; // <<< Replace with your real API key
// Function to fetch stock data and update charts
async function fetchStockData(symbol, chart, timestampElement, titleElement) {
    const apiKey = '4286428c8c92414e82296180f2c21770'; // Replace with your real TwelveData API key
    const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1week&start_date=2023-01-01&apikey=${apiKey}`;

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

            // Update last updated time
            timestampElement.textContent = `Last updated: ${new Date().toLocaleString()}`;

            // Update the title element with the latest price and date
            const latestData = chartData[chartData.length - 1];
            const latestPrice = latestData.c.toFixed(2);
            const latestDate = latestData.x.toLocaleDateString();
            titleElement.textContent = `${symbol}: $${latestPrice} (${latestDate})`;
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
                barThickness: 5,
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
                        unit: 'week',
                        displayFormats: {
                            week: 'yyyy/MMM'
                        },
                        isoWeekday: 1
                    },
                    ticks: {
                        source: 'auto',
                        autoSkip: false,
                        stepSize: 4,
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
    let ampm = h >= 12 ? 'PM' : 'AM';
    
    h = h % 12;
    h = h ? h : 12;
    
    m = checkTime(m);
    s = checkTime(s);
    
    document.getElementById('time').innerHTML = h + ":" + m + ":" + s + " " + ampm;
    setTimeout(startTime, 1000);
}

function checkTime(i) {
    if (i < 10) {i = "0" + i};
    return i;
}

function tdate() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('date').innerHTML = today.toLocaleDateString('en-US', options);
}

// Calendar Functions
function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function getFebDays(year) {
    return isLeapYear(year) ? 29 : 28;
}

function generateCalendar(month, year) {
    if (!calendar_days) return; // Guard clause

    const days_of_month = [31, getFebDays(year), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    calendar_days.innerHTML = '';

    let currDate = new Date();
    let curr_month = month !== undefined ? month : currDate.getMonth();
    let curr_year = year !== undefined ? year : currDate.getFullYear();

    // Update month and year in the header
    month_picker.textContent = month_names[curr_month];
    year_element.textContent = curr_year;

    // Get first day of the month
    let first_day = new Date(curr_year, curr_month, 1);
    let first_day_weekday = first_day.getDay();

    // Create empty cells for days before the first day of the month
    for (let i = 0; i < first_day_weekday; i++) {
        let empty_day = document.createElement('div');
        calendar_days.appendChild(empty_day);
    }

    // Create cells for each day of the month
    for (let day = 1; day <= days_of_month[curr_month]; day++) {
        let day_element = document.createElement('div');
        day_element.classList.add('calendar-day-hover');
        day_element.textContent = day;

        // Highlight current date
        if (day === currDate.getDate() && curr_month === currDate.getMonth() && curr_year === currDate.getFullYear()) {
            day_element.classList.add('curr-date');
        }

        calendar_days.appendChild(day_element);
    }
}

// Initialize calendar
document.addEventListener('DOMContentLoaded', () => {
    // Initialize calendar
    let currDate = new Date();
    let curr_month = {value: currDate.getMonth()};
    let curr_year = {value: currDate.getFullYear()};

    // Create month list
    let month_list = calendar.querySelector('.month-list');
    month_list.innerHTML = '';
    month_names.forEach((e, index) => {
        let month = document.createElement('div');
        month.innerHTML = `<div data-month="${index}">${e}</div>`;
        month.querySelector('div').onclick = () => {
            month_list.classList.remove('show');
            curr_month.value = index;
            generateCalendar(index, curr_year.value);
        };
        month_list.appendChild(month);
    });

    // Set up month picker click handler
    month_picker.onclick = () => {
        month_list.classList.add('show');
    };

    // Set up year navigation
    document.querySelector('#prev-year').onclick = () => {
        curr_year.value--;
        generateCalendar(curr_month.value, curr_year.value);
    };

    document.querySelector('#next-year').onclick = () => {
        curr_year.value++;
        generateCalendar(curr_month.value, curr_year.value);
    };

    // Generate initial calendar
    generateCalendar(curr_month.value, curr_year.value);

    // Initialize charts
    const charts = [
        { symbol: 'DIA', chartId: 'dowChart', timeId: 'dowTimestamp', titleId: 'dowTitle' },
        { symbol: 'QQQ', chartId: 'nasdaqChart', timeId: 'nasdaqTimestamp', titleId: 'nasdaqTitle' },
        { symbol: 'SPY', chartId: 'sp500Chart', timeId: 'sp500Timestamp', titleId: 'sp500Title' },
        { symbol: 'TSLA', chartId: 'teslaChart', timeId: 'teslaTimestamp', titleId: 'teslaTitle' }
    ];

    // Initialize charts
    charts.forEach(({ symbol, chartId, timeId, titleId }) => {
        const chartElement = document.getElementById(chartId);
        const timestampElement = document.getElementById(timeId);
        const titleElement = document.getElementById(titleId);

        const chart = createChart(chartElement);

        fetchStockData(symbol, chart, timestampElement, titleElement);

        setInterval(() => {
            fetchStockData(symbol, chart, timestampElement, titleElement);
        }, 10 * 60 * 1000);
    });

    // Start clock and date
    startTime();
    tdate();
});
