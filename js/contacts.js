const BASE_URL = "https://join-4544d-default-rtdb.europe-west1.firebasedatabase.app";
let currentUser;
let contacts = [];



document.addEventListener("DOMContentLoaded", async function(){
    setTimeout(activateLink, 100);
    await getCurrentUserData();
    displayUserInitials();
    await loadContacts();
    displayContacts();
});


async function getCurrentUserData(){
    let response = await fetch(BASE_URL + "/allUsers/currentUser.json")
    let responseToJson = await response.json();
    let userData = Object.values(responseToJson)[0];
    currentUser = userData.name;
}


function displayUserInitials(){
    let initialsButton = document.getElementById("user-initials");
    let currentUserInitials;

    if (currentUser) {
        let currentUserName = currentUser.trim().split(/\s+/);

        if (currentUserName.length === 1) {
            currentUserInitials = currentUserName[0];
        } else if (currentUserName.length === 2) {
            currentUserInitials = currentUserName[0][0] + currentUserName[1][0];
        } else if (currentUserName.length > 2) {
            currentUserInitials = currentUserName[0][0] + currentUserName[currentUserName.length - 1][0];
        }
    
        initialsButton.innerHTML = currentUserInitials.toUpperCase();
    } else {
        initialsButton.innerHTML = "G";
    }
}


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



function activateContact(div){
    document.querySelectorAll(".contacts-display-small").forEach(function(contact){
        contact.classList.remove("active-contact-sm");
        })
    div.classList.add("active-contact-sm");
}


function displayAddContactModal(){
    document.getElementById("add-contact-modal").classList.remove("display-none");
}


function hideAddContactModal(){
    document.getElementById("add-contact-modal").classList.add("display-none");
}


function clearForm(){
    const form = document.getElementById("add-contact-form");
    form.reset();
    hideAddContactModal();
}


async function uploadNewContact(){
    let form = document.getElementById("add-contact-form");
    let newContact = createNewContact();
    if (newContact){
        await postData("/allContacts/" + currentUser.trim(), newContact);
        form.reset();
        hideAddContactModal();
        displayConfirmationMessage();
    } else {
        console.log("Failed to create a new contact. Please check the form inputs.");
    }
}  


async function postData(path="", data={}){
    let response = await fetch(BASE_URL + path + ".json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });
    return await response.json();
}


function createNewContact(){
    let name = document.getElementById("new-contact-name");
    let mail = document.getElementById("new-contact-mail");
    let phone = document.getElementById("new-contact-phone");

    if (name.value && mail.value && phone.value){
        newContact = {
            "name": name.value,
            "mail": mail.value,
            "phone": phone.value
        }
        return newContact;
    }
}


function displayConfirmationMessage(){
    let addContactBtn = document.getElementById("add-contact-btn");

    addContactBtn.innerHTML = "Contact succesfully created";
    setTimeout(function(){
        addContactBtn.innerHTML = `Add new contact <img src="assets/img/person_add.png" class="add-contact-icon">`;
    }, 2000);
}



async function loadContacts(){
    let response = await fetch(BASE_URL + "/allContacts/" + currentUser + ".json");
    contacts = await response.json();
    console.log(contacts);
}



function displayContacts(){

    
}