const BASE_URL = "https://join1-29d52-default-rtdb.europe-west1.firebasedatabase.app";
let currentUser;
let currentUserData;
let contacts = [];
let groupedContacts = {};
let activeContact;

const colors = ["#FF7A00", "#9327FF", "#6E52FF", "#FC71FF", "#FFBB2B", "#1FD7C1", "#FF4646"];
let colorIndex = 0;


/**
 * This function is used to call several other functions from the script.js-file, after the DOM-content is loaded.
 */
document.addEventListener("DOMContentLoaded", async function(){
    setTimeout(activateLink, 100);
    await getCurrentUserData();
    setTimeout(displayUserInitials, 200);
    await loadContacts();
    displayContacts();
    saveCurrentUserAsContact();
});


/**
 * This function activates the link to the 'Contacs' page in the menu on the left side, so that it is clear to the user, that he or she already is on the 'Contacts' page.
 */
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


/**
 * This function creates a newUserContact-object, so that the user can be displayed in the contacts-list and also can be assigned to a task.
 */
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
            await postData("/allContacts/", newUserContact);
        }
    }
}



/**
 * This functions activates the contact one clicked on in the contacts list, so that it can be displayed in a larger format.
 * 
 * @param {HTMLDivElement} div - It takes in the div-element the user clicks on as a parameter.
 */
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


/**
 * This function displays the active contact in a larger format.
 */
function displayActiveContact() {
    if (window.innerWidth < 1080) {
        displayActiveContactMobile();
    }

    let scdDiv = document.getElementById("single-contact-display-div");
    scdDiv.classList.remove("show");
    
   
    if (activeContact) {
        scdDiv.innerHTML = getActiveContactTemplate(activeContact);
        setTimeout(() => {
            scdDiv.classList.add("show");
        }, 100);
    }
}


/**
 * This function displays the options on the single contact display for the mobile version.
 */
function openScdOptionsMobile(){
    document.getElementById('scd-options-menu').classList.remove('d-none');
}


/**
 * This function hides the options on the single contact display for the mobile version.
 */
function closeScdOptionsMobile(){
    document.getElementById('scd-options-menu').classList.add('d-none');
}


/**
 * This function displays the active contact for the mobile version.
 */
function displayActiveContactMobile(){
    const contactsAllDiv = document.querySelector('.contacts-display-div');
    const singleContactDisplay = document.querySelector('.contact-display');
    const addContactBtnMobile = document.getElementById('addContactBtnMobile');

    contactsAllDiv.style.display = 'none';
    addContactBtnMobile.onclick = openScdOptionsMobile;
    singleContactDisplay.style.display = 'block';
    document.getElementById("mobileContactOptionsBtn").src =  "assets/img/three_dots.png";
}


/**
 * This function hides the active contact for the mobile version.
 */
function hideSingleContactDisplay(){
    const contactsAllDiv = document.querySelector('.contacts-display-div');
    const singleContactDisplay = document.querySelector('.contact-display');
    const addContactBtnMobile = document.getElementById('addContactBtnMobile');

    contactsAllDiv.style.display = 'block';
    // addContactBtnMobile.style.display = 'block';
    singleContactDisplay.style.display = 'none';
    document.getElementById("mobileContactOptionsBtn").src = "assets/img/person_add.png";
    addContactBtnMobile.onclick = displayAddContactModal;


    document.querySelectorAll(".contacts-display-small").forEach(function(contact){
        contact.classList.remove("active-contact-sm");
        })
}


/**
 * This function displays the add-contact-modal. Because the edit-modal also uses the same html elements, the text and onclick-function needs
 *  to be changed back, in case the displayEditContactModal-function was called before.
 */
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
    document.getElementById("add-contact-form").onsubmit = function(event) {
        uploadNewContact();
        return false; 
    };

    setTimeout(() => {
        document.getElementById("inner-add-contact-modal").classList.add("show");
    }, 10);
    
}


/**
 * This function hides the add-contact-modal.
 */
function hideAddContactModal(){
    document.getElementById("inner-add-contact-modal").classList.remove("show");
   
    setTimeout(() => {
        document.getElementById("add-contact-modal").classList.add("display-none");
    }, 200);
   
}


/**
 * This function clears the add-contact-form.
 */
function clearForm(){
    const form = document.getElementById("add-contact-form");
    form.reset();
    hideAddContactModal();
}


/**
 * This function calls all other functions necessary to create a new contact and upload it to the api-server.
 */
async function uploadNewContact(){
    let form = document.getElementById("add-contact-form");
    let newContact = createNewContact();
    if (newContact){
        await postData("/allContacts/", newContact);
        form.reset();
        hideAddContactModal();
        displayConfirmationMessage();
        await loadContacts();
        displayContacts();
    } 
}  



/**
 * This function creates a new contact-object. It also prevents that the user can add the same contact twice.
 * 
 * @returns - It returns the newly created contact-object.
 */
function createNewContact(){
    let name = document.getElementById("new-contact-name");
    let mail = document.getElementById("new-contact-mail");
    let phone = document.getElementById("new-contact-phone");

    let contactExists = contacts.some(contact => contact.name === name.value);

    if (name.value && mail.value && phone.value){
        if(contactExists){
            alert("Contact already exists.");
        } else {
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
}


/**
 * This function creates an initials-variable from the name of any given contact.
 * 
 * @param {string} name - It takes in a contact-name as a parameter.
 * @returns - It returns the initials of the contact.
 */
function getContactInitials(name){
    let initials = name.split(/\s+/).map(part => part[0]).join('');
    return initials.toUpperCase();
}


/**
 * This function displays a confirmation message, when a new contact is succesfully created.
 */
function displayConfirmationMessage(){
    let confirmationDiv = document.getElementById("contact-added-confirmation");
    
    setTimeout(() => {
        confirmationDiv.classList.add("show");
    }, 500);
   
    setTimeout(() => {
        confirmationDiv.classList.remove("show");
    }, 2000);
}


/**
 * This function displays all contacts in the contacts-list on the contacts page in alphabetical order.
 */
function displayContacts() {
    let contactsContainer = document.getElementById("contacts-display-bar");
    contactsContainer.innerHTML = '';
    sortContacts();

    for (let letter in groupedContacts) {
        if (groupedContacts.hasOwnProperty(letter)) {
            const group = groupedContacts[letter];
            contactsContainer.innerHTML += getContactGroupTemplate(letter, group);
        }
    }
}


/**
 * This function sorts all contacts in alphabetical order. To achieve this it creates a groupedContacts-object that consists of several arrays for every letter
 * in the alphabet. It loops over every contact in the contacts-array and pushes it into the respective array inside the groupedContacts-object.
 */
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


/**
 * This function displays the edit contact modal. For that it uses the add-contact-modal and only changes some text and the onclick-function.
 */
function displayEditContactModal(){
    document.getElementById("add-contact-modal").classList.remove("display-none");
    setTimeout(function() {
        document.getElementById("inner-add-contact-modal").classList.add("show");
    }, 50);
   
    document.getElementById("add-contact-modal-title").innerHTML = "Edit Contact";
    document.getElementById("add-contact-team").innerHTML = "";
    document.getElementById("new-contact-name").value = activeContact.name;
    document.getElementById("new-contact-mail").value = activeContact.mail;
    document.getElementById("new-contact-phone").value = activeContact.phone;
    document.getElementById("cancel-or-delete-btn").innerHTML = "Delete";
    document.getElementById("cancel-or-delete-btn").onclick = deleteContact;
    document.getElementById("create-or-save-btn").innerHTML = "Save" + `<img class="btn-icon" src="assets/img/check_white.png">`;
    document.getElementById("add-contact-form").onsubmit = function(event) {
        editContact();
        return false; 
    };
    
 }


/**
 * This function calls all the necessary functions to edit a contact from the local contacts-array and than upload the changes to the server.
 */
async function editContact(){
    editContactLocally();
    displayContacts();
    displayActiveContact();
    await deleteContactsOnServer();
    await uploadContactsOnServer();
    hideAddContactModal();
}


/**
 * This function edits a contact locally. It first gets the index of the active contact in the contacts-array, so that it can than replace it with the modified activContact.
 */
function editContactLocally(){
    const activeContactIndex = contacts.findIndex(contact => contact.name === activeContact.name);

    activeContact.name = document.getElementById("new-contact-name").value;
    activeContact.mail = document.getElementById("new-contact-mail").value;
    activeContact.phone = document.getElementById("new-contact-phone").value;
    activeContact.initials = getContactInitials(activeContact.name);

    contacts[activeContactIndex] = activeContact;
}


/**
 * This function deletes a contact from the local contacts-array and from the server.
 */
async function deleteContact(){
    document.getElementById("single-contact-display-div").classList.remove("show");

    deleteContactLocally();
    changeActiveContact();
    await deleteContactsOnServer();
    await uploadContactsOnServer();
    displayActiveContact();
    displayContacts();
    changeActiveContactDisplaySmall();
}


/**
 * This function changes the active contact, when a contact gets deleted to the next contact in the contacts-array.
 */
function changeActiveContact(){
    let currentIndex = contacts.findIndex(contact => contact.mail === activeContact.mail);

    let nextIndex = (currentIndex + 1) % contacts.length;
    activeContact = contacts[nextIndex];
}


/**
 * This function deletes a contact from the local contacts-array based on the mail property of the activeContact. To achieve this it creates a new
 * array with the filter method, that consists of all the contacts in the contacts-array, whose mail does not match the mail of the activeContact.
 */
function deleteContactLocally(){
    contacts = contacts.filter(contact => contact.mail !== activeContact.mail);
}


/**
 * This function deletes all contacts of the current user from the server.
 * 
 * @returns - It returns the response converted to json-format.
 */
async function deleteContactsOnServer(){
    let response = await fetch(BASE_URL + "/allContacts/" + ".json",{
        method: "DELETE",
    });
    return responseToJson = await response.json();
}


/**
 * This function uploads every contact from the contacts-array to the server. To achieve this it loops over every contact within the array
 * and then creates a new contact-object, which then gets uploaded to the server.
 */
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
        await postData("/allContacts/", existingContact);
    }
}


/**
 * This function changes the display of the active contact in the contacts-list, in case a contact gets deleted.
 */
function changeActiveContactDisplaySmall() {
    const contactDivs = document.querySelectorAll('.contacts-display-small');
    contactDivs.forEach(div => {
        const nameDiv = div.querySelector('.contact-name-sm');
        if (nameDiv && nameDiv.innerHTML === activeContact.name) {
            div.classList.add("active-contact-sm");
        }
    });
}
