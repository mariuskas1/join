const BASE_URL1 = "http://127.0.0.1:8000/api/" ;


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
    const previousPage = localStorage.getItem('previousPage');
    
    if (previousPage) {
        window.location.href = previousPage;
    } 
}



/**
 * This function logs the current user out and deletes his or her data from the local storage. 
 * It redirects the user to the index-page.
 */
async function logOut(){
    localStorage.removeItem("currentUser");
    localStorage.removeItem("rememberedUser");
    localStorage.removeItem("logged in?");
    window.location.href = "index.html";
}


/**
 * This function loads the data of the current user from the local storage and converts it into JSON-format.
 */
function getCurrentUserData(){
    let currentUserLocalStorage = localStorage.getItem("currentUser");
    if (currentUserLocalStorage) {
        currentUser = JSON.parse(currentUserLocalStorage);
    } else {
        currentUser = null; 
    }
    checkUserAuthentication();
}


async function checkUserAuthentication(){
    if(!currentUser){
        redirectTo("index.html");
    } else {
        const isUserTokenValid = await tryFetchWithAuthentication();
        if (!isUserTokenValid){
            localStorage.removeItem("currentUser"); 
            redirectTo("index.html");
        }
    }
}


async function tryFetchWithAuthentication() {
    try {
        const response = await testFetchForTokenValidaion();
        if (response.ok) {
            return true; 
        } else {
            console.error("Token validation failed:", response.status);
            return false; 
        }
    } catch (error) {
        console.error("Network error during token validation:", error);
        return false;
    }
}


async function testFetchForTokenValidaion(){
    const response = await fetch(BASE_URL1 + "contacts/",{
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${currentUser.token}`,
        }
    });
    return response;
}




/**
 * This function loads all contacts that are saved in the current users account from the server and saves them into the local contacts-array.
 */
async function loadContacts(){
    try {
        const response = await fetch(BASE_URL1 + "contacts/",{
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${currentUser.token}`,
            }
        });

        if(response){
            contacts = await response.json();
        }
    } catch (error) {
        console.error(error)
    }
}

/**
 * This function displays all saved contacts in the add-task-form so they can be assigned to the newly created task.
 */
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


/**
 * This function clears all input fields of the add-task-form.
 */
function clearForm(){
        const form = document.getElementById("add-task-form");
        form.reset();
}


/**
 * This function displays the initials of the current user in the top menu bar. If no current user exists, it displays a 'G' for guest.
 */
function displayUserInitials(){
    let initialsButton = document.getElementById("user-initials");
    let currentUserInitials;

    if (!currentUser.isGuest) {
        let currentUserName = currentUser.name.trim().split(/\s+/);

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


/**
 * This function handles the key-down-event for the subtask input field, so that when clicking 'enter' another subtask gets added to the task.
 * 
 * @param {event} event - It takes in the key-down-event as a parameter, so that it can prevent the default behaviour, meaning the whole taks
 * does not get added when 'enter' is pressed inside the subtask input field, only the subtask.
 */
function handleKeyDownSubtask(event){
    if (event.key === "Enter") {
        event.preventDefault(); 
        addSubtask(); 
    }
}


/**
 * This function adds a new subtask to the currently created task and displays it inside the add-task-form.
 */
function addSubtask() {
    let input = document.getElementById("subtasks").value;
    let subtasksList = document.getElementById("subtasks-list");

    subtasksList.innerHTML += getSubtaskTemplate(input);
    document.getElementById("subtasks").value = '';
}


/**
 * This function deletes the subtask from add-task-form.
 * 
 * @param {HTMLElement} element - It takes in the html-element that contains the clicked on icon as a parameter.
 */
function deleteSubtask(element){
    let subtask = element.closest('li');
    subtask.remove();
}


/**
 * This function makes it possible to edit an added subtask in that it enables the input field of the subtask.
 * 
 * @param {HTMLElement} element - It takes in the html-element that contains the clicked on icon as a parameter.
 */
function editSubtask(element) {
    let listElement = element.closest('li');
    let subtaskInput = listElement.querySelector('input');
    subtaskInput.removeAttribute('disabled');
    subtaskInput.focus();
}
  

/**
 * This function calls all the necessary functions to create a new task and then upload it to the server. If the new task is created on the board-
 * page, it will also call some other functions so that the add-task-modal gets hidden again and the newly created task gets directly displayed
 * on the board.
 * 
 * @param {Event} event - It takes in the click/submit-event as a parameter to prevent the default form-behaviour.
 */
async function uploadNewTask(event){  
    let form = document.getElementById("add-task-form");
    event.preventDefault();
    let newTask = createNewTask();
    if (newTask){
        const createdTask = await postData("tasks/", newTask);
        await uploadSubtasks(createdTask.id);
        displayAddedConfirmationMessage();
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


async function uploadSubtasks(taskId){
    let subtasks = document.querySelectorAll(".subtask-input");
    if (subtasks.length > 0) {
        for (const input of subtasks) {
            let newSubtask = {
                title: input.value,
                status: "todo",
                task: taskId 
            };
            await postData("subtasks/", newSubtask);
        }
    }
}


/**
 * This function displays a confirmation message when a task is added.
 */
function displayAddedConfirmationMessage(){
    let modal = document.getElementById("task-added-modal");
    modal.classList.add("show");

    setTimeout(function() {
        modal.classList.remove("show");
    }, 2000); 
}


/**
 * This function creates a new task from the values of the relevant input-fields. It also performs the form validation and displays 'required-labels'
 * if the titel, date or category input fields are left empty.
 * 
 * @returns - It returns the newly created task-object.
 */
function createNewTask(){
    let date = document.getElementById("date");
    let category = document.getElementById("category");
    let description = document.getElementById("description");
    let assignedTo = document.getElementById("assigned");
    let title = document.getElementById("title");
    let status = getAddTaskStatus();
    let selectedPriority = getSelectedPriority();

    let newTask = null;

    if (title.value && date.value && category.value) {
        newTask = {
            "title": title.value,
            "date": date.value,
            "category": category.value,
            "prio": selectedPriority,
            "description": description.value,
            "assignedTo": assignedTo.value,
            "status" : status,
        }
        hideRequiredLabels();
        return newTask;
    } else {
        displayValidationMsg(title.value, date.value, category.value);
    }
}


function displayValidationMsg(title, date, category){
    if (!title) {
        document.getElementById("title-label-2").style.opacity = 1;
    }
    if (!date) {
        document.getElementById("date-label-2").style.opacity = 1;
    }
    if (!category) {
        document.getElementById("category-label-2").style.opacity = 1;
    }
}


/**
 * This function checks the value of the addTaskStatus-variable. 
 * 
 * @returns If addTaskStatus is null or undefined it returns the status 'todo', else it returns the addTaskStatus.
 */
function getAddTaskStatus(){
    if (!addTaskStatus){
        return 'todo'
    } else {
        return addTaskStatus;
    } 
}


/**
 * This function generates a random ID for the task that is being created.
 * 
 * @returns - It returns the ID in string format.
 */
function generateRandomID(){
    const randomID = Math.floor(10000000 + Math.random() * 90000000);
    return randomID.toString();
}


/**
 * This function hides the required labels in the add-task-form.
 */
function hideRequiredLabels(){
    document.querySelectorAll(".required-label").forEach(label => {
        label.style.opacity = 0;
    });
}


/**
 * This function checks the selected priority for the task in the add-task-form.
 * 
 * @returns - It returns the selected priority.
 */
function getSelectedPriority() {
    let selectedPriority = document.querySelector('input[name="prio"]:checked').value;
    return selectedPriority;
}


/**
 * This functions checks the new selected priority if the priority gets edited in the edit-task-form.
 * 
 * @returns - It returns the edited priority.
 */
function getEditedPriority(){
    let editedPriority = document.querySelector('input[name="prio-edit"]:checked').value;
    return editedPriority;
}


/**
 * This function creates a new subtask object.
 * 
 * @returns - It returns the newly created subtask-object.
 */
function getSubtaskValues(){
    let subtaskValues = [];

    let subtasks = document.querySelectorAll(".subtask-input");
    if (subtasks.length > 0) {
        subtasks.forEach((input) => {
            subtaskValues.push(input.value);
        });
    }
    return subtaskValues;
}


/**
 * This function loads data to the api-server.
 * 
 * @param {string} path - It takes in an addition to the BASE_URL as a parameter.
 * @param {Object} data - It also takes in the object that is to be loaded onto the server as a parameter.
 * @returns 
 */
async function postData(url, data={}){

    let response = await fetch(BASE_URL1 + url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${currentUser.token}`,
        },
        body: JSON.stringify(data)
    });
    return await response.json();
}


/**
 * This function stores the current page URL before opening the new tab, so that it can be used in the returnToPreviousPage-function.
 */
function saveCurrentPage() {
    localStorage.setItem('previousPage', window.location.href);
}