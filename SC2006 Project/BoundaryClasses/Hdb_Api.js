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
const getCarparkLotsDetails = async (carparkNumber) => {
  const items = await fetchCarparkAvailability();

  for (const item of items) {
    const carparkData = item.carpark_data;
    const carpark = carparkData.find(cp => cp.carpark_number === carparkNumber);

    if (carpark) {
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

// Fetch coordinates for all car parks and log them directly
const getAllCarparkCoor = async () => {
  try {
    const response = await fetch(`${hdbUrl}&limit=1000`); // Fetch a sufficient number of records
    if (!response.ok) {
      throw new Error('Failed to fetch HDB car park data');
    }

    const data = await response.json();
    const carparkCoordinates = data.result.records
      .map(record => {
        const x_coord = parseFloat(record.x_coord);
        const y_coord = parseFloat(record.y_coord);
        if (!isNaN(x_coord) && !isNaN(y_coord)) {
          const [longitude, latitude] = proj4(SVY21, WGS84, [x_coord, y_coord]);
          return `${latitude}, ${longitude}`; // Format as a string
        }
        return null; // Skip if coordinates are invalid
      })
      .filter(Boolean); // Remove any null values

    // Log the coordinates directly
    console.log('All Car Park Coordinates:', carparkCoordinates);

    return carparkCoordinates; // Return the array of formatted coordinates if needed
  } catch (error) {
    console.error('Error fetching car park coordinates:', error);
  }
};

// Example usage
// getHdbCarParkDetails('ACB'); // Get the car park details 
// getCarparkCoor('ACB'); // Get HDB car park coordinates
// getAllCarparkNumbers(); // Get all car park numbers
// getCarparkLotsDetails('ACB'); // Get details for carpark 
getAllCarparkCoor(); // Fetch and log all car park coordinates
