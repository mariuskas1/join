const BASE_URL = "https://join-4544d-default-rtdb.europe-west1.firebasedatabase.app";
let currentUser;
let currentUserData;
let contacts = [];
let groupedContacts = {};
let activeContact;

const colors = ["#FF7A00", "#9327FF", "#6E52FF", "#FC71FF", "#FFBB2B", "#1FD7C1", "#FF4646"];
let colorIndex = 0;




document.addEventListener("DOMContentLoaded", async function(){
    setTimeout(activateLink, 100);
    await getCurrentUserData();
    setTimeout(displayUserInitials, 40);
    await loadContacts();
    displayContacts();
    saveCurrentUserAsContact();
});


async function getCurrentUserData(){
    let response = await fetch(BASE_URL + "/allUsers/currentUser.json")
    let responseToJson = await response.json();
    let userData = Object.values(responseToJson)[0];
    currentUser = userData.name;
    currentUserData = userData;
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


async function saveCurrentUserAsContact(){
    if (currentUser){
        const trimmedUserName = currentUserData.name.trim().toLowerCase();
        const contactExists = contacts.some(contact => contact.name.trim().toLowerCase() === trimmedUserName);

        if(!contactExists){
            newUserContact = {
                "name": currentUserData.name,
                "mail": currentUserData.email,
                "phone": "",
                "initials": getContactInitials(currentUserData.name),
                "info": "Contact Information",
                "color": "#29ABE2"
            }
           
            await postData("/allContacts/" + currentUser.trim(), newUserContact);
        }
    }
}




function activateContact(div){
    document.querySelectorAll(".contacts-display-small").forEach(function(contact){
        contact.classList.remove("active-contact-sm");
        })
    div.classList.add("active-contact-sm");

    activeContact = '';
    let activeContactName = div.querySelector(".contact-name-sm").innerHTML;
    activeContact = contacts.find(contact => contact.name === activeContactName);
    displayActiveContact();
}


function displayActiveContact(){
    if (window.innerWidth < 1080){
        displayActiveContactMobile();
    }

    let scdDiv = document.getElementById("single-contact-display-div");
    scdDiv.innerHTML = '';
    
    if(activeContact){
        scdDiv.innerHTML += `
        <div class="single-contact-display-header">
            <div class="scd-initials" style="background-color: ${activeContact.color};">${activeContact.initials}</div>
            <div class="scd-name-div">
                <span class="scd-name">${activeContact.name}</span>
                <div class="scd-options-div">
                    <button class="scd-option-btn" onclick="displayEditContactModal()"><img src="assets/img/edit.png"> Edit</button>
                    <button class="scd-option-btn" onclick="deleteContact()"><img src="assets/img/delete.png"> Delete</button>
                </div>
            </div>
        </div>
        <div class="single-contact-display-body">
            <span class="contact-info">Contact Information</span>
            <span class="scd-info-title">Email</span>
            <span class="contact-mail">${activeContact.mail}</span>
            <span class="scd-info-title">Phone</span>
            <span class="contact-phone">${activeContact.phone}</span>
        </div>
        <div class="scd-options-mobile-div" onclick="openScdOptionsMobile();"><img src="/assets/img/three_dots.png" class="scd-options-mobile-img"></div>
        `;
    }
}


function openScdOptionsMobile(){
    document.getElementById('scd-options-menu').classList.remove('d-none');
}


function closeScdOptionsMobile(){
    document.getElementById('scd-options-menu').classList.add('d-none');
}


function displayActiveContactMobile(){
    const contactsAllDiv = document.querySelector('.contacts-display-div');
    const singleContactDisplay = document.querySelector('.contact-display');
    const addContactBtnMobile = document.getElementById('addContactBtnMobile');

    contactsAllDiv.style.display = 'none';
    addContactBtnMobile.style.display = 'none';
    singleContactDisplay.style.display = 'block';

}

function hideSingleContactDisplay(){
    const contactsAllDiv = document.querySelector('.contacts-display-div');
    const singleContactDisplay = document.querySelector('.contact-display');
    const addContactBtnMobile = document.getElementById('addContactBtnMobile');

    contactsAllDiv.style.display = 'block';
    addContactBtnMobile.style.display = 'block';
    singleContactDisplay.style.display = 'none';

    document.querySelectorAll(".contacts-display-small").forEach(function(contact){
        contact.classList.remove("active-contact-sm");
        })
}



function displayAddContactModal(){
    document.getElementById("add-contact-modal").classList.remove("display-none");

    document.getElementById("add-contact-modal-title").innerHTML = "Add contact";
    document.getElementById("add-contact-team").innerHTML = "Tasks are better with a team!";
    document.getElementById("new-contact-name").value = "";
    document.getElementById("new-contact-mail").value = "";
    document.getElementById("new-contact-phone").value = "";

    document.getElementById("cancel-or-delete-btn").innerHTML = "Cancel" + `<img class="btn-icon" src="assets/img/close.png"></img>`;
    document.getElementById("cancel-or-delete-btn").onclick = clearForm;

    document.getElementById("create-or-save-btn").innerHTML = "Create contact" + `<img class="btn-icon" src="assets/img/check_white.png">`;
    document.getElementById("create-or-save-btn").type = "submit";
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
        await loadContacts();
        displayContacts();
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
        const contactColor = colors[colorIndex];
        colorIndex = (colorIndex + 1) % colors.length;

        let newContact = {
            "name": name.value,
            "mail": mail.value,
            "phone": phone.value,
            "initials": getContactInitials(name.value),
            "info": "Contact Information",
            "color": contactColor
        };
        return newContact;
    }
}


function getContactInitials(name){
    let initials = name.split(/\s+/).map(part => part[0]).join('');
    return initials.toUpperCase();
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
    let responseToJson = await response.json();
    if( !responseToJson) {
        console.log("No existing contacts yet")
    } else {
        contacts = Object.values(responseToJson);
    }
}



function displayContacts(){
    let contactsContainer = document.getElementById("contacts-display-bar");
    contactsContainer.innerHTML = '';

    sortContacts();

    for (let letter in groupedContacts) {
        if (groupedContacts.hasOwnProperty(letter)) {
            const group = groupedContacts[letter];
            let groupHTML = `
                <div class="contacts-group">
                    <div class="contacts-group-letter">${letter}</div>
                    <div class="contacts-display-bar">`;
    
            for (let i = 0; i < group.length; i++) {
                const contact = group[i];

                groupHTML += `
                    <div class="contacts-display-small" onclick="activateContact(this)">
                        <div class="initials-div" style="background-color: ${contact.color};">${contact.initials}</div>
                        <div class="contacts-display-info">
                            <div class="contact-name-sm">${contact.name}</div>
                            <div class="contact-mail-sm">${contact.mail}</div>
                        </div>
                    </div>`;
            }

            groupHTML += `</div></div>`;
            contactsContainer.innerHTML += groupHTML;
        }
    }
}


function sortContacts(){
    groupedContacts = {};
    
    contacts.sort((a, b) => a.name.localeCompare(b.name));

    for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        const firstLetter = contact.name.charAt(0).toUpperCase();
        if (!groupedContacts[firstLetter]) {
            groupedContacts[firstLetter] = [];
        }
        groupedContacts[firstLetter].push(contact);
    }

}


function displayEditContactModal(){
    document.getElementById("add-contact-modal").classList.remove("display-none");

    document.getElementById("add-contact-modal-title").innerHTML = "Edit Contact";
    document.getElementById("add-contact-team").innerHTML = "";
    document.getElementById("new-contact-name").value = activeContact.name;
    document.getElementById("new-contact-mail").value = activeContact.mail;
    document.getElementById("new-contact-phone").value = activeContact.phone;

    document.getElementById("cancel-or-delete-btn").innerHTML = "Delete";
    document.getElementById("cancel-or-delete-btn").onclick = deleteContact;

    document.getElementById("create-or-save-btn").innerHTML = "Save" + `<img class="btn-icon" src="assets/img/check_white.png">`;
    document.getElementById("create-or-save-btn").type = "button";
    document.getElementById("create-or-save-btn").onclick = editContact;
 }



async function editContact(){
    editContactLocally();
    displayContacts();
    displayActiveContact();
    await deleteContactsOnServer();
    await uploadContactsOnServer();
}


function editContactLocally(){
    const activeContactIndex = contacts.findIndex(contact => contact.name === activeContact.name);

    activeContact.name = document.getElementById("new-contact-name").value;
    activeContact.mail = document.getElementById("new-contact-mail").value;
    activeContact.phone = document.getElementById("new-contact-phone").value;
    activeContact.initials = getContactInitials(activeContact.name);

    contacts[activeContactIndex] = activeContact;
}



async function deleteContact(){
    deleteContactLocally();
    changeActiveContact();
    await deleteContactsOnServer();
    await uploadContactsOnServer();
    displayActiveContact();
    displayContacts();
    changeActiveContactDisplaySmall();
}



function changeActiveContact(){
    let currentIndex = contacts.findIndex(contact => contact.mail === activeContact.mail);

    let nextIndex = (currentIndex + 1) % contacts.length;
    activeContact = contacts[nextIndex];
}


function deleteContactLocally(){
    contacts = contacts.filter(contact => contact.mail !== activeContact.mail);
}


async function deleteContactsOnServer(){
    let response = await fetch(BASE_URL + "/allContacts/" + currentUser + ".json",{
        method: "DELETE",
    });
    return responseToJson = await response.json();
}


async function uploadContactsOnServer(){
    for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        let existingContact = {
            "name": contact.name,
            "mail": contact.mail,
            "phone": contact.phone,
            "initials": getContactInitials(contact.name),
            "info": "Contact Information",
            "color": contact.color
        }
        await postData("/allContacts/" + currentUser.trim(), existingContact);
    }
}


function changeActiveContactDisplaySmall() {
    const contactDivs = document.querySelectorAll('.contacts-display-small');
    contactDivs.forEach(div => {
        const nameDiv = div.querySelector('.contact-name-sm');
        if (nameDiv && nameDiv.innerHTML === activeContact.name) {
            div.classList.add("active-contact-sm");
        }
    });
}
