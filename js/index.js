let rememberedUser;
let currentUser;
const BASE_URL = "https://marius-kasparek.developerakademie.org/join_server/api/login/";
const GUEST_URL = "https://marius-kasparek.developerakademie.org/join_server/api/guest-login/";
const urlParams = new URLSearchParams(window.location.search);
const msg = urlParams.get("msg");


/**
 * This function calls the loadUserData-function, when the DOMContent is loaded and starts the logo animation for the desktop version.
 * It also saves the user data into the local array 'users'.
 */
document.addEventListener("DOMContentLoaded", async function() {
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
 * This function is called when a user logs in. It performs a post-fetch to the server with the user data and checks the response.
 */
async function postUserData(){
    let mail = document.getElementById("mail").value;
    let password = document.getElementById("password").value;
   
    try {
        let response = await fetch(BASE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({username: mail, password: password, email: mail}),
        })
        checkLogInResponse(response);
        
    } catch (error) {
        console.error(error);
        displayFailedLoginMessage();
    }
}


/**
 * This function checks the login-response from the server. If the login was successful, it saves the user data plus token to the local storage.
 * 
 * @param {*} response - It takes in the response from the server as a parameter
 * @returns 
 */
async function checkLogInResponse(response){
    let rememberMeCheckbox = document.getElementById("remember");
    
    if(!response.ok){
        displayFailedLoginMessage();
        return;
    } else {
        let data = await response.json();
        currentUser = { token: data.token, username: data.username, email: data.email, name: data.name };
        saveCurrentUserToLocalStorage();
        if (rememberMeCheckbox.checked) {
            saveRememberedUserToLocalStorage(currentUser);
        }
        localStorage.setItem("logged in?", "yes");

        window.location.href = "summary.html";
    }
}


/**
 * This function displays a message if the login failed.
 */
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
async function guestLogIn(){
    try {
        const response = await fetch(GUEST_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const data = await response.json();
            const guestUser = {
                token: data.token,
                username: data.username,
                isGuest: true,
            };

            localStorage.setItem("currentUser", JSON.stringify(guestUser));
            window.location.href = "summary.html";
        } else {
            console.error("Failed to log in as guest:", response.status);
        }
    } catch (error) {
        console.error("Error during guest login:", error);
    }
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

