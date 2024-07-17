

async function includeHTML() {
    let includeElements = document.querySelectorAll('[w3-include-html]');
    for (let i = 0; i < includeElements.length; i++) {
        const element = includeElements[i];
        file = element.getAttribute("w3-include-html"); 
        let resp = await fetch(file);
        if (resp.ok) {
            element.innerHTML = await resp.text();
        } else {
            element.innerHTML = 'Page not found';
        }
    }
}


function redirectTo(page){
    window.location.href = page;
}


function openUserMenu(){
    document.getElementById('user-menu').classList.remove('d-none');
}


function closeUserMenu(){
    document.getElementById('user-menu').classList.add('d-none');
}


function returnToPreviousPage(){
    window.history.back();
}


async function logOut(){
    let response = await fetch ("https://join-4544d-default-rtdb.europe-west1.firebasedatabase.app/allUsers/currentUser.json", {
        method: "DELETE",
    });
    return responseToJson = await response.json();
}
