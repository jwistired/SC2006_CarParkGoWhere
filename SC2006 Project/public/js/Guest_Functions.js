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

// Hide dropdown when clicking outside
document.addEventListener('click', function (event) {
    const dropdown = document.getElementById('filterDropdown');
    if (!event.target.closest('.filter-button') 
        && !event.target.closest('.filter-dropdown') 
        && !event.target.closest('.switch') 
        && !event.target.closest('.slider')) {
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

// Language translations
const translations = {
    en: {
        "header": "Guest Map View",
        "filter": "Filter",
        "settings": "Settings",
        "login": "Login/Register",
        "searchPlaceholder": "Search for parking lots",
        "parkingLotsHeader": "Parking Lots Found",
        "selectLanguage": "Select Language:",
        "yourLocation": "Your Location"
    },
    zh: {
        "header": "客人地图视图",
        "filter": "过滤",
        "settings": "设置",
        "login": "登录/注册",
        "searchPlaceholder": "搜索停车位",
        "parkingLotsHeader": "找到的停车场",
        "selectLanguage": "选择语言:",
        "yourLocation": "您的位置"
    },
    ms: {
        "header": "Peta Tetamu",
        "filter": "Tapis",
        "settings": "Tetapan",
        "login": "Log Masuk/Daftar",
        "searchPlaceholder": "Cari tempat letak kereta",
        "parkingLotsHeader": "Tempat Letak Kereta Ditemui",
        "selectLanguage": "Pilih Bahasa:",
        "yourLocation": "Lokasi Anda"
    },
    ta: {
        "header": "விருந்தினர் வரைபட காட்சி",
        "filter": "வடிகட்டி",
        "settings": "அமைப்புகள்",
        "login": "உள்நுழைவு/பதிவு",
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
    document.querySelector(".login-caption").innerText = translations[selectedLang]["login"];
    document.getElementById("search").placeholder = translations[selectedLang]["searchPlaceholder"];
    document.querySelector(".profile-header-text").innerText = translations[selectedLang]["settings"];
    document.querySelector(".parkinglotsHeader").innerText = translations[selectedLang]["parkingLotsHeader"];
    document.querySelector(".selectLanguage").innerText = translations[selectedLang]["selectLanguage"];
    document.querySelector(".currloc").innerText = translations[selectedLang]["yourLocation"];
}


// Hide sidebar initially
document.getElementById('sidebar').classList.add('sidebar-hidden');

// Event to open sidebar when searchlocation is triggered
function opensideBar() {
    document.getElementById('sidebar').classList.remove('sidebar-hidden');
    // Any additional actions upon search trigger
}