const accessKey = '9a02a848-daa6-453f-9dc6-6567446d2e66'; // Your access key

// Function to refresh the token
async function refreshToken() {
    try {
        const response = await fetch('https://www.ura.gov.sg/uraDataService/insertNewToken.action', {
            method: 'GET',
            headers: {
                'AccessKey': accessKey // Ensure that the accessKey is correctly passed
            }
        });

        if (!response.ok) {
            const errorMessage = await response.text(); // Log response body
            throw new Error(`Token refresh failed: ${response.status}, ${errorMessage}`);
        }

        const data = await response.json();
        //console.log('Token data:', data); // Log the received token data

        if (data.Status !== 'Success') {
            throw new Error(`Failed to get token: ${data.Message}`);
        }

        return data.Result; // Assuming the new token is stored in Result
    } catch (error) {
        console.error('Error refreshing token:', error);
        return null; // Return null if there was an error
    }
}

// Example usage of refreshToken
(async () => {
    const token = await refreshToken();
    if (token) {
        console.log('New API Token:', token);
    } else {
        console.log('Failed to retrieve API Token');
    }
})();

// Export the refreshToken function
module.exports = {
    refreshToken
};
