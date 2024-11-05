// Dependencies: Control_Classes/SearchManager.js, Control_Classes/RouteManager.js, Control_Classes/HistoryManager.js
async function populateCarparkSidebar(carparks, markers) {

    const checkDistance = document.getElementById('filter-distance').checked;
    const checkPrice = document.getElementById('filter-price').checked;
    const checkLots = document.getElementById('filter-lots').checked;

    if (checkDistance) carparks = filterByDistance(carparks);
    if (checkPrice) carparks = filterByPrice(carparks);
    if (checkLots) carparks = filterByLots(carparks);

    const sidebar = document.getElementById('parking-lots');
    sidebar.innerHTML = '';  // Clear existing content
    
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

    if (carparks.length > 0) {
        for (let i = 0; i < carparks.length; i++) {

            const carpark = carparks[i]//.split(',').map(coord => coord.trim());
            const carparkNumber = carpark[0];
            const carparkName = carpark[3];
            const dist = carpark[4];
            const price = carpark[5];
            const parkinglots = carpark[6];
            let formattedParkingLots = '';

            try {
                formattedParkingLots = parkinglots
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
                        <p>Available Parking Lots:\n<strong>${formattedParkingLots}</strong></p>
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
                markers.forEach((marker, markerIndex) => {
                    const collapsibleContent = sidebar.querySelectorAll('.collapsible-content')[markerIndex];
                    const isContentActive = collapsibleContent.classList.contains('active');
                    marker.setIcon(isContentActive ? activeIcon : defaultIcon);
                });
            });

            // Add event listener for the select button
            const selectButton = collapsible.querySelector('.select-carpark');
            selectButton.addEventListener('click', () => {
                selectCarpark(carpark, markers);
                selectedCarparkId = `Carpark-${carparkNumber}`;
                synchronizeButtons();
            });

            sidebar.appendChild(collapsible);

            // Set marker to activeIcon if it’s the first carpark
            if (markers[i]) {
                markers[i].setIcon(i === 0 ? activeIcon : defaultIcon);
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

// Function overrides searchLocation() in SearchManager.js
function searchLocation() {
    const searchQuery = document.getElementById('search').value;

    if (searchQuery.trim() !== "") {
        const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${searchQuery}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;

        $.get(url, function (data) {
            console.log("Data received from OneMap API:", data);

            if (data.results && data.results.length > 0) {
                const firstResult = data.results[0];
                const lat = parseFloat(firstResult.LATITUDE);
                const lng = parseFloat(firstResult.LONGITUDE);
                searchLatLng = L.latLng(lat, lng);

                searchLat = lat;
                searchLong = lng;

                console.log("Location found:", lat, lng);

                // Remove old search marker if it exists
                if (searchMarker) {
                    map.removeLayer(searchMarker);
                }

                if (circle) {
                    map.removeLayer(circle);
                    circle = null;
                }

                // Add marker for the searched location
                searchMarker = L.marker([lat, lng]).addTo(map)
                    .bindPopup(`Search Result: ${firstResult.SEARCHVAL}`)
                    .openPopup();

                // Center the map to the search result location
                map.setView([lat, lng], 16);

                // Call routing function if user's location is available
                if (userLatLng) {
                    displayNearbyCarparks_HDB(lat, lng);
                    getRoute(userLatLng, searchLatLng);
                } else {
                    console.error("User location is not available.");
                }

            } else {
                alert("No results found.");
                console.warn("No results returned from OneMap API.");
            }
        }).fail(function (error) {
            alert("Error fetching data from OneMap API.");
            console.error("Error fetching data from OneMap API:", error);
        });
    } else {
        alert("Please enter a location to search for.");
    }
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
