const proj4 = require('proj4');

// Define projection for SVY21 (EPSG:3414)
const SVY21 = 'EPSG:3414';
proj4.defs(SVY21, "+proj=tmerc +lat_0=1.366666666666667 +lon_0=103.8333333333333 +k=1 +x_0=28001.642 +y_0=38744.572 +ellps=WGS84 +units=m +no_defs");
const WGS84 = 'EPSG:4326'; // WGS 84

const datasetId = "d_23f946fa557947f93a8043bbef41dd09";
const hdbUrl = `https://data.gov.sg/api/action/datastore_search?resource_id=${datasetId}`;
const availabilityUrl = `https://api.data.gov.sg/v1/transport/carpark-availability`;

// Fetch HDB car park details
async function getHdbCarParkDetails(car_park_no) {
  try {
    const response = await fetch(hdbUrl);
    if (!response.ok) throw new Error('Failed to fetch HDB car park data');
    const data = await response.json();
    const carpark = data.result.records.find(record => record.car_park_no === car_park_no);

    if (carpark) {
      console.log('Car Park Object:', carpark);
      return carpark;
    } else {
      console.warn(`Car park with number ${car_park_no} not found.`);
      return null;
    }
  } catch (error) {
    console.error('Error fetching HDB car park data:', error);
    return null; // Return null on error
  }
}

// Fetch and convert coordinates
async function getCarparkCoor(car_park_no) {
  try {
    const response = await fetch(hdbUrl);
    if (!response.ok) throw new Error('Failed to fetch HDB car park data');
    const data = await response.json();
    const carpark = data.result.records.find(record => record.car_park_no === car_park_no);

    if (carpark) {
      const x_coord = parseFloat(carpark.x_coord);
      const y_coord = parseFloat(carpark.y_coord);
      const address = carpark.address;

      if (!isNaN(x_coord) && !isNaN(y_coord)) {
        const [longitude, latitude] = proj4(SVY21, WGS84, [x_coord, y_coord]);
        console.log(`Coordinates for Car Park ${car_park_no}: ${latitude}, ${longitude}`);
        console.log(`Address: ${address}`);
        return { latitude, longitude, address };
      } else {
        console.warn(`Invalid or missing coordinates for Car Park ${car_park_no}`);
        return null;
      }
    } else {
      console.warn(`Car park with number ${car_park_no} not found.`);
      return null;
    }
  } catch (error) {
    console.error('Error fetching HDB car park data:', error);
    return null; // Return null on error
  }
}

// Fetch car park availability from the API
const fetchCarparkAvailability = async () => {
  try {
    const response = await fetch(availabilityUrl);
    if (!response.ok) throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
};

// Get all car park numbers
const getAllCarparkNumbers = async () => {
  const carparkNumbers = new Set();
  let offset = 0;
  const limit = 100;

  try {
    while (true) {
      const response = await fetch(`${hdbUrl}&limit=${limit}&offset=${offset}`);
      if (!response.ok) throw new Error('Failed to fetch HDB car park data');
      const data = await response.json();

      if (data.result.records.length === 0) break;

      data.result.records.forEach(record => {
        carparkNumbers.add(record.car_park_no);
      });

      offset += limit;
    }

    return Array.from(carparkNumbers); // Convert Set to Array and return
  } catch (error) {
    console.error('Error fetching car park numbers:', error);
    return []; // Return an empty array in case of error
  }
};

// Get details of a specific car park
const getCarparkLotsDetails = async (carparkNumber,carparkName) => {
  const items = await fetchCarparkAvailability();

  for (const item of items) {
    const carparkData = item.carpark_data;
    const carpark = carparkData.find(cp => cp.carpark_number === carparkNumber);
    carpark.Name=carparkName;
    carpark.Distance="enter distance";
    carpark.price="enter price";
    if (carpark) {
      console.log(`Name of Carpark: ${carparkName}:`);
      console.log(`Lots Availability for Carpark ${carparkNumber}:`);
      console.log(`   Update Datetime: ${carpark.update_datetime}`);
      carpark.carpark_info.forEach((info) => {
        console.log(`   Lot Type: ${info.lot_type}`);
        console.log(`   Total Lots: ${info.total_lots}`);
        console.log(`   Lots Available: ${info.lots_available}`);
      });
      return carpark; 
    }
  }

  console.log(`No details found for carpark number: ${carparkNumber}`);
  return null; 
};

// Fetch all car park coordinates
const getAllCarparkCoor_HDB = async () => {
  const carparkCoordinates = new Set(); // Use a Set to avoid duplicates
  let offset = 0;
  const limit = 5000;

  try {
    while (true) {
      const response = await fetch(`${hdbUrl}&limit=${limit}&offset=${offset}`);
      if (!response.ok) throw new Error('Failed to fetch HDB car park data');
      const data = await response.json();

      if (data.result.records.length === 0) break;

      data.result.records.forEach(record => {
        const x_coord = parseFloat(record.x_coord);
        const y_coord = parseFloat(record.y_coord);
        const carparkNumber=record.car_park_no;
        const carparkName=record.address;
        if (!isNaN(x_coord) && !isNaN(y_coord)) {
          const [longitude, latitude] = proj4(SVY21, WGS84, [x_coord, y_coord]);
          carparkCoordinates.add(`${carparkNumber},${latitude}, ${longitude},${carparkName}`); // Add formatted coordinates to the Set
        }
      });

      offset += limit; // Increment offset for next batch
    }

    return Array.from(carparkCoordinates); // Convert Set to Array and return
  } catch (error) {
    console.error('Error fetching car park coordinates:', error);
    return []; // Return an empty array in case of error
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


// Fetch all car park coordinates within a 500m radius
const findNearbyCarparks_HDB = async (destinationCoords, radius = 500) => {
  const coordinates = await getAllCarparkCoor_HDB(); // Get all car park coordinates
  console.log('Fetched HDB coordinates:', coordinates);
  const nearbyCarparks = [];

  const [destLat, destLon] = destinationCoords.split(', ').map(Number); // Parse destination coordinates

  coordinates.forEach(coord => {
    const [carparkNumber, lat, lon] = coord.split(',').map((value, index) =>
      index === 0 ? value.trim() : Number(value.trim()) // Trim spaces and convert to numbers
    );
    const distance = haversineDistance(destLat, destLon, lat, lon); // Calculate distance

    if (distance <= radius) { // Check if within radius
      nearbyCarparks.push(coord); // Add to nearby car parks
    }
  });

  return nearbyCarparks; // Return the filtered car parks
};

// find nearby carpark 
/*
(async () => {
  const destinationCoords = '1.4368197, 103.7860668'; // Define destination coordinates
  const nearbyCarparks = await findNearbyCarparks_HDB(destinationCoords, 500); // Find nearby car parks within 500m

  console.log('Nearby Car Parks within 500m radius:\n', nearbyCarparks.join('\n')); // Log the result
})();
*/

// Example usage
// getHdbCarParkDetails('ACB'); // Get the car park details 
// getCarparkCoor('ACB'); // Get HDB car park coordinates
//fetchCarparkAvailability();

// Get all car park numbers
/*
(async () => {
  const carparkNumbers = await getAllCarparkNumbers(); // Call the function to get car park numbers
  const carparkNumbersString = carparkNumbers.join(', '); // Join numbers with a comma and space
  console.log('All Car Park Numbers:\n', carparkNumbersString); // Log the formatted string
})(); */


// get all car park coordinates
/*
(async () => {
  const coordinates = await getAllCarparkCoor_HDB(); // Call the function to get coordinates
  const coordinatesString = coordinates.join('\n'); // Join coordinates with a newline character
  console.log('All Car Park Coordinates:\n', coordinatesString); // Log the formatted string
})(); 
*/
// Export all functions
module.exports = {
  getHdbCarParkDetails,
  getCarparkCoor,
  fetchCarparkAvailability,
  getAllCarparkNumbers,
  getCarparkLotsDetails,
  getAllCarparkCoor_HDB,
  findNearbyCarparks_HDB,
  haversineDistance
};


