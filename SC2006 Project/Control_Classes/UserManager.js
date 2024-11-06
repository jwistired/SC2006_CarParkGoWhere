// Dependencies: Control_Classes/SearchManager.js, Control_Classes/RouteManager.js, Control_Classes/HistoryManager.js
async function populateCarparkSidebar(carparks) {

    const checkDistance = document.getElementById('filter-distance').checked;
    const checkPrice = document.getElementById('filter-price').checked;
    const checkLots = document.getElementById('filter-lots').checked;

    // Define default and active icons as instances of L.icon
    const defaultIcon = L.icon({
        iconUrl: '/css/images/parkingicon.png', // Set your path here
        iconSize: [40, 40], // Size of the icon
        iconAnchor: [12, 41], // Point of the icon which will correspond to marker's location
        popupAnchor: [1, -34], // Point from which the popup should open relative to the iconAnchor
    });

    const activeIcon = L.icon({
        iconUrl: '/css/images/parkingicon-selected.png', // Set your path here
        iconSize: [60, 60],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });

    if (checkDistance) carparks = filterByDistance(carparks);
    if (checkPrice) carparks = filterByPrice(carparks);
    if (checkLots) carparks = filterByLots(carparks);

    if( checkDistance || checkPrice || checkLots){
        // Remove existing markers from the map
        currentCarparks.forEach(marker => map.removeLayer(marker));  
        if (currentMarker) {
            map.removeLayer(currentMarker);
        }

        // Create new markers after filtering
        currentCarparks = carparks.map(carpark => 
            L.marker([carpark[1], carpark[2]])
        );

        // Add new markers to the map
        currentCarparks.forEach((marker, i) => {
            marker.setIcon(i === 0 ? activeIcon : defaultIcon); // Set active icon for the first item
            marker.addTo(map);
        });
    }

    const sidebar = document.getElementById('parking-lots');
    sidebar.innerHTML = '';  // Clear existing content

    if (carparks.length > 0) {
        for (let i = 0; i < carparks.length; i++) {

            const carpark = carparks[i]
            const carparkNumber = carpark[0];
            const carparkName = carpark[3];
            const dist = carpark[4];
            const price = carpark[5];
            const parkinglots = carpark[6];
            let formattedParkingLots = '';

            try {
                formattedParkingLots = parkinglots
                    .sort((a, b) => {
                        const lotTypeOrder = { 'C': 1, 'Y': 2, 'H': 3 };
                        return (lotTypeOrder[a.lot_type] || 4) - (lotTypeOrder[b.lot_type] || 4);
                    })
                    .map(lot => {
                        if (lot && lot.lot_type && typeof lot.available !== 'undefined') {
                            return `Lot Type ${lot.lot_type}: ${lot.available}`;
                        } else {
                            throw new Error('Invalid lot data');
                        }
                    })
                    .join('<br>');
            } catch (error) {
                console.error("Error formatting parking lots:", error.message);
                formattedParkingLots = 'Info not available';
            }

            // Create collapsible element
            const collapsible = document.createElement('div');
            collapsible.className = 'collapsible';
            collapsible.innerHTML = `
                <button class="collapsible-btn ${i === 0 ? 'active' : ''}" id="" style="${i === 0 ? 'background-color: green;' : ''}">Carpark ${carparkNumber}: ${carparkName}</button>
                <div class="collapsible-content ${i === 0 ? 'active' : ''}" style="${i === 0 ? 'display: block; background-color: #c2ffcd;' : 'display: none;'}">
                    <div class="info-item">
                        <img src="/css/images/distance.png" alt="Distance Icon" class="info-icon">
                        <p style="padding-top: 20px;">Distance from destination: <strong>${parseFloat(dist).toFixed(2)}km</strong></p>
                    </div>
                    <div class="info-item">
                        <img src="/css/images/price.png" alt="Price Icon" class="info-icon">
                        <p>Price: <strong>${price}</strong></p>
                    </div>
                    <div class="info-item" style="padding-bottom: 15px;">
                        <img src="/css/images/parkingLots.png" alt="Parkinglot Icon" class="info-icon">
                        <p>Available Parking Lots:\n<br><strong>${formattedParkingLots}</strong></p>
                        <button class="select-carpark" data-carpark-id="Carpark-${carparkNumber}">Select</button>
                    </div>
                </div>`;

            // Toggle content visibility and style
            collapsible.querySelector('.collapsible-btn').addEventListener('click', () => {
                const content = collapsible.querySelector('.collapsible-content');
                const button = collapsible.querySelector('.collapsible-btn');
                
                // Check if the content is currently active (visible)
                const isActive = content.classList.contains('active');

                // Toggle visibility
                if (content.style.display === 'block') {
                    content.style.display = 'none';
                    button.classList.remove('active'); // Remove active class
                    content.classList.remove('active'); // Remove active class from content
                    button.style.backgroundColor = ''; // Reset button color
                    content.style.backgroundColor = ''; // Reset content color
                } else {
                    content.style.display = 'block';
                    button.classList.add('active'); // Add active class
                    content.classList.add('active'); // Add active class to content
                    button.style.backgroundColor = 'green'; // Change button color to green
                    content.style.backgroundColor = '#c2ffcd'; // Change content color to green
                }

                // Set marker icons based on open state of collapsibles
                currentCarparks.forEach((marker, markerIndex) => {
                    const collapsibleContent = sidebar.querySelectorAll('.collapsible-content')[markerIndex];
                    const isContentActive = collapsibleContent.classList.contains('active');
                    marker.setIcon(isContentActive ? activeIcon : defaultIcon);
                });
            });

            // Add event listener for the select button
            const selectButton = collapsible.querySelector('.select-carpark');
            selectButton.addEventListener('click', () => {
                selectCarpark(carpark, currentCarparks);
                selectedCarparkId = `Carpark-${carparkNumber}`;
                synchronizeButtons();
            });

            sidebar.appendChild(collapsible);

            // Set marker to activeIcon if it’s the first carpark
            if (currentCarparks[i]) {
                currentCarparks[i].setIcon(i === 0 ? activeIcon : defaultIcon);
            }
        }
    }
}

// Function to select a carpark from the sidebar
function selectCarpark(carpark, markers) {
           
    // Get the button and collapsible content associated with the clicked carpark
    const button = document.querySelector(`[data-carpark-id="Carpark-${carpark[0]}"]`);
    const collapsibleContent = button.closest('.collapsible-content');
    const collapsibles = document.querySelectorAll('.collapsible-content');

    // Accessing all carpark info
    const carparkNum = carpark[0];
    const lat = parseFloat(carpark[1]);
    const long = parseFloat(carpark[2]);
    const carparkName = carpark[3];
    const distance = carpark[4];
    const price = carpark[5];
    const parkingLots = carpark[6];

    // Populate the history sidebar with carpark info as an array
    populateHistSidebar([carparkNum, lat, long, carparkName, distance, price, parkingLots], markers);

    // Reset the previous button, if one was selected
    if (lastSelectedButton && lastSelectedButton !== button) {
        lastSelectedButton.style.backgroundColor = '#2196F3';
        lastSelectedButton.textContent = 'Select';
    }

    // Close all other collapsibles and hide all markers except the selected one
    collapsibles.forEach((content, index) => {
        const isSelectedContent = content === collapsibleContent;

        content.style.display = isSelectedContent ? 'block' : 'none';
        content.previousElementSibling.style.backgroundColor = isSelectedContent ? 'green' : '';
        content.style.backgroundColor = isSelectedContent ? '#c2ffcd' : '';

    });

    // remove all markers
    markers.forEach(marker => {
        map.removeLayer(marker);
    });

    // Remove the current marker if it exists
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }

    // Add marker for selected carpark
    currentMarker = L.marker([lat, long]).addTo(map);
    setMarkerStyle(currentMarker, true);

    // Center map create bounds to encompass both points
    const carparkLatLng = L.latLng(lat, long);
    map.setView(carparkLatLng, 16);
    getRouteDestToCarPark(userLatLng,carparkLatLng);
    
    // Toggle the current button to "selected" state
    button.style.backgroundColor = 'grey';
    button.textContent = 'Selected';

    // Update the last selected button and collapsible
    lastSelectedButton = button;
    lastSelectedCollapsible = collapsibleContent;
}

//Function overrides showSuggestions() in SearchManager.js
function showSuggestions() {
    const searchQuery = document.getElementById('search').value.trim();

    if (searchQuery !== "") {
        const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${searchQuery}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;

        $.get(url, function (data) {
            // Clear previous suggestions
            let autocompleteList = document.getElementById("autocomplete-list");
            autocompleteList.innerHTML = "";

            if (data.results.length > 0) {
                // Create and display suggestions
                data.results.forEach(result => {
                    let suggestionItem = document.createElement("div");
                    suggestionItem.innerHTML = result.SEARCHVAL;
                    suggestionItem.classList.add("autocomplete-suggestion");

                    // Add click event to use the clicked suggestion
                    suggestionItem.addEventListener("click", function () {
                        document.getElementById('search').value = result.SEARCHVAL;
                        autocompleteList.innerHTML = ""; // Clear the suggestions
                        searchLocation(); // Trigger the search function
                        opensideBar();
                        fetchUserHistory(email);
                        openhistBar();
                    });

                    // Append the suggestion to the list
                    autocompleteList.appendChild(suggestionItem);
                });
            }
        }).fail(function () {
            console.error("Error fetching autocomplete suggestions from OneMap API.");
        });
    } else {
        // Clear suggestions if no input
        document.getElementById("autocomplete-list").innerHTML = "";
}}

// User History Functions
// Function to populate carpark data from database in history sidebar
async function populateCarparkDataFromDB(carparks) {
    if (carparks.length > 0) {
        for (let i = 0; i < carparks.length; i++) {
            const carpark = carparks[i];
            console.log("CARPARK: ", carpark);
            const carparkNumber = carpark.car_park_no;
            const carparkName = carpark.address;
            const latitude = carpark.x_cord; 
            const longitude = carpark.y_cord;
            let parkingLots = "N/A";
            let distance = "N/A";
            let price = "N/A";
            let carparkMarker 
        
            if (!isNaN(latitude) && !isNaN(longitude)) {

                // Initialise marker
                carparkMarker = L.marker([latitude, longitude]);
                setMarkerStyle(carparkMarker, false);

                parkingLots = await getCarparkLotsDetails_HDB(carparkNumber, carparkName);
                distance = await getDistanceInformation(latitude, longitude, userLatLng.lat, userLatLng.lng);
                distance = parseFloat(distance);
                const isCentral = central.some(c => c.code === carparkNumber);
                price = isCentral ? "$1.20 per half-hour" : "$0.60 per half-hour";
            }

            console.log("DIST: ", distance);
            console.log("PRICE: ", price);
            console.log("LOTS: ", parkingLots);

            // Push the results for the current carpark into the results array
            populateHistSidebar([carparkNumber, latitude, longitude, carparkName, distance, price, parkingLots], [carparkMarker]);
            
        }
    }
}

// Function to fetch user history from the database
async function fetchUserHistory(email) {
    try {
        const response = await fetch(`/userHistory/${email}`); // Adjust the URL as necessary
        const historyData = await response.json(); // Parse the JSON response
        console.log("FETCHED USER HIST: ", historyData);
        // Process the history data (you may want to call another function to display it)
        populateCarparkDataFromDB(historyData);
    } catch (error) {
        console.error("Error fetching user history:", error);
    }
}

// Update carpark history to database
async function updateHistToDB(carpark) {
    try {
        // console.log("EMAIL: ", email);
        const response = await fetch('/updateHistory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(carpark)
        });
        const result = await response.json(); // Assuming your API returns the new history record
        console.log("New history record ID:", result._id);
        return result._id; // Store this ID for future reference
    } catch (error) {
        console.error("Error updating carpark history:", error);
    }
}

// Function to remove an entry from the parking history
async function removeFromHistory(button) {
    const historyEntry = button.closest('.history-entry');
    if (historyEntry) {
        const historyId = historyEntry.dataset.historyId; // Retrieve the history ID
        console.log("Removing history record ID:", historyId);

        // Call your API to delete the history entry from the database
        await deleteHistoryEntryFromDB(historyId); // Assuming this function handles deletion

        historyEntry.remove(); // Remove the history entry from the sidebar
    }
}

// Delete carpark history from database
async function deleteHistoryEntryFromDB(id) {
    try {
        const response = await fetch('/deleteHistory/' + id, {
            method: 'DELETE', // Use DELETE method for deletion
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }) // Send the ID to delete
        });

        const result = await response.json();
        console.log(result.message); // Log success message

    } catch (error) {
        console.error("Error deleting history entry:", error);
    }
}

async function populateHistSidebar(carparkInfo, markers) {
    const historySidebar = document.getElementById('parking-history');

    // Create collapsible element for the history item
    const historyEntry = document.createElement('div');
    historyEntry.className = 'history-entry';

    // Log carparkInfo to ensure it has the correct structure
    console.log("Carpark Info:", carparkInfo);
    const [carparkNumber, lat, long, carparkName, distance, price, parkingLots] = carparkInfo;
    
    // Check for duplicates in the history sidebar
    const existingEntries = historySidebar.querySelectorAll('.history-entry');
    for (const entry of existingEntries) {
        const entryCarparkId = entry.querySelector('.select-history').dataset.carparkId;
        if (entryCarparkId === `Carpark-${carparkNumber}`) {
            return; // Exit if the carpark is already in history
        }
    }

    console.log("HIST PARKING DETAILS: ", parkingLots);
    let formattedParkingLots='';
    try {
        formattedParkingLots = parkingLots
            .map(lot => {
                if (lot && lot.lot_type && typeof lot.available !== 'undefined') {
                    return `Lot Type ${lot.lot_type}: ${lot.available}`;
                } else {
                    throw new Error('Invalid lot data');
                }
            })
            .join('<br>');
    } catch (error) {
        console.error("Error formatting parking lots:", error.message);
        formattedParkingLots = 'Info not available';
    }

    // Create collapsible button and content
    historyEntry.innerHTML = `
        <button class="collapsible-btn">Carpark ${carparkNumber}: ${carparkName}</button>
        <div class="collapsible-content" style="display: none;">
            <div class="info-item">
                <img src="/css/images/distance.png" alt="Distance Icon" class="info-icon">
                <p style="padding-top: 20px;">Distance: <strong>${parseFloat(distance).toFixed(2)}km</strong></p>
            </div>
            <div class="info-item">
                <img src="/css/images/price.png" alt="Price Icon" class="info-icon">
                <p>Price: <strong>${price}</strong></p>
            </div>
            <div class="info-item">
                <img src="/css/images/parkingLots.png" alt="Parkinglot Icon" class="info-icon">
                <p style="padding-bottom: 20px;">Available Parking Lots:\n<strong>${formattedParkingLots}</strong></p>
            </div>
            <div class="history-buttons">
                <button class="select-history" data-carpark-id="Carpark-${carparkNumber}" style="width: 100px;">Select</button>
                <button class="remove-history" onclick="removeFromHistory(this)" style="width: 100px;">Remove</button>
            </div>
        </div>
    `;

    // Update history to database
    const newHistoryEntry = {email: email,
                            car_park_no: carparkNumber, 
                            address: carparkName, 
                            x_cord: lat, 
                            y_cord: long};

    const newHistoryID = await updateHistToDB(newHistoryEntry);
    
    // Set the ID as a data attribute on the historyEntry
    historyEntry.dataset.historyId = newHistoryID; // Store the history ID in the entry

    // Append the new entry to the history sidebar
    historySidebar.appendChild(historyEntry);

    // Toggle collapsible content visibility
    historyEntry.querySelector('.collapsible-btn').addEventListener('click', () => {
        const content = historyEntry.querySelector('.collapsible-content');
        const button = historyEntry.querySelector('.collapsible-btn');

        // Check if the content is currently active (visible)
        const isActive = content.style.display === 'block';

        // Toggle visibility
        content.style.display = isActive ? 'none' : 'block';
    });

    // Add event listener for the "Select" button in history sidebar
    const selectHistoryButton = historyEntry.querySelector('.select-history');
    selectHistoryButton.addEventListener('click', function() {
        const carparkNum = carparkNumber; // Get the carpark number
        selectCarpark(carparkInfo, markers); // Call selectCarpark function
        selectedCarparkId = `Carpark-${carparkNumber}`;
        synchronizeButtons();
    });

    historyRecord.push(newHistoryID);
}
