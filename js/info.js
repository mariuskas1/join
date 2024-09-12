

/**
 * This function calls all the necessary functions after the DOMContent is loaded.
 */
document.addEventListener("DOMContentLoaded", async function(){
    setTimeout(deactivateLink, 100);
    await getCurrentUserData();
    setTimeout(displayUserInitials, 60);
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