const fetchCarparkAvailability = async () => {
  const url = `https://api.data.gov.sg/v1/transport/carpark-availability`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
};


const getAllCarparkNumbers = () => {
  fetchCarparkAvailability().then(items => {
    const carparkNumbers = new Set(); 


    items.forEach(item => {
      item.carpark_data.forEach(cp => {
        carparkNumbers.add(cp.carpark_number); 
      });
    });

    console.log('All Carpark Numbers:');
    carparkNumbers.forEach(carparkNumber => {
      console.log(carparkNumber);
    });
  });
};


const getCarparkDetails = async (carparkNumber) => {
  const items = await fetchCarparkAvailability();


  for (const item of items) {
    const carparkData = item.carpark_data;
    const carpark = carparkData.find(cp => cp.carpark_number === carparkNumber);

    if (carpark) {
      console.log(`Details for Carpark ${carparkNumber}:`);
      console.log(`  Update Datetime: ${carpark.update_datetime}`);
      carpark.carpark_info.forEach((info) => {
        console.log(`    Lot Type: ${info.lot_type}`);
        console.log(`    Total Lots: ${info.total_lots}`);
        console.log(`    Lots Available: ${info.lots_available}`);
      });
      return carpark; // Return the carpark details if found
    }
  }

  console.log(`No details found for carpark number: ${carparkNumber}`);
  return null; // Return null if carpark not found
};


//getAllCarparkNumbers();

getCarparkDetails("BA8");