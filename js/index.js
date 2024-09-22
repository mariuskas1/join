let users = [];
let rememberedUser;
let currentUser;
const BASE_URL = "https://join-4544d-default-rtdb.europe-west1.firebasedatabase.app";
const urlParams = new URLSearchParams(window.location.search);
const msg = urlParams.get("msg");


/**
 * This function calls the loadUserData-function, when the DOMContent is loaded and starts the logo animation for the desktop version.
 * It also saves the user data into the local array 'users'.
 */
document.addEventListener("DOMContentLoaded", async function() {
    users = await loadUserData("/allUsers/");
    let screenWidth = window.innerWidth;

    if (screenWidth < 480){
        document.getElementById("initial-index-logo").src = "assets/img/logo_light.png";
        setTimeout(startLogoAnimation, 400);
    } else {
        setTimeout(startLogoAnimation, 400);
    }
    
    setTimeout(checkForRememberedUser, 3500);
});


/**
 * This function checks if the last user wanted the app to remember his or her log in. If theh checkbox in the log in form is checked, an object with the
 * user data gets stored in the local storage.
 */
function checkForRememberedUser(){
    rememberedUser = JSON.parse(localStorage.getItem("rememberedUser"));
    if(rememberedUser){
        currentUser = rememberedUser;
        saveCurrentUserToLocalStorage();
        window.location.href = "summary.html";
    } 
}
    

/**
 * This function starts the logo animation which consists of a bigger logo moving from the center of the screen to the top left corner and shrinking
 * at the same time.
 */
function startLogoAnimation(){
    let screenWidth = window.innerWidth;
    let largeLogo =  document.getElementById("initial-index-logo");
    let headerLogo = document.getElementById("index-header-logo");
    let headerLogoPosition = headerLogo.getBoundingClientRect();
   
    largeLogo.style.top = headerLogoPosition.top + 'px';
    largeLogo.style.left = headerLogoPosition.left + 'px';
    
    if (screenWidth < 800){
        largeLogo.className = "index-header-logo-800";
    } else if(screenWidth < 600) {
        largeLogo.className = "index-header-logo-600";
    } else {
        largeLogo.className = "index-header-logo-size";
    }
    
    hideInitialIndexLogo();
}


/**
 * This function hide the initial index logo after the animation is done.
 */
function hideInitialIndexLogo(){
    setTimeout(() => {
        document.getElementById("main-content").classList.remove("hidden");
        document.getElementById("initial-logo-div").style.display = "none";
    }, 1000);
}

/**
 * This function loads all user data which is save on the server in json-format and then converts it into an array of user objects.
 * 
 * @param {string} path - It takes in an adition to the BASE_URL as a parameter, which is the string '/allUsers'.
 * @returns - It returns the array of user objects.
 */
async function loadUserData(path=""){
    let response = await fetch(BASE_URL + path + ".json");
    let data = await response.json();

    if(data){
        return Object.keys(data).map(key => ({ email: key, ...data[key] }));
    }   
}


/**
 * This function is called when clicking on the log in button. It checks the value of the relevant input fields and searches for matching
 * user-objects in the user-array, using the find-method. If a matching user object is found, it gets saved to the currentUser-variable
 * which then gets saved to the local storage, so that it can be used on the other pages of the application as well. If the remember-me-checkbox
 * is checked, the user object also gets saved to the rememberedUser-variable which also gets saved to the local storage. 
 * After the succesful log-in the function redirects the user to the summary page.
 */
async function checkUserData(){
    let mail = document.getElementById("mail");
    let password = document.getElementById("password");
    let rememberMeCheckbox = document.getElementById("remember");
    let user = users.find(u => u.email == mail.value && u.password == password.value);

    if(user){
        currentUser = user;
        saveCurrentUserToLocalStorage();
        if (rememberMeCheckbox.checked){
            saveRememberedUserToLocalStorage(user);
        }
        localStorage.setItem("logged in?", "yes");
        window.location.href = "summary.html";
    } else {
        displayFailedLoginMessage();
    }
}


function displayFailedLoginMessage(){
    document.getElementById("log-in-msg").classList.add("show");
    setTimeout(function() {
        document.getElementById("log-in-msg").classList.remove("show");
    }, 2000); 
}


/**
 * This function handles the click-event on the guest-log-in button so that a user without an account can log in and test the application.
 * Just like the checkUserData-function it redirects the user to the summary page.
 */
function guestLogIn(){
    localStorage.removeItem("currentUser");
    localStorage.setItem("logged in?", "yes");
    window.location.href = "summary.html";
}


/**
 * This function saves the rememberedUser-variable to the local storage after it has cconverted the object into a string.
 * 
 * @param {Object} user - It takes in the user object as a parameter.
 */
function saveRememberedUserToLocalStorage(user){
    localStorage.removeItem("rememberedUser");
    rememberedUser = user;
    localStorage.setItem("rememberedUser", JSON.stringify(user));
}


/**
 * This function saves the currentUser-variable to the local storage after it has converted the object into a string.
 */
function saveCurrentUserToLocalStorage(){
    localStorage.removeItem("currentUser");
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
}

