document.addEventListener("DOMContentLoaded", function(){
    setTimeout(activateLink, 100);
});


function activateLink(){
    let summaryDivs = document.querySelectorAll(".summary-div");
    
    summaryDivs.forEach(function(summaryDiv) {
        summaryDiv.classList.add("active-link");

        let images = summaryDiv.querySelectorAll("img");
        images.forEach(function(img){
            img.src = "assets/img/summary1.png"
        });
    });
}