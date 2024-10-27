async function getDistanceInformation(lat1, lon1, lat2, lon2) {
    return new Promise((resolve, reject) => {
        try {
            const R = 6371; // Radius of the Earth in kilometers
            const dLat = deg2rad(lat2 - lat1);  // Difference in latitude in radians
            const dLon = deg2rad(lon2 - lon1);  // Difference in longitude in radians
            const a = 
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
                Math.sin(dLon / 2) * Math.sin(dLon / 2); 
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
            const distance = R * c; // Distance in kilometers
            
            // Display the distance
            console.log(`Distance: ${distance.toFixed(2)} km`);
            resolve(distance);
        } catch (error) {
            reject(error);
        }
    });
}

// Helper function to convert degrees to radians
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

module.exports = getDistanceInformation;
/*
// Example usage:
const lat1 = 1.4368197;
const lon1 = 103.7860668;
const lat2 = 1.352083;
const lon2 = 103.819839;

const distance = getDistanceInformation(lat1, lon1, lat2, lon2);
console.log(`Distance: ${distance.toFixed(2)} km`);
*/