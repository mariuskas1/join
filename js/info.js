

/**
 * This function calls all the necessary functions after the DOMContent is loaded.
 */
document.addEventListener("DOMContentLoaded", async function(){
    setTimeout(deactivateLink, 100);
    await getCurrentUserData();
    // setTimeout(displayUserInitials, 200);
    checkForLogIn();
});


/**
 * This function remoes the active-link class from all menu-options on the sidebar, when the user is on one of the info-pages.
 */
function deactivateLink(){
    let sidebarMenuDiv = document.querySelectorAll(".sidebar-menu-div");
    
    sidebarMenuDiv.forEach(function(addTaskDiv) {
        addTaskDiv.classList.remove("active-link");

        let images = addTaskDiv.querySelectorAll("img");
        images.forEach(function(img){
            img.src = img.getAttribute("data-original-src");
        });
    });
}


/**
 * This function checks if the user has logged in with his user data or through the guest log in. If the user is not logged in, the menu links are disabled.
 */
function checkForLogIn(){
    let isLoggedIn = localStorage.getItem("logged in?");
    if(isLoggedIn !== "yes"){
        setTimeout(disableMenuNavigation, 100);
    } else {
        setTimeout(displayUserInitials, 200);
    }
}



/**
 * This function disable the menu on the info pages so that the application cannot be accessed without logging in when the user opens one of the info
 * pages on the index page.
 */
function disableMenuNavigation(){
    document.getElementById("sidebar-menu").style.opacity = 0;
    document.getElementById("user-initials").innerHTML = "";
    document.getElementById("user-menu-log-out").style.display = "none";
}


