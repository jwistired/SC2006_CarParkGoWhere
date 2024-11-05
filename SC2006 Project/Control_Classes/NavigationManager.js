//Set central carparks codes and prices
let central = [
    { code: "ACB", name: "Block 270, 271 Albert Centre" },
    { code: "BBB", name: "Block 232 Bras Basah Complex" },
    { code: "BRB1", name: "Block 665 Tekka Centre" },
    { code: "CY", name: "Block 269, 269A, 269B Cheng Yan Court" },
    { code: "DUXM", name: "Block 1 The Pinnacle @ Duxton" },
    { code: "HLM", name: "Block 531A Upper Cross Street" },
    { code: "KAB", name: "Block 334 Kreta Ayer Road" },
    { code: "KAM", name: "Block 335 Kreta Ayer Road" },
    { code: "KAS", name: "Block 333 Kreta Ayer Road" },
    { code: "PRM", name: "Block 33 Park Crescent" },
    { code: "SLS", name: "Block 4 Sago Lane" },
    { code: "SR1", name: "Block 10 Selegie Road" },
    { code: "SR2", name: "Block 8, 9 Selegie Road" },
    { code: "TPM", name: "Tanjong Pagar Plaza" },
    { code: "UCS", name: "Block 34 Upper Cross Street" },
    { code: "WCB", name: "Block 261, 262, 264 Waterloo Centre" }
];

async function displayNearbyCarparks_HDB(lat, lon) {
    // Remove the previous circle
    if (circle) {
        map.removeLayer(circle);
        circle = null;
    }

    // Remove the current marker if it exists
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }

    // If there is an existing route, remove it
    if (currentRoute) {
        map.removeLayer(currentRoute);
    }

    // Remove the previous carpark markers
    currentCarparks.forEach(marker => {
        map.removeLayer(marker);
    });
    currentCarparks = []; // Reset the array

    // Create a new circle at the destination
    circle = L.circle([lat, lon], 500).addTo(map); // Circle radius is set to 500 meters

    console.log('Fetching HDB carpark coordinates...');
    // Fetch nearby carparks from HDB
    const nearbyCarparksHDB = await findNearbyCarparks_HDB(lat, lon); // Ensure this function fetches data correctly
    
    if (nearbyCarparksHDB.length > 0) {
        for (let i = 0; i < nearbyCarparksHDB.length; i++) {
            const coords = nearbyCarparksHDB[i].split(',').map(coord => coord.trim());
            const carparkNumber = coords[0];
            const latitude = parseFloat(coords[1]);
            const longitude = parseFloat(coords[2]);
            const carparkName = coords[3];

            if (!isNaN(latitude) && !isNaN(longitude)) {
                
                const carparkMarker = L.marker([latitude, longitude]).addTo(map)
                    .bindPopup(`<strong>Car Park</strong><br>Coordinates: ${latitude}, ${longitude}`);

                // Initial marker style
                setMarkerStyle(carparkMarker, false);

                let carparkLotsDetails_HDB = await getCarparkLotsDetails_HDB(carparkNumber, carparkName);
                let availableLots = "N/A"; // Default value if details not found
                let carparkDistDetails_HDB = await getDistanceInformation(latitude, longitude, userLatLng.lat, userLatLng.lng);
                carparkDistDetails_HDB = parseFloat(carparkDistDetails_HDB);
                coords[4] = carparkDistDetails_HDB;
                const isCentral = central.some(c => c.code === carparkNumber);
                let pricing = isCentral ? "$1.20 per half-hour" : "$0.60 per half-hour";
                coords[6] = carparkLotsDetails_HDB; // Store available lots in coords[6]

                nearbyCarparksHDB[i] = [
                    carparkNumber,
                    latitude,
                    longitude,
                    carparkName,
                    carparkDistDetails_HDB,
                    pricing,
                    carparkLotsDetails_HDB
                ];
                
                carparkMarker.bindPopup(
                    carparkMarker.getPopup().getContent() +
                    `<br><strong>Details:</strong> ${JSON.stringify(carparkLotsDetails_HDB)}` +
                    `<br><strong>Distance:</strong> ${carparkDistDetails_HDB} meters` +
                    `<br><strong>Pricing:</strong> ${coords[5]}` +
                    `<br><strong>Available Lots:</strong> ${availableLots}`
                );
                
                // Store each carpark marker in the array
                currentCarparks.push(carparkMarker);
                
            }
        }
        console.log("HDB Carpark Coordinates with Distance, Pricing, and Availability:", nearbyCarparksHDB);
    } else {
        console.log('No nearby HDB carparks found.');
    }
    populateCarparkSidebar(nearbyCarparksHDB, currentCarparks);
    getRoute(userLatLng, searchLatLng);
}

// Marker color change function
function setMarkerStyle(marker, isSelected) {
    if (!isSelected) {
        marker.setIcon(L.icon({
            iconUrl: '/css/images/parkingicon.png',  // URL for selected marker icon
            iconSize: [40, 40],
            iconAnchor: [12, 41]
        }));
    } else {
        marker.setIcon(L.icon({
            iconUrl: '/css/images/parkingicon-selected.png',  // URL for default marker icon
            iconSize: [55, 55],
            iconAnchor: [12, 41]
        }));
    }
}

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
            });

            sidebar.appendChild(collapsible);

            // Set marker to activeIcon if it’s the first carpark
            if (currentCarparks[i]) {
                currentCarparks[i].setIcon(i === 0 ? activeIcon : defaultIcon);
            }
        }
    }
}

// Function to update all select buttons based on selectedCarparkId
function synchronizeButtons() {
    // Update select buttons in parking-lots sidebar
    const parkingLotButtons = document.querySelectorAll('.select-carpark');
    const historyButtons = document.querySelectorAll('.select-history');

    parkingLotButtons.forEach(button => {
        if (button.dataset.carparkId === selectedCarparkId) {
            button.style.backgroundColor = 'grey';
            button.textContent = 'Selected';
        } else {
            button.style.backgroundColor = '#2196F3';
            button.textContent = 'Select';
        }
    });

    historyButtons.forEach(button => {
        if (button.dataset.carparkId === selectedCarparkId) {
            button.style.backgroundColor = 'grey';
            button.textContent = 'Selected';
        } else {
            button.style.backgroundColor = '#2196F3';
            button.textContent = 'Select';
        }
    });

    // Check if the selected carpark exists in the parking-lot sidebar
    const carparkExistsInSidebar = Array.from(parkingLotButtons).some(button => button.dataset.carparkId === selectedCarparkId);

    if (!carparkExistsInSidebar && selectedCarparkId) {
        // Clear parking-lot sidebar and show only the selected carpark from history
        const selectedHistoryButton = Array.from(historyButtons).find(button => button.dataset.carparkId === selectedCarparkId);
        if (selectedHistoryButton) {
            const carparkInfo = getCarparkInfoFromHistory(selectedHistoryButton);
            populateCarparkSidebar([carparkInfo], markers);
        }
    }
}

// Function to select a carpark from the sidebar
function selectCarpark(carpark) {
           
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
    currentCarparks.forEach(marker => {
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
    // const bounds = L.latLngBounds([searchLatLng,carparkLatLng]);
    map.setView(carparkLatLng, 16);
    // map.fitBounds(bounds);
    getRouteDestToCarPark(userLatLng,carparkLatLng);
    
    // Toggle the current button to "selected" state
    button.style.backgroundColor = 'grey';
    button.textContent = 'Selected';

    // Update the last selected button and collapsible
    lastSelectedButton = button;
    lastSelectedCollapsible = collapsibleContent;
}

// Get user's location
function showUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            userLatLng = L.latLng(position.coords.latitude, position.coords.longitude);

            // Add marker for user's location
            L.marker(userLatLng).addTo(map)
                .bindPopup('<p id="locationText" class="currloc">Your location</p>')
                .openPopup();

            // Center map on user's location
            map.setView(userLatLng, 16);
            console.log("User location retrieved:", position.coords.latitude, position.coords.longitude);
            
        }, function (error) {
            console.error("Error getting location: ", error.message);
            alert("Error retrieving your location. Please enable location permissions or check your browser's security settings.");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}
