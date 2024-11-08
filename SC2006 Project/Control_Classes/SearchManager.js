// Purpose: To manage the search function of the application
async function getDistanceInformation(lat1, lon1, lat2, lon2) {
    try {
        const response = await fetch(`/calculate-distance?lat1=${lat1}&lon1=${lon1}&lat2=${lat2}&lon2=${lon2}`);
        
        // Check if the response is ok (status code in the range 200-299)
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log(`Distance: ${data.distance.toFixed(2)} km`);
        return data.distance;
    } catch (error) {
        console.error('Error fetching distance:', error);
        return null; // or handle the error as needed
    }
}

async function getCarparkLotsDetails_HDB(carparkNum,carparkName){
    try {
        const response = await fetch(`/api/carpark-lots-details/${carparkNum}?carparkName=${encodeURIComponent(carparkName)}`);
        const carParkDetails = await response.json();
        console.log('HDB Lots Detail of nearby carpark:', carParkDetails);
        return carParkDetails;
    } catch (error) {
        console.error('Error fetching details of nearby carpark', error);
        return [];
    }
}

async function getAllCarparkCoor_HDB() {
    try {
        const response = await fetch('/api/carpark-coordinates');
        const data = await response.json(); // Get the coordinates data from the response
        console.log("HDB Carpark Coordinates:", data); // For debugging
        return data; // Return the data for further use
    } catch (error) {
        console.error('Error fetching carpark coordinates:', error);
        return [];
    }
}

async function findNearbyCarparks_HDB(lat, lon) {
    try {
        const response = await fetch(`/api/find-nearby-carparks?lat=${lat}&lon=${lon}`);
        const data = await response.json(); // Get the nearby carparks data from the response
        console.log("HDB Nearby Carparks:", data); // For debugging
        return data; // Return the data for further use
    } catch (error) {
        console.error('Error fetching nearby carparks:', error);
        return [];
    }
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}


//Search
function searchLocation() {
    document.getElementById("autocomplete-list").innerHTML = "";
    const searchQuery = document.getElementById('search').value;

    if (searchQuery.trim() !== "") {
        const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${searchQuery}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;

        $.get(url, function (data) {
            console.log("Data received from OneMap API:", data);

            if (data.results && data.results.length > 0) {
                const firstResult = data.results[0];
                const lat = parseFloat(firstResult.LATITUDE);
                const lng = parseFloat(firstResult.LONGITUDE);
                searchLat = lat;
                searchLong = lng;
                searchLatLng = L.latLng(lat, lng);

                console.log("Location found:", lat, lng);

                // Remove old search marker if it exists
                if (searchMarker) {
                    map.removeLayer(searchMarker);
                }
                
                // Remove the current marker if it exists
                if (currentMarker) {
                    map.removeLayer(currentMarker);
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
                    // getRoute(userLatLng, searchLatLng);
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

//show Suggestions
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


