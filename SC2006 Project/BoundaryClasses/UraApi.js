//npm install proj4
//<script src="https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.8.0/proj4.js"></script> //for html

const proj4 = require('proj4'); // Ensure proj4 is required

// Define the SVY21 projection
const SVY21 = 'EPSG:3414';
proj4.defs(SVY21, "+proj=tmerc +lat_0=1.366666666666667 +lon_0=103.8333333333333 +k=1 +x_0=28001.642 +y_0=38744.572 +ellps=WGS84 +units=m +no_defs");

// Define the target projection (WGS84)
const WGS84 = 'EPSG:4326'; // WGS 84

const accessKey = 'eec999fb-724e-4183-98be-3bd8e9600102'; 
const token = 'e7109+3e3D6e20bfehA08UT40xX9edvF6nJejxT7VMsbbz0C95Sx7d94s3-8W3WbF-39740gfc-8vF1-M91Ne9sfwff4xEZ37Mn0'; // Replace with the token for the day

// Function to fetch car park data
function fetchCarParkData() {
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
        return response.json(); // Parse the response body as JSON
    });
}

// different url for HTTP request
// Function to fetch car park data with pricing rates
function fetchCarParkPriceData() {
    return fetch('https://www.ura.gov.sg/uraDataService/invokeUraDS?service=Car_Park_Details', {
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
        return response.json(); // Parse the response body as JSON
    });
}

// Function to fetch car park availability data and list all carparkNo
function listAllCarparkNos() {
    return fetch("https://www.ura.gov.sg/uraDataService/invokeUraDS?service=Car_Park_Availability", {
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
        return response.json(); // Parse the response body as JSON
    })
    .then(data => {
        if (data.Status === "Success") {
            const carparkNos = data.Result.map(carpark => carpark.carparkNo); // Extract carparkNo from the result
            console.log('List of Carpark Numbers:', JSON.stringify(carparkNos, null, 2)); // Log the list of carpark numbers
        } else {
            console.warn('Failed to retrieve data:', data.Message);
        }
    })
    .catch(error => {
        console.error('Error fetching car park data:', error);
    });
}

// Function to get the number of lots available for a specific carpark
function getLotsAvailable(carparkNo) {
    return fetchCarParkData()
        .then(data => {
            const carpark = data.Result.find(cp => cp.carparkNo === carparkNo); 
            if (carpark) {
                console.log(`Lots Available for ${carparkNo}: ${carpark.lotsAvailable}`); // Log the available lots
                return carpark.lotsAvailable; // Return available lots if found
            } else {
                console.warn(`No data found for ppCode: ${carparkNo}`);
                return null; // Return null if carpark not found
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Function to get the coordinates in WGS84 for a specific carpark using ppCode
function getCoordinates(ppCode) {
    return fetchCarParkPriceData()
        .then(data => {
            const carpark = data.Result.find(cp => cp.ppCode === ppCode);
            if (carpark && carpark.geometries && carpark.geometries.length > 0) {
                const geometry = carpark.geometries[0]; // Get the first geometry
                const coordinates = geometry.coordinates.split(','); // Split the coordinates string into an array
                
                // Parse the coordinates to floats
                const easting = parseFloat(coordinates[0]);
                const northing = parseFloat(coordinates[1]);

                // Convert SVY21 to WGS84
                const wgs84Coordinates = proj4(SVY21, WGS84, [easting, northing]);
                const longitude = wgs84Coordinates[0]; // Longitude
                const latitude = wgs84Coordinates[1]; // Latitude

                console.log(`Coordinates for ${ppCode}: ${latitude}, ${longitude}`); // Log the coordinates
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
function getAllCarparksDetail(ppCode) {
    return fetchCarParkPriceData()
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
                
                console.log(`Details for ${ppCode}:`, JSON.stringify(details, null, 2)); // Log the car park details
                return details;
            } else {
                console.warn(`No data found for ppCode: ${ppCode}`);
                return null; // Return null if carpark not found
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Function to get pricing rates for a specific carpark using ppCode
function getPricingRate(ppCode) {
    return fetchCarParkPriceData()
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
                return null; // Return null if carpark not found
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}


// Example usage

//listAllCarparkNos(); //uncomment to get list of all carparkNo.

getLotsAvailable('E0027'); 
getCoordinates('E0027');
getPricingRate('E0027');
getAllCarparksDetail('E0027');
/*  { example of calling getAllCarparksDetail(ppCode)
      "weekdayMin": "30mins",
      "ppName": "ALIWAL STREET",
      "endTime": "05.00 PM",
      "weekdayRate": "$0.50",
      "startTime": "08.30 AM",
      "ppCode": "A0004",
      "sunPHRate": "$0.50",
      "satdayMin": "30 mins",
      "sunPHMin": "30 mins",
      "parkingSystem": "C",
      "parkCapacity": 69,
      "vehCat": "Car",
      "satdayRate": "$0.50",
      "coordinates": "31045.6165, 31694.0055"
    }
*/

