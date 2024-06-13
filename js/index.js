let users = [];
const BASE_URL = "https://join-4544d-default-rtdb.europe-west1.firebasedatabase.app";


document.addEventListener("DOMContentLoaded", function() {
    let screenWidth = window.innerWidth;

    if (screenWidth < 480){
        document.getElementById("initial-index-logo").src = "assets/img/logo_light.png";
        hideInitialIndexLogo();
    } else {
        setTimeout(() => {
            startLogoAnimation();
        }, 2000);
        displayRegisteredMessage();
    }
});
    

function startLogoAnimation(){
    let largeLogo =  document.getElementById("initial-index-logo");
    let headerLogo = document.getElementById("index-header-logo");
    let headerLogoPosition = headerLogo.getBoundingClientRect();
   
    largeLogo.style.top = headerLogoPosition.top + 'px';
    largeLogo.style.left = headerLogoPosition.left + 'px';
    largeLogo.className = "index-header-logo-size";

    hideInitialIndexLogo();
}


function hideInitialIndexLogo(){
    setTimeout(() => {
        document.getElementById("main-content").classList.remove("hidden");
        document.getElementById("initial-logo-div").style.display = "none";
    }, 2000);
}


async function logIn(){
    users = await loadUserData("/allUsers");
    checkUserData();
}


async function loadUserData(path=""){
    let response = await fetch(BASE_URL + path + ".json");
    let data = await response.json();
    // Convert the JSON object to an array of user objects
    return Object.keys(data).map(key => ({ email: key, ...data[key] }));
}


function checkUserData(){
    let mail = document.getElementById("mail");
    let password = document.getElementById("password");
    let user = users.find(u => u.email == mail.value && u.password == password.value);

    if(user){
        window.location.href = "summary.html";
    } else {
        alert ("Password or username incorrect!")
    }
}


const urlParams = new URLSearchParams(window.location.search);
const msg = urlParams.get("msg");

function displayRegisteredMessage(){
    let headerDiv = document.getElementById("signed-up-div"); 
    let msgBox = document.getElementById("msg-div");

    if(msg){
        headerDiv.style.display = "none";
        msgBox.style.display = "block";
    } else {
        msgBox.style.display = "none";
    }
}
