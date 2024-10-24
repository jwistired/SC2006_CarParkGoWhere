// Filter functions
// Toggle filter dropdown visibility
function toggleFilterDropdown() {
    const dropdown = document.getElementById('filterDropdown');
    dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
    dropdown.style.flexDirection = 'column';
}

function toggleDistance(){
    //code to toggle distance filter
}

function toggleAvailableLots(){
    //code to toggle available lots filter
}

function togglePrice(){
    //code to toggle price filter
}

// Hide dropdown when clicking outside
document.addEventListener('click', function (event) {
    const dropdown = document.getElementById('filterDropdown');
    if (!event.target.closest('.filter-button') && !event.target.closest('.filter-dropdown') && !event.target.closest('.switch') && !event.target.closest('.slider')) {
        dropdown.style.display = 'none';
    }
});

// Side bar functions
// Open and close sidebar
function openprofileBar() {
    document.getElementById("profile-bar").style.width = "350px";
    document.getElementById("profile-bar").style.display = "grid";
    document.getElementById("profile-bar").style.animation = "slideIn";
}

function closeprofileBar() {
    document.getElementById("profile-bar").style.width = "0px";
    document.getElementById("profile-bar").style.display = "none";
    document.getElementById("profile-bar").style.animation = "slideOut";
}


// Event listener to close the sidebar when clicking outside of it
document.addEventListener('click', function (event) {
    const profileBar = document.getElementById('profile-bar');
    const profileButton = document.querySelector('.profile-settings');

    // Hide the sidebar if clicking outside the profile button and sidebar
    if (!event.target.closest('.profile-settings') && !event.target.closest('#profile-bar')) {
        closeprofileBar();
    }
});

// Language settings
const translations = {
    en: {
        welcome: "Welcome",
        description: "This is the guest map interface."
    },
    zh: {
        welcome: "欢迎",
        description: "这是访客地图界面。"
    },
    ms: {
        welcome: "Selamat Datang",
        description: "Ini adalah antara muka peta tetamu."
    },
    ta: {
        welcome: "வரவேற்கிறோம்",
        description: "இது விருந்தினர்களின் வரைபட இடைமுகம்."
    }
};

function changeLanguage() {
    const language = document.getElementById('languageDropdown').value;
    document.getElementById('welcomeText').innerText = translations[language].welcome;
    document.getElementById('descriptionText').innerText = translations[language].description;
}