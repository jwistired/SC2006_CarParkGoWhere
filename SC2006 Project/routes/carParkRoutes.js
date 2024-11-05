// Function to get the route between user location and searched location
async function getRoute(startLatLng, endLatLng) {
    if (!startLatLng || !endLatLng) {
        console.error("Start or end location is missing.");
        return;
    }

    // Get current date and time for the route request
    const currentDate = new Date();
    const formattedDate = `${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}-${currentDate.getFullYear()}`;
    const formattedTime = `${String(currentDate.getHours()).padStart(2, '0')}${String(currentDate.getMinutes()).padStart(2, '0')}00`;

    // Construct the API URL according to the documentation
    const routeUrl = `https://www.onemap.gov.sg/api/public/routingsvc/route?start=${startLatLng.lat},${startLatLng.lng}&end=${endLatLng.lat},${endLatLng.lng}&routeType=drive`;

    $.ajax({
        url: routeUrl,
        type: 'GET',
        headers: {
            'Authorization': apiToken //fetch oneMapToken
        },
        success: async function (data) { // Make the success callback async
            if (data && data.route_geometry) {
                // Decode the route geometry to get the polyline coordinates
                const routeCoordinates = decodePolyline(data.route_geometry);

                // If there is an existing route, remove it
                if (currentRoute) {
                    map.removeLayer(currentRoute);
                }

                // Remove the previous circle
                if (circle) {
                    map.removeLayer(circle);
                    circle = null;
                }

                // Remove the previous carpark markers
                currentCarparks.forEach(marker => {
                    map.removeLayer(marker);
                });
                currentCarparks = []; // Reset the array

                // Draw the new route on the map
                currentRoute = L.polyline(routeCoordinates, { color: 'blue', opacity: 0.6, weight: 8 }).addTo(map);
                circle = L.circle([endLatLng.lat, endLatLng.lng], 500).addTo(map);
            } else {
                alert("No route found between the specified locations.");
            }
        },
        error: function () {
            alert("Error fetching route from OneMap API.");
        }
    });
}

// Function to decode polyline into an array of coordinates
function decodePolyline(encoded) {
    let points = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
        let b, shift = 0, result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += dlat;

        shift = 0;
        result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        points.push([lat / 1E5, lng / 1E5]);
    }

    return points;
}

// Function to get the route between user location and searched location
async function getRouteDestToCarPark(startLatLng, endLatLng) {
    if (!startLatLng || !endLatLng) {
        console.error("Start or end location is missing.");
        return;
    }

    // Get current date and time for the route request
    const currentDate = new Date();
    const formattedDate = `${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}-${currentDate.getFullYear()}`;
    const formattedTime = `${String(currentDate.getHours()).padStart(2, '0')}${String(currentDate.getMinutes()).padStart(2, '0')}00`;

    // Construct the API URL according to the documentation
    const routeUrl = `https://www.onemap.gov.sg/api/public/routingsvc/route?start=${startLatLng.lat},${startLatLng.lng}&end=${endLatLng.lat},${endLatLng.lng}&routeType=drive`;

    $.ajax({
        url: routeUrl,
        type: 'GET',
        headers: {
            'Authorization': apiToken //fetch oneMapToken
        },
        success: async function (data) { // Make the success callback async
            if (data && data.route_geometry) {
                // Decode the route geometry to get the polyline coordinates
                const routeCoordinates = decodePolyline(data.route_geometry);

                // If there is an existing route, remove it
                if (currentRoute) {
                    map.removeLayer(currentRoute);
                }

                // Remove the previous circle
                if (circle) {
                    map.removeLayer(circle);
                    circle = null;
                }

                // Remove the previous carpark markers
                currentCarparks.forEach(marker => {
                    map.removeLayer(marker);
                });
                currentCarparks = []; // Reset the array

                // Draw the new route on the map
                currentRoute = L.polyline(routeCoordinates, { color: '#3BCF00', opacity: 0.8, weight: 8 }).addTo(map);
            } else {
                alert("No route found between the specified locations.");
            }
        },
        error: function () {
            alert("Error fetching route from OneMap API.");
        }
    });
}