require('dotenv').config({ path: '../.env' }); // Going one directory up to reach the .env file
const proj4 = require('proj4');

const SVY21 = 'EPSG:3414';
proj4.defs(SVY21, "+proj=tmerc +lat_0=1.366666666666667 +lon_0=103.8333333333333 +k=1 +x_0=28001.642 +y_0=38744.572 +ellps=WGS84 +units=m +no_defs");
const WGS84 = 'EPSG:4326'; // WGS 84

const accessKey = '18ee826a-2210-4a40-972e-3a1e3c317ba0'; 
const token = 'd3@ebNc-V5628AaS2+7FkzD1x7ab002WFehG1Hfb52fXaYj4+6c3a2-EJB3ea723-4q231t+32a3c8C1GXxFa4up8aa-Wt3e7918' // daily usage
/*
// Function to refresh the token
async function refreshToken() {
    try {
        const response = await fetch('https://www.ura.gov.sg/uraDataService/insertNewToken.action', {
            method: 'GET',
            headers: {
                'AccessKey': accessKey
            }
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Token refresh failed: ${response.status}, ${errorMessage}`);
        }

        const data = await response.json();
        if (data.Status !== 'Success') {
            throw new Error(`Failed to get token: ${data.Message}`);
        }

        return data.Result; // Assuming the new token is stored in Result
    } catch (error) {
        console.error('Error refreshing token:', error);
        return null; // Return null if there was an error
    }
}
*/
// Function to fetch car park data
async function fetchCarParkData(token) {
    return fetch('https://www.ura.gov.sg/uraDataService/invokeUraDS?service=Car_Park_Availability', {
        method: 'GET',
        headers: {
            'AccessKey': accessKey,
            'Token': token
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); 
    });
}

// Function to fetch car park data with pricing rates
async function fetchCarParkPriceData(token) {
    const response = await fetch('https://www.ura.gov.sg/uraDataService/invokeUraDS?service=Car_Park_Details', {
        method: 'GET',
        headers: {
            'AccessKey': accessKey,
            'Token': token
        }
    });

    const contentType = response.headers.get("content-type");

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (contentType && contentType.includes("application/json")) {
        return response.json(); // Parse as JSON if content type is correct
    } else {
        const text = await response.text();
        console.error('Expected JSON but got:', text);
        throw new Error('Received non-JSON response');
    }
}



// Function to fetch car park availability data and list all carparkNos
async function listAllCarparkNos(token) {
    try {
        const response = await fetch("https://www.ura.gov.sg/uraDataService/invokeUraDS?service=Car_Park_Availability", {
            method: 'GET',
            headers: {
                'AccessKey': accessKey,
                'Token': token
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.Status === "Success") {
            const carparkNos = data.Result.map(carpark => carpark.carparkNo); 
            console.log('List of Carpark Numbers:', JSON.stringify(carparkNos, null, 2)); 
            return carparkNos; // Return the array of carpark numbers
        } else {
            console.warn('Failed to retrieve data:', data.Message);
            return []; // Return an empty array if failed
        }
    } catch (error) {
        console.error('Error fetching car park data:', error);
        return []; // Return an empty array on error
    }
}

// Function to get the number of lots available for a specific carpark
async function getLotsAvailable(carparkNo, token) {
    return fetchCarParkData(token)
        .then(data => {
            const carpark = data.Result.find(cp => cp.carparkNo === carparkNo); 
            if (carpark) {
                console.log(`Lots Available for ${carparkNo}: ${carpark.lotsAvailable}`); 
                return carpark.lotsAvailable; 
            } else {
                console.warn(`No data found for carparkNo: ${carparkNo}`);
                return null; 
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Function to get the coordinates in WGS84 for a specific carpark using ppCode
async function getCoordinates_URA(ppCode, token) {
    return fetchCarParkPriceData(token)
        .then(data => {
            const carpark = data.Result.find(cp => cp.ppCode === ppCode);
            if (carpark && carpark.geometries && carpark.geometries.length > 0) {
                const geometry = carpark.geometries[0]; 
                const coordinates = geometry.coordinates.split(','); // Split the coordinates string into an array
                
                // Parse the coordinates to floats
                const easting = parseFloat(coordinates[0]);
                const northing = parseFloat(coordinates[1]);

                // Convert SVY21 to WGS84
                const wgs84Coordinates = proj4(SVY21, WGS84, [easting, northing]);
                const longitude = wgs84Coordinates[0]; // Longitude
                const latitude = wgs84Coordinates[1]; // Latitude

                console.log(`Coordinates for ${ppCode}: ${latitude}, ${longitude}`);
                return `${latitude}, ${longitude}`; // Return coordinates as a string
            } else {
                console.warn(`No geometries available for ppCode: ${ppCode}`);
                return ''; // Return empty string if no geometries found
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Function to get all details of a specific carpark using ppCode
async function getAllCarparksDetail(ppCode, token) {
    return fetchCarParkPriceData(token)
        .then(data => {
            const carpark = data.Result.find(cp => cp.ppCode === ppCode);
            if (carpark && carpark.geometries && carpark.geometries.length > 0) {
                const geometry = carpark.geometries[0];
                const coordinates = geometry.coordinates.split(','); // Split the coordinates string into an array
                
                // Parse the coordinates to floats
                const easting = parseFloat(coordinates[0]);
                const northing = parseFloat(coordinates[1]);

                // Convert SVY21 to WGS84
                const wgs84Coordinates = proj4(SVY21, WGS84, [easting, northing]);
                const longitude = wgs84Coordinates[0]; // Longitude
                const latitude = wgs84Coordinates[1]; // Latitude
                
                const details = {
                    weekdayMin: carpark.weekdayMin,
                    ppName: carpark.ppName,
                    endTime: carpark.endTime,
                    weekdayRate: carpark.weekdayRate,
                    startTime: carpark.startTime,
                    ppCode: carpark.ppCode,
                    sunPHRate: carpark.sunPHRate,
                    satdayMin: carpark.satdayMin,
                    sunPHMin: carpark.sunPHMin,
                    parkingSystem: carpark.parkingSystem,
                    parkCapacity: carpark.parkCapacity,
                    vehCat: carpark.vehCat,
                    satdayRate: carpark.satdayRate,
                    coordinates: `${latitude}, ${longitude}` // Return coordinates as a string
                };
                
                console.log(`Details for ${ppCode}:`, JSON.stringify(details, null, 2)); 
            } else {
                console.warn(`No data found for ppCode: ${ppCode}`);
                return null; 
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Function to get pricing rates for a specific carpark using ppCode
async function getPricingRate(ppCode, token) {
    return fetchCarParkPriceData(token)
        .then(data => {
            const carpark = data.Result.find(cp => cp.ppCode === ppCode);
            if (carpark) {
                const pricing = {
                    ppName: carpark.ppName,
                    weekdayPricing: {
                        endTime: carpark.endTime,
                        weekdayRate: carpark.weekdayRate,
                        weekdayMin: carpark.weekdayMin,
                        startTime: carpark.startTime,
                    },
                    weekendPricing: {
                        sunPHRate: carpark.sunPHRate,
                        satdayMin: carpark.satdayMin,
                        sunPHMin: carpark.sunPHMin,
                    }
                };
                
                console.log(`Pricing for ${ppCode}:`, JSON.stringify(pricing, null, 2));
                return pricing;
            } else {
                console.warn(`No data found for ppCode: ${ppCode}`);
                return null; 
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}


// Function to get all car park coordinates from URA
const getAllCoor_URA = async (token) => {
    try {
        // Step 1: Fetch all carpark data
        const carparkData = await fetchCarParkPriceData(token);
        const coordinatesPromises = []; // Array to hold promises for coordinates fetching

        // Step 2: Loop through each carpark and get its coordinates
        for (const carpark of carparkData.Result) {
            if (carpark.geometries && carpark.geometries.length > 0) {
                const geometry = carpark.geometries[0];
                const coordinates = geometry.coordinates.split(','); // Split the coordinates string into an array
                
                // Parse the coordinates to floats
                const easting = parseFloat(coordinates[0]);
                const northing = parseFloat(coordinates[1]);

                // Convert SVY21 to WGS84
                const wgs84Coordinates = proj4(SVY21, WGS84, [easting, northing]);
                const longitude = wgs84Coordinates[0]; // Longitude
                const latitude = wgs84Coordinates[1]; // Latitude
                
                // Store the formatted coordinates
                coordinatesPromises.push(`${latitude}, ${longitude}`);
            }
        }

        // Step 3: Wait for all coordinates to be fetched
        const formattedCoordinates = await Promise.all(coordinatesPromises);
        
        // Step 4: Filter out duplicates
        const uniqueCoordinates = [...new Set(formattedCoordinates)];

        // Step 5: Format the output as desired
        const output = uniqueCoordinates.join('\n');
        console.log('All Car Park Coordinates in WGS84:\n', output);
        return output; // Return the formatted string
    } catch (error) {
        console.error('Error fetching car park coordinates:', error);
        return ''; // Return empty string on error
    }
};



function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Radius of the Earth in meters
    const φ1 = lat1 * (Math.PI / 180); // φ in radians
    const φ2 = lat2 * (Math.PI / 180); // φ in radians
    const Δφ = (lat2 - lat1) * (Math.PI / 180); // Difference in latitude in radians
    const Δλ = (lon2 - lon1) * (Math.PI / 180); // Difference in longitude in radians
  
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    return R * c; // Distance in meters
  }

  const findNearbyCarparks_URA = async (coordinates , destinationCoords, token, radius = 500) => {
    try {
        //const coordinates = await getAllCoor_URA(token); // Ensure we await the result here
        const nearbyCarparks = [];

        if (!coordinates || coordinates.length === 0) {
            console.warn('No coordinates found. Exiting function.');
            return nearbyCarparks; // Return empty array if no coordinates
        }

        const coordArray = coordinates.split('\n'); // Split the coordinates string into an array
        const [destLat, destLon] = destinationCoords.split(', ').map(Number); // Parse destination coordinates

        coordArray.forEach(coord => {
            const [lat, lon] = coord.split(', ').map(Number); // Parse car park coordinates
            if (lat && lon) { // Ensure lat and lon are valid numbers
                const distance = haversineDistance(destLat, destLon, lat, lon); // Calculate distance

                if (distance <= radius) { // Check if within radius
                    nearbyCarparks.push(coord); // Add to nearby car parks
                }
            }
        });

        console.log('Nearby Carparks:', nearbyCarparks);
        return nearbyCarparks; // Return the filtered nearby car parks
    } catch (error) {
        console.error('Error finding nearby car parks:', error);
        return [];
    }
};







// Example usage
(async () => {
    // Call the refreshToken function to get the token
    //const token = await refreshToken(); // Store the token string
    console.log("Token" , token);
    if (token) {
        // Uncomment to get list of all carparkNo.
        //await listAllCarparkNos(token); 
        const coordinates = await getAllCoor_URA(token);
        const destinationCoords = '1.2924784591778997, 103.83047442762206'; // Example destination coordinates
        const nearbyCarparks = await findNearbyCarparks_URA(coordinates, destinationCoords, 500);

        //await getLotsAvailable('E0027', token); 
        //await getCoordinates_URA('C0148', token);
        //await getPricingRate('E0027', token);
        //await getAllCarparksDetail('E0027', token);
    } else {
        console.error('Failed to retrieve the token.');
    }
})();
