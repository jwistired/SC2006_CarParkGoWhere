//Filter Related Functions
// Toggle filter dropdown visibility
function toggleFilterDropdown() {
    const dropdown = document.getElementById('filtersDropdown');
    dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
    dropdown.style.flexDirection = 'column';
}

// Sorting functions for filter

function filterByDistance(carparks) {
   return carparks.sort((a, b) => parseFloat(a[4]) - parseFloat(b[4]));
}

function filterByPrice(carparks) {
    return carparks.sort((a, b) => {
        // Extract numeric values from the price strings
        const priceA = parseFloat(a[5].replace(/[^0-9.]/g, ''));
        const priceB = parseFloat(b[5].replace(/[^0-9.]/g, ''));
        
        return priceA - priceB;
    });
}

function filterByLots(carparks) {
    return carparks.sort((a, b) => {        
        // Calculate the sum of available parking lots for each carpark
        const sumAvailableLotsA = Array.isArray(a[6])
            ? a[6].reduce((sum, lot) => sum + (lot.available || 0), 0)
            : 0;  // Assign 0 if a[6] is not an array
        const sumAvailableLotsB = Array.isArray(b[6])
            ? b[6].reduce((sum, lot) => sum + (lot.available || 0), 0)
            : 0;  // Assign 0 if b[6] is not an array

        // Sort in descending order of available lots (largest first)
        return sumAvailableLotsB - sumAvailableLotsA;
    });
}

//Sidebar Related Functions

// Open and close Parking sidebar
// Event to open sidebar when searchlocation is triggered
function opensideBar() {
    document.getElementById('sidebar').classList.remove('sidebar-hidden');
}

function closesideBar() {
    document.getElementById('sidebar').classList.add('sidebar-hidden');
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

// Hide sidebar initially
document.getElementById('sidebar').classList.add('sidebar-hidden');

// Event to open sidebar when searchlocation is triggered
function opensideBar() {
    document.getElementById('sidebar').classList.remove('sidebar-hidden');
}

function closesideBar() {
    document.getElementById('sidebar').classList.add('sidebar-hidden');
}

// Event to open history bar when searchlocation is triggered
function openhistBar() {
    document.getElementById('histbar').classList.remove('histbar-hidden');
}

// Event to open history bar when searchlocation is triggered
function closehistBar() {
    document.getElementById('histbar').classList.add('histbar-hidden');
}

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

// Marker color change function
function setMarkerStyle(marker, isSelected) {
    if (!isSelected) {
        marker.setIcon(L.icon({
            iconUrl: '/css/images/parkingicon.png',  // URL for selected marker icon
            iconSize: [40, 40],
            iconAnchor: [12, 41]
        }));
    } else {
        marker.setIcon(L.icon({
            iconUrl: '/css/images/parkingicon-selected.png',  // URL for default marker icon
            iconSize: [55, 55],
            iconAnchor: [12, 41]
        }));
    }
}

// Event listener to the search button or input field
document.getElementById('search').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchLocation();
        opensideBar();
        fetchUserHistory(email);
        openhistBar();
    }
});

// Event listener for filter box
document.addEventListener('click', function (event) {
    const dropdown = document.getElementById('filterDropdown');
    if (!event.target.closest('.filter-button') 
        && !event.target.closest('.filter-dropdown') 
        && !event.target.closest('.switch') 
        && !event.target.closest('.slider')) {
        dropdown.style.display = 'none';
    }
});

// $('#searchicon').on('click', function () {
//     searchLocation();
//     opensideBar();
//     openhistBar();
// });

// Function to check if one of the options is selected
function OneFilterSelected(event) {
    var checkboxes = [
        $("#filter-distance"),
        $("#filter-price"),
        $("#filter-lots")
    ];

    if (event) {
        for (var i = 0; i < checkboxes.length; i++) {
           if (checkboxes[i].attr("id") !== event.id) {
               checkboxes[i].prop("checked", false);
           }
        }
    }
}






