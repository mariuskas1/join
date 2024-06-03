document.addEventListener("DOMContentLoaded", function(){
    setTimeout(activateLink, 100);
});


function activateLink(){
    let boardDivs = document.querySelectorAll(".board-div");
    
    boardDivs.forEach(function(boardDiv) {
        boardDiv.classList.add("active-link");

        let images = boardDiv.querySelectorAll("img");
        images.forEach(function(img){
            img.src = "assets/img/board1.png"
        });
    });
}