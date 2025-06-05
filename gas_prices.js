async function updateGasPrices() {
    try {
        const response = await fetch('/api/gas-prices');
        const stations = await response.json();
        
        const gasPricesContainer = document.getElementById('gasPrices');
        
        // Create header
        const header = document.createElement('div');
        header.className = 'day header';
        header.innerHTML = `
            <div class="cell">Station</div>
            <div class="cell">Price</div>
            <div class="cell">Location</div>
        `;
        
        // Clear existing content
        gasPricesContainer.innerHTML = '';
        gasPricesContainer.appendChild(header);
        
        // Add each station
        stations.forEach(station => {
            const stationDiv = document.createElement('div');
            stationDiv.className = 'day';
            stationDiv.innerHTML = `
                <div class="cell">${station.name}</div>
                <div class="cell">${station.price}</div>
                <div class="cell">${station.address}</div>
            `;
            gasPricesContainer.appendChild(stationDiv);
        });
    } catch (error) {
        console.error('Failed to update gas prices:', error);
    }
}

// Update gas prices every 5 minutes
setInterval(updateGasPrices, 5 * 60 * 1000);

// Initial update
updateGasPrices(); 