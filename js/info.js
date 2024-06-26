document.addEventListener("DOMContentLoaded", function(){
    setTimeout(deactivateLink, 100);
});


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