
/**
 * This function includes the html-elements for the menu-template on the page.
 */
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


/**
 * This function redirects the user to the page, which is given in as a parameter.
 * 
 * @param {string} page - The url of the page is given in as parameter.
 */
function redirectTo(page){
    window.location.href = page;
}


/**
 * This function displays the user menu in the top right corner of the page.
 */
function openUserMenu(){
    document.getElementById('user-menu').classList.remove('d-none');
}


/**
 * This function closes the user menu in the top right corner of the page.
 */
function closeUserMenu(){
    document.getElementById('user-menu').classList.add('d-none');
}


/**
 * This function redirects the user back to the previous page.
 */
function returnToPreviousPage(){
    window.history.back();
}


async function logOut(){
    localStorage.removeItem("currentUser");
    localStorage.removeItem("rememberedUser");
    window.location.href = "index.html";
}


function getCurrentUserData(){
    let currentUserLocalStorage = localStorage.getItem("currentUser");
    if (currentUserLocalStorage) {
        currentUserData = JSON.parse(currentUserLocalStorage);
        currentUser = currentUserData.name;
    } else {
        currentUser = null; 
    }
}



async function loadContacts(){
    let response = await fetch(BASE_URL + "/allContacts/.json");
    let responseToJson = await response.json();
    if(responseToJson) {
        contacts = Object.values(responseToJson);
    }
}


function displayContactsInForm(){
    let contactsLists = document.querySelectorAll(".select-contacts");
    
    contactsLists.forEach(selectElement => {
        selectElement.innerHTML = `<option value="" disabled selected>Select contacts to assign</option>`;
        for (let i = 0; i < contacts.length; i++) {
            const contact = contacts[i];
            selectElement.innerHTML += `<option value="${contact.name}">${contact.name}</option>`;
        }
    });
}


function clearForm(){
        const form = document.getElementById("add-task-form");
        form.reset();
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


function handleKeyDownSubtask(event){
    if (event.key === "Enter") {
        event.preventDefault(); 
        addSubtask(); 
    }
}



function addSubtask(){
    let input = document.getElementById("subtasks").value;
    let subtasksList = document.getElementById("subtasks-list");

    subtasksList.innerHTML += `
        <li>
            <img class="bullet-point" src="assets/img/circle-solid.svg">
            <input type="text" class="subtask-input" name="subtask-input" value="${input}" disabled spellcheck="false">
            <div class="subtask-icons">
                <img class="subtask-icon" onclick="editSubtask(this)" src="assets/img/edit.png">
                <img class="subtask-icon" onclick="deleteSubtask(this)" src="assets/img/delete.png">
             </div>
        </li>             
    `;

    document.getElementById("subtasks").value = '';
}


function deleteSubtask(element){
    let subtask = element.closest('li');
    subtask.remove();
}


function editSubtask(element) {
    let listElement = element.closest('li');
    let subtaskInput = listElement.querySelector('input');
    subtaskInput.removeAttribute('disabled');
    subtaskInput.focus();
}
  


/**
 * This function calls all the necessary functions to create a new task and then upload it to the server.
 * 
 * @param {Event} event - It takes in the click/submit-event as a parameter to prevent the default form-behaviour.
 */
async function uploadNewTask(event){  
    let form = document.getElementById("add-task-form");
    event.preventDefault();
    let newTask = createNewTask();
    if (newTask){
        await postData("/allTasks/", newTask);
        form.reset();
        document.getElementById("subtasks-list").innerHTML = '';
        addTaskStatus = null;

        if (window.location.pathname.endsWith("board.html")){
            hideAddTaskModal();
            await getAllTasks();
            sortTasks();
            displayTasksInBoard();
        }
    } 

    
} 





function createNewTask(){
    let date = document.getElementById("date");
    let category = document.getElementById("category");
    let description = document.getElementById("description");
    let assignedTo = document.getElementById("assigned");
    let title = document.getElementById("title");
    let status = getAddTaskStatus();
    let id = generateRandomID ();
    
    let selectedPriority = getSelectedPriority();
    let subtaskValues = getSubtaskValues();
    let newTask = null;

    if (title.value && date.value && category.value) {
        newTask = {
            "title": title.value,
            "date": date.value,
            "category": category.value,
            "prio": selectedPriority,
            "description": description.value,
            "assignedTo": assignedTo.value,
            "subtasks": subtaskValues,
            "status" : status,
            "id": id
        }
        hideRequiredLabels();
        return newTask;
    } else {
        if (!title.value) {
            document.getElementById("title-label-2").style.opacity = 1;
        }
        if (!date.value) {
            document.getElementById("date-label-2").style.opacity = 1;
        }
        if (!category.value) {
            document.getElementById("category-label-2").style.opacity = 1;
        }
    }
}


function getAddTaskStatus(){
    if (!addTaskStatus){
        return 'todo'
    } else {
        console.log("Das Script sagt der Status ist:", addTaskStatus)
        return addTaskStatus;
    } 
}


function generateRandomID(){
    const randomID = Math.floor(10000000 + Math.random() * 90000000);
    return randomID.toString();
}

function hideRequiredLabels(){
    document.querySelectorAll(".required-label").forEach(label => {
        label.style.opacity = 0;
    });
}


function getSelectedPriority() {
    let selectedPriority = document.querySelector('input[name="prio"]:checked').value;
    return selectedPriority;
}


function getEditedPriority(){
    let editedPriority = document.querySelector('input[name="prio-edit"]:checked').value;
    return editedPriority;
}


function getSubtaskValues(){
    let subtaskValues = {};

    let subtasks = document.querySelectorAll(".subtask-input");
    if (subtasks.length > 0) {
        subtasks.forEach((input, index) => {
            let subtaskID = generateRandomID();
            subtaskValues[`subtask${index}`] = {
                name: input.value,
                id: subtaskID,
                status: "todo"
                };
            });
    }
    return subtaskValues;
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

