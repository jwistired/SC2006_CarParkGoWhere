require('dotenv').config();

// Prepare the data to send
const data = JSON.stringify({
    email: process.env.ONEMAP_EMAIL,
    password: process.env.ONEMAP_EMAIL_PASSWORD
});


// Make the POST request using Fetch API
fetch("https://www.onemap.gov.sg/api/auth/post/getToken", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: data
})
.then(response => {
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
})
.then(data => {
    // Handle the response data
    console.log(`Access token: '${data.access_token}' will be expired at ${data.expiry_timestamp}.`);
})
.catch(error => {
    console.error('Error:', error);
});


