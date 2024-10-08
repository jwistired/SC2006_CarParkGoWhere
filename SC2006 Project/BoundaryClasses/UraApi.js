const accessKey = 'eec999fb-724e-4183-98be-3bd8e9600102'; 
const token = 'e7109+3e3D6e20bfehA08UT40xX9edvF6nJejxT7VMsbbz0C95Sx7d94s3-8W3WbF-39740gfc-8vF1-M91Ne9sfwff4xEZ37Mn0'; // Replace with the token for the day

fetch('https://www.ura.gov.sg/uraDataService/invokeUraDS?service=Car_Park_Availability', {
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
    //console.log('Response data:', data); // Log the whole response data

    // Access the Result array
    const results = data.Result;

    // Loop through each result to log desired information
    results.forEach(carpark => {
        // Check if geometries is defined and has at least one element
        if (carpark.geometries && carpark.geometries.length > 0) {
            const geometry = carpark.geometries[0]; // Access the first geometry
            const coordinates = geometry.coordinates; // Access the coordinates

            console.log({
                lotsAvailable: carpark.lotsAvailable,
                lotType: carpark.lotType,
                carparkNo: carpark.carparkNo,
                geometries: [{
                    coordinates: coordinates // Log the coordinates
                }]
            });
        } else {
            console.warn(`No geometries available for carparkNo: ${carpark.carparkNo}`);
            console.log({
                lotsAvailable: carpark.lotsAvailable,
                lotType: carpark.lotType,
                carparkNo: carpark.carparkNo,
                geometries: [] // Log an empty geometries array
            });
        }
    });
})
.catch(error => {
    console.error('Error:', error); // Log any errors that occur
});
