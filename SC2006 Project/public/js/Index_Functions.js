console.log('Index_Functions.js loaded');


// Toggle filter dropdown visibility
function toggleFilterDropdown() {
    const dropdown = document.getElementById('filtersDropdown');
    dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
    dropdown.style.flexDirection = 'column';
}

// Open and close sidebar
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
