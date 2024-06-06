document.addEventListener("DOMContentLoaded", function(){
    setTimeout(activateLink, 100);
});


function activateLink(){
    let contactsDivs = document.querySelectorAll(".contacts-div");
    
    contactsDivs.forEach(function(contactsDiv) {
        contactsDiv.classList.add("active-link");

        let images = contactsDiv.querySelectorAll("img");
        images.forEach(function(img){
            img.src = "assets/img/contacts1.png"
        });
    });
}

