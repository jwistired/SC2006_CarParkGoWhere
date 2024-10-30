console.log('Index_Functions.js loaded');

//Filter Related Functions
// Toggle filter dropdown visibility
function toggleFilterDropdown() {
    const dropdown = document.getElementById('filtersDropdown');
    dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
    dropdown.style.flexDirection = 'column';
}

function toggleDistance(){
    var boolDistance;
    if (document.getElementById("toggle-distance").value == "true")
    {
        bool = true;
    }
    else
    {
        bool = false;
    }
}

function toggleAvailableLots(){
    var boolLots;
    if (document.getElementById("toggle-availableLots").value == "true")
    {
        boolLots = true;
    }
    else
    {
        boolLots = false;
    }
}

function togglePrice(){
    var boolPrice;
    if (document.getElementById("toggle-price").value == "true")
    {
        boolPrice = true;
    }
    else
    {
        boolPrice = false;
    }
}

function filtering(){
    //Code to filter sidebar display
}

//Sidebar Related Functions

// Open and close Parking sidebar
function opensideBar() {
    document.getElementById("sidebar").style.width = "200px";
    document.getElementById("sidebar").style.display = "flex";
    document.getElementById("sidebar").style.animation = "slideIn";
}

function closesideBar() {
    document.getElementById("sidebar").style.width = "0px";
    document.getElementById("sidebar").style.display = "none";
    document.getElementById("sidebar").style.animation = "slideOut";
}

// Profile sidebar functions

// Open and close profile/setting sidebar
function openprofileBar() {
    document.getElementById("profile-bar").style.width = "350px";
    document.getElementById("profile-bar").style.display = "inline-block";
    document.getElementById("profile-bar").style.animation = "slideIn";
}

function closeprofileBar() {
    document.getElementById("profile-bar").style.width = "0px";
    document.getElementById("profile-bar").style.display = "none";
    document.getElementById("profile-bar").style.animation = "slideOut";
}

// Hide Profile Sidebar when clicking outside
document.addEventListener('click', function (event) {
    const dropdown = document.getElementById('profile-bar');
    if (!event.target.closest('.profile-sidebar') && 
        !event.target.closest('.profile-settings') && 
        !event.target.closest('.language-dropdown-content') && 
        !event.target.closest('.close-icon') && 
        !event.target.closest('.language-drop-btn')) {
        dropdown.style.display = 'none';
    }
});

//logout function

function logout() {
    fetch('/logout', {
        method: 'DELETE'
    }).then(response => {
        if (response.redirected) {
            sessionStorage.clear();
            window.location.href = response.url;
        }
    });
}

//Translation
const translations = {
    en: {
        "header": "Guest Map View",
        "filter": "Filter",
        "settings": "Settings",
        "logout": "Logout",
        "searchPlaceholder": "Search for parking lots",
        "parkingLotsHeader": "Parking Lots Found",
        "selectLanguage": "Select Language:",
        "yourLocation": "Your Location"
    },
    zh: {
        "header": "客人地图视图",
        "filter": "过滤",
        "settings": "设置",
        "logout": "登出",
        "searchPlaceholder": "搜索停车位",
        "parkingLotsHeader": "找到的停车场",
        "selectLanguage": "选择语言:",
        "yourLocation": "您的位置"
    },
    ms: {
        "header": "Peta Tetamu",
        "filter": "Tapis",
        "settings": "Tetapan",
        "logout": "Log Keluar",
        "searchPlaceholder": "Cari tempat letak kereta",
        "parkingLotsHeader": "Tempat Letak Kereta Ditemui",
        "selectLanguage": "Pilih Bahasa:",
        "yourLocation": "Lokasi Anda"
    },
    ta: {
        "header": "விருந்தினர் வரைபட காட்சி",
        "filter": "வடிகட்டி",
        "settings": "அமைப்புகள்",
        "logout": "வெளியேறு",
        "searchPlaceholder": "கார் பார்க்கிங் இடங்களை தேடுங்கள்",
        "parkingLotsHeader": "கார்பார்க்குகள் கண்டறியப்பட்டன",
        "selectLanguage": "மொழியைத் தேர்ந்தெடுக்கவும்:",
        "yourLocation": "உங்கள் இருப்பிடம்"
    }
};

function changeLanguage() {
    const selectedLang = document.getElementById("languageDropdown").value;

    document.title = translations[selectedLang]["header"];
    document.querySelector(".filter-caption").innerText = translations[selectedLang]["filter"];
    document.querySelector(".profile-caption").innerText = translations[selectedLang]["settings"];
    document.querySelector(".logout-caption").innerText = translations[selectedLang]["logout"];
    document.getElementById("search").placeholder = translations[selectedLang]["searchPlaceholder"];
    document.querySelector(".profile-header-text").innerText = translations[selectedLang]["settings"];
    document.querySelector(".parkinglotsHeader").innerText = translations[selectedLang]["parkingLotsHeader"];
    document.querySelector(".selectLanguage").innerText = translations[selectedLang]["selectLanguage"];
    document.querySelector(".currloc").innerText = translations[selectedLang]["yourLocation"];
}

// Attach event listener to the search button or input field
document.getElementById('search').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchLocation();
    }
});

//Convert distance to km

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

//Convert degree to radian

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function clickTest(e)
{
    alert("hi. you clicked the marker at " + e.latlng);
}