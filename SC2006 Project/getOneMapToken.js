require('dotenv').config();

// Log environment variables to ensure they are loaded for debug
/*
console.log('ONEMAP_EMAIL:', process.env.ONEMAP_EMAIL);
console.log('ONEMAP_EMAIL_PASSWORD:', process.env.ONEMAP_EMAIL_PASSWORD);  */

// Function to get the token
async function getToken() {
    const response = await fetch("https://www.onemap.gov.sg/api/auth/post/getToken", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: process.env.ONEMAP_EMAIL,  
            password: process.env.ONEMAP_EMAIL_PASSWORD
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.access_token; 
}

//for debugging and testing 
async function fetchOneMapToken() {
    try {
        const token = await getToken();
        console.log('Fetched OneMap Token:', token);
    } catch (error) {
        console.error('Error fetching token:', error);
    }
}

//fetchOneMapToken();

module.exports = getToken; // Default export