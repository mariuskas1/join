// const BASE_URL = "https://join1-29d52-default-rtdb.europe-west1.firebasedatabase.app";
const BASE_URL = "http://127.0.0.1:8000/api/tasks/";
const ST_URL = "http://127.0.0.1:8000/api/subtasks/";


let currentUser;
let currentUserData;
let allTasks;
let tasksToDo = [];
let tasksInProgress = [];
let tasksAwaiting = [];
let tasksDone = [];
let contacts = [];
let openedTask;

let currentDraggedElement;
let addTaskStatus;


/**
 * This function is used to call several other functions from the script.js-file, after the DOM-content is loaded.
 */
document.addEventListener("DOMContentLoaded", async function(){
    setTimeout(activateLink, 100);
    await getCurrentUserData();
    setTimeout(displayUserInitials, 200);
    await loadContacts();
    await getAllTasks();
});




/**
 * This function activates the link to the 'Board' page in the menu on the left side, so that it is clear to the user, that he or she already is on the 'Board' page.
 */
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


/**This function opens the add-task-modal */
function openAddTaskModal(){
    document.getElementById('add-task-modal').classList.remove('display-none');
    setTimeout(() => {
        document.getElementById('inner-add-task-modal').classList.add('show');
        displayContactsInForm();
    }, 100);
    
    
}


/**This function hides the add-task-modal and clears the form so that it is empty when opened again.*/
function hideAddTaskModal(){
    clearForm();
    document.getElementById('inner-add-task-modal').classList.remove('show');
    setTimeout(() => {
        document.getElementById('add-task-modal').classList.add('display-none');
    }, 200);
   
}


/**This function loads all tasks for the current user from the API server and calls the necessary functions to display the tasks on the board page */
async function getAllTasks(){
    try {
        let response = await fetch(BASE_URL)

        if (!response.ok) {
            throw new Error("Network response was not ok")
        }

        let data = await response.json();
        if (!data || data.length === 0) {
           displayTasksInBoard();
        } else {
            allTasks = Object.values(data);
            sortTasks();
            displayTasksInBoard();
        }

    } catch (error) {
        console.error("Failed to fetch tasks:", error);
    }
}


/**
 * This function sorts all tasks in the currenUserTasks-array according to their status. To achieve this, it goes over every task-object, checks its
 * status and then pushes it into the respective globally defined array.      
 */
function sortTasks(){
    clearTaskArrays();
    if (allTasks){
        allTasks.forEach(task => {
            switch (task.status.toLowerCase()) {
                case 'todo':
                    tasksToDo.push(task);
                    break;
                case 'in_progress':
                    tasksInProgress.push(task);
                    break;
                case 'await_feedback':
                    tasksAwaiting.push(task);
                    break;
                case 'done':
                    tasksDone.push(task);
                    break;
                default:
                    console.log(`Unknown status: ${task.status}`);
            }
        });
    }
    
}

/**This function clears the arrays, that are used to sort the tasks according to their current status. */
function clearTaskArrays(){
    tasksToDo = [];
    tasksInProgress = [];
    tasksAwaiting = [];
    tasksDone = [];
}


/**This function displays the tasks on the board page. */
function displayTasksInBoard(){
    let todoColumn = document.getElementById("board-todo-column");
    let inprogressColumn = document.getElementById("board-inprogress-column");
    let awaitColumn = document.getElementById("board-await-column");
    let doneColumn = document.getElementById("board-done-column");

    todoColumn.innerHTML = "";
    inprogressColumn.innerHTML = "";
    awaitColumn.innerHTML = "";
    doneColumn.innerHTML = "";

    if(tasksToDo.length > 0){
        tasksToDo.forEach(task => {
            todoColumn.innerHTML += getTaskTemplate(task);
        });
    } else {
        todoColumn.innerHTML = `<div class="no-tasks-div">No tasks To do</div>`;
    }
    if(tasksInProgress.length > 0){
        tasksInProgress.forEach(task => {
            inprogressColumn.innerHTML += getTaskTemplate(task);
        });
    } else {
        inprogressColumn.innerHTML = `<div class="no-tasks-div">No tasks In Progress</div>`;
    }
    if(tasksAwaiting.length > 0){
        tasksAwaiting.forEach(task => {
            awaitColumn.innerHTML += getTaskTemplate(task);
        });
    } else {
        awaitColumn.innerHTML = `<div class="no-tasks-div">No tasks Awaiting Feedback</div>`;
    }
    if(tasksDone.length > 0){
        tasksDone.forEach(task => {
            doneColumn.innerHTML += getTaskTemplate(task);
        });
    } else {
        doneColumn.innerHTML = `<div class="no-tasks-div">No tasks Done</div>`;
    }
}


/**This function displays the logo for the contact that each task is assigned to. */
function renderTaskContacts(assignedContacts) {
    if(typeof assignedContacts === 'string'){
        assignedContacts = [assignedContacts];
    }
    
    return assignedContacts.map(contactName => {
        const assignedContactData = contacts.find(contact => contact.name === contactName);
        
        if(assignedContactData) {
            return `<div class="board-task-contact-logo" style="background-color: ${assignedContactData.color}">
                    ${assignedContactData.initials}
                </div>`;
        }
    })
}


/**
 * This function displays the priority-symbol for each task according to its priority.
 * 
 * @param {string} prio - It takes in the priority of the task object as an parameter.
 * @returns - It returns the priority symbol as an image-element.
 */
function renderTaskPrioDisplay(prio){
    if (prio === "low"){
        return `<img class="board-task-urgency" src="assets/img/low.png">`;
    }
    if (prio === "medium"){
        return `<img class="board-task-urgency" src="assets/img/medium_orange.png">`;
    }
    if (prio === "urgent"){
        return `<img class="board-task-urgency" src="assets/img/urgent.png">`;
    }
}



/**
 * This function displays the category-display-element for each task according to its category.
 * 
 * @param {string} category - It takes in the category of the task object as an parameter.
 * @returns - It returns the span-element with different content and color according to the category of the task.
 */
function renderTaskCategoryDisplay(category){
    if (category === "User Story"){
        return `<span class="board-task-category-div" id="board-task-category-us">User Story</span>`;
    }
    if (category === "Technical Task"){
        return `<span class="board-task-category-div" id="board-task-category-tt">Technical Task</span>`;
    }
}


/**
 * This function displays the number subtasks to-do/done for every task on the board.
 * 
 * @param {Object} subtasks - It takes in the subtasks-object as a parameter that is nested within each task-object.
 * @returns - It returns the subtask-progress-template.
 */
function renderSubtaskDisplay(subtasks){ 
    if(subtasks.length > 0){
        let subtasksArray = Object.values(subtasks);
        let allSubtasks = subtasksArray.length;
        let subtasksDone = subtasksArray.filter(subtask => subtask.status === "done").length;
        let subtasksDoneInPercent = (subtasksDone / allSubtasks) * 100;

        return getSubtaskProgressTemplate(subtasksDoneInPercent, subtasksDone, allSubtasks);
    } else {
        return ``;
    }
}


/**
 * This function saves the id of the task element, which is currently dragged.
 * 
 * @param {number} id - It takes in the id of the task, which is currently dragged, as a parameter.
 */
function startDragging(id){
    currentDraggedElement = id;
}


/**
 * This function just prevents the default behaviour, so that the currently dragged element can be droped above the column container.
 * 
 * @param {*} ev - It takes in the event as parameter.
 */
function allowDrop(ev) {
    ev.preventDefault();
  }


/**
 * This function changes the status of the currently dragged element, when it gets moved to another column.
 * 
 * @param {string} status - It takes in the status of the column the task gets moved to as a parameter.
 */
async function moveTo(status){
    const task = allTasks.find(task => task.id === currentDraggedElement);
    task.status = status;
    if (task.subtasks) {
        delete task.subtasks;
    }

    await editTaskOnMoving(task)
    removeHighlightClassAll();
    await updateTasks();
}


async function editTaskOnMoving(task){
    try {
        await fetch(BASE_URL + task.id + '/', {
            method:'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        });
    } catch (error) {
        console.error(error)
    }
}



/**
 * This function changes the background color of the task-column the current dragged element is dragged over.
 * 
 * @param {string} id - It takes in the id of the task-column as a parameter.
 */
function highlight(id){
    document.getElementById(id).classList.add('drag-area-highlight');
}


/**
 * This function changes the background color of the task-column the current dragged element leaves the column again.
 * 
 * @param {string} id - It takes in the id of the task-column as a parameter.
 */
function removeHighlight(id){
    document.getElementById(id).classList.remove('drag-area-highlight');
}



/**
 * This function removes the highlighting background color from all columns, when the dragged element gets moved to another column.
 */
function removeHighlightClassAll(){
    const columns = document.querySelectorAll('.board-column-body');
    columns.forEach(column => {
        column.classList.remove('drag-area-highlight');
    });
}


/**This function updates the task on the server and on the board, whenever changes are made locally. */
async function updateTasks(){
    clearTaskArrays();
    await getAllTasks();
}



/**
 * This function opens the task display modal and displays the task the user clicked on in a larger format.
 * 
 * @param {number} id - It takes in the id of the clicked task as a parameter.
 */
function openTaskDisplayModal(id){
    openedTask = allTasks.find(task => task.id === id);
    let taskDisplayModal = document.getElementById('task-display-modal');

    taskDisplayModal.classList.remove('display-none');
    taskDisplayModal.innerHTML = getLargeTaskTemplate(openedTask);
    renderLargeTaskSubtasksDisplay(openedTask.subtasks);
    
    setTimeout(() => {
        document.getElementById("tdl-modal").classList.add("show");
    }, 20);
   
}


/**This function hides the task display modal again and calls the updateTask-function, in case any changes were made. */
function hideTaskDisplayModal(){
    let taskDisplayBG = document.getElementById("task-display-modal");
    let taskBeingEdited = taskDisplayBG.querySelector("#edit-task-modal");

    if(taskBeingEdited){
        editTask(openedTask.id);
    } else {
        document.getElementById("tdl-modal").classList.remove("show");
    
        setTimeout(() => {
            document.getElementById('task-display-modal').classList.add('display-none');
        }, 200);
    }
    }
    
    
    


/**
 * This function hides the edit task modal and updates the task on the board.
 */
function hideEditTaskModal(){
    updateTasks();
    document.getElementById('edit-task-modal').classList.remove('show');

    setTimeout(function() {
        document.getElementById('task-display-modal').classList.add('display-none');
    }, 50);    
}


/**
 * This function renders the category display for the large task modal.
 * 
 * @param {string} category - It take in the category as a parameter.
 * @returns - It returns the html-template to display the task category.
 */
function renderLargeTaskCategoryDisplay(category){
    if (category === "User Story"){
        return `<div class="large-task-category" id="board-task-category-us">User Story</div>`
    }
    if (category === "Technical Task"){
        return `<div class="large-task-category" id="board-task-category-tt">Technical Task</div>`
    }
}


/**
 * This function displays the contacts the displayed task is assigned to in the opened task modal.
 * With the name or list of names, that is given in as a parameter, the function searches for the contact objects inside the contacts-array
 * and saves them in the variable assignedContactData.
 * 
 * @param {string} assignedContacts - It takes in a string of the names of the contacts the task is assigned to.
 * @returns - It returns the templates to display the contacts.
 */
function renderLargeTaskContactsDisplay(assignedContacts){
    if (typeof assignedContacts === 'string') {
        assignedContacts = [assignedContacts];
    }
    
    return assignedContacts.map(contactName => {
        const assignedContactData = contacts.find(contact => contact.name === contactName);
        return getContactDisplayTemplate(assignedContactData);
    });
}



/**
 * This function displays the subtasks of the opened task. It first converts the object into an array and than loops over the array to display every subtask it contains.
 * 
 * @param {Object} subtasks - It takes in the subtask-object as a parameter.
 */
function renderLargeTaskSubtasksDisplay(subtasks){
    let largeTaskSubtaskDisplay = document.getElementById("large-task-subtasks-display");
    largeTaskSubtaskDisplay.innerHTML = ''; 

    if (subtasks.length > 0) {
        let subtasksArray = Object.values(subtasks);
        subtasksArray.forEach(subtask => {
            largeTaskSubtaskDisplay.innerHTML += getSubtaskTemplateBoard(subtask);
        });
    } else {
        largeTaskSubtaskDisplay.innerHTML = "";
        document.getElementById("large-task-subtasks-header").innerHTML = "";
    }
}


/**
 * This function displays the priority of the opened task. 
 * 
 * @param {string} prio - It takes in the priority of the  task-object as a parameter.
 * @returns - It returns the html code for the given priority.
 */
function renderLargeTaskPrioDisplay(prio){
    if (prio === "low"){
        return `<td class="large-task-info-content">Low</td>`;
    }
    if (prio === "medium"){
        return `<td class="large-task-info-content">Medium</td>`;
    }
    if (prio === "urgent"){
        return `<td class="large-task-info-content">Urgent</td>`;
    }
}


/**
 * This function changes the status of a subtask from 'done' to 'todo' and vice versa. First it gets the index of the opened task, so that it can then be exchanged by a newly created task,
 * that is an exact copy of the opened task, only with an edited subtask-object, where the status of the clicked on subtask is changed.
 * 
 * @param {number} subtaskId - It takes in the id of the subtask the user clicked on as a parameter.
 */
async function switchSubtaskStatus(subtaskId) {
    let subtask = allTasks.find(task => task.subtasks.some(st => st.id === subtaskId)).subtasks.find(st => st.id === subtaskId);
    subtask.status = subtask.status === "todo" ? "done" : "todo";

    uploadEditedSubtask(subtask);
    updateTasks();
}



async function uploadEditedSubtask(subtask){
    try {
        await fetch(ST_URL + subtask.id + '/', {
            method: 'PUT',
            headers:{
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(subtask)
        })
    } catch (error) {
        console.error(error)
    }
}


/**
 * This function changes the checkbox-image, whenever it is clicked.
 * 
 * @param {HTMLImageElement} element - It takes in the clicked on image element as a parameter.
 */
function switchSubtaskCheckbox(element){
    if(element.src.includes("assets/img/notchecked.png")){
        element.src = "assets/img/checked.png";
    } else if (element.src.includes("assets/img/checked.png")){
        element.src = "assets/img/notchecked.png";
    }
}


/**
 * This function deletes the currently opened task from the local allTasks-array and then calls the updateTasks-function to update the tasks on the api-server. 
 * 
 * @param {number} id - It takes in the id of the opened task as a parameter.
 */
async function deleteTask(id){
    try {
        await fetch (BASE_URL + id + '/', {
            method:'DELETE',
            headers: {
                'Content-Type': 'application/json', 
            }
        })
    } catch (error) {
        console.error(error)
    }

    await updateTasks();
    hideTaskDisplayModal();
}


/**
 * This function changes the content of the task display modal to the edit-task-template.
 */
function displayEditTaskModal(){
    let taskDisplayModal = document.getElementById('task-display-modal');
    taskDisplayModal.innerHTML = getEditTaskTemplate(openedTask);
    document.getElementById('edit-task-modal').classList.add('show');

    displayContactsInEditTaskForm();
    displayContactsInEditTaskModal(openedTask.assignedTo);
    selectAssignedContact(openedTask.assignedTo);
    displayTaskPriority(openedTask.prio);
    displaySubtasksInEditTaskModal(openedTask.subtasks);
}


function selectAssignedContact(contact){
    let selectElement = document.getElementById("edit-assigned");
    for (let i = 0; i < selectElement.options.length; i++) {
        if(selectElement.options[i].value === contact){
            selectElement.options[i].selected = true;
            break;
        }
    }
}


/**
 * This function activates/checks the radio button according to the priority of the opened task in the edit-task-modal.
 * 
 * @param {string} prio - It takes in the priority of the opened task as a parameter.
 */
function displayTaskPriority(prio){
    let radioButton = document.querySelector(`input[name="prio-edit"][value="${prio}"]`);
    radioButton.checked = true;
}


/**
 * This function edits the opened task in that it creates a new task that replaces the opened task in the local allTasksArray.
 * 
 * @param {number} id - It takes in the id of the opened task as parameter.
 */
async function editTask(event){
    if(event){
        event.preventDefault();
    }
   
    let editedTask = createEditedTask(openedTask);
    await editSubtasks();
    
    try {
        await fetch(BASE_URL + openedTask.id + '/', {
            method:'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(editedTask)
        });
    } catch (error) {
        console.error(error)
    }

    hideEditTaskModal();
}


async function editSubtasks(){
    await deleteAllSubtasksForOpenedTask();
    await uploadSubtasks(openedTask.id)
}


async function deleteAllSubtasksForOpenedTask(){
    for (const subtask of openedTask.subtasks) {
        await deleteSubtaskOnEditing(subtask);
    }
}



async function deleteSubtaskOnEditing(subtask){
    try {
        await fetch(ST_URL + subtask.id + '/', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
        })
    } catch (error) {
        console.error(error)
    }
}

/**
 * This function creates a new task according to the changes made to the opened task in the edit-task-modal.
 * 
 * @param {Object} openedTask - It takes in the openedTask-object as a parameter. 
 * @returns - It returns a new object of the newly created/edited task-object.
 */
function createEditedTask(openedTask){
    let date = document.getElementById("edit-date");
    let description = document.getElementById("edit-description");
    let assignedTo = document.getElementById("edit-assigned");
    let title = document.getElementById("edit-title");
    let selectedPriority = getEditedPriority();
    // let subtaskValues = getSubtaskValues();
    let editedTask = null;

    if (title.value && date.value){
        editedTask = {
            "title": title ? title.value : "",  
            "date": date ? date.value : "",  
            "category": openedTask.category,  
            "prio": selectedPriority || "",  
            "description": description ? description.value : "", 
            "assignedTo": assignedTo ? assignedTo.value : "",  
            // "subtasks": subtaskValues || [],  
            "status": openedTask.status,
            "id": openedTask.id
        };
        return editedTask;
    } else {
        if (!title.value) {
            alert("Please fill in title.")
        }
        if (!date.value) {
           alert ("Please fill in date.")
        }
    }
}


/**
 * This function displays the contacts that are responsible for the opened task in the edit-task-modal.
 * 
 * @param {string} assignedContacts - It takes in the names of the assigned contacts as a parameter.
 */
function displayContactsInEditTaskModal(assignedContacts) {
    let assignedContactsDiv = document.getElementById("edit-task-assigned-contacts-display");
    if (typeof assignedContacts === 'string') {
        assignedContacts = [assignedContacts];
    }

    assignedContacts.forEach(contactName => {
        const assignedContactData = contacts.find(contact => contact.name === contactName);
        if (assignedContactData) {
            assignedContactsDiv.innerHTML += `
                <div class="edit-task-contact-logo" style="background-color: ${assignedContactData.color}">
                    ${assignedContactData.initials}
                </div>`;
        }
    });
}


/**
 * This function displays the subtasks of the opened task in the edit-task-modal. First it converts the subtasks-object into an array and then it loops
 * over the array to return the template for each subtask in it.
 * 
 * @param {Object} subtasks - It takes in the subtasks-object of the opened task as a parameter.
 */
function displaySubtasksInEditTaskModal(subtasks) {
    let subtaskList = document.getElementById("edit-task-subtasks-list");
    subtaskList.innerHTML = ''; 

    if (subtasks) {
        let currentSubtasks = Object.values(subtasks);
        for (let i = 0; i < currentSubtasks.length; i++) {
            const subtask = currentSubtasks[i];
            subtaskList.innerHTML += getSubtaskListItemTemplate(subtask);
        }
    }
}


/**This function displays all contacts in the edit-task-form. To achieve this it simply loops over the contacts-array. */
function displayContactsInEditTaskForm(){
    let contactsList = document.getElementById("edit-assigned");
        
    for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        contactsList.innerHTML += `<option value="${contact.name}">${contact.name}</option>`;
    }
}


/**
 * This function displays the subtasks of the currently opened task in the edit-task-form.
 */
function addSubtaskEditForm() {
    let input = document.getElementById("subtasks-edit").value;
    let subtasksList = document.getElementById("edit-task-subtasks-list");

    subtasksList.innerHTML += getNewSubtaskTemplate(input);
    document.getElementById("subtasks-edit").value = '';
}


/**
 * This function makes it possible to create a new task with a pre-defined status. To achieve this it simply set the globally defined variable
 * addTaskTastus to the status which is given into the function as a parameter, depending on which button on the board-page you clicked.
 * 
 * @param {string} status - It takes in a status as a parameter. Each column on the board has a different button that triggers this same function,
 * only with a different status as a parameter. For example, when you click on the button inside to 'Awaiting feedback' column, the status of 'awaiting feedback'
 * is given into the function as a parameter.
 */
function addTaskWithStatus(status){
    addTaskStatus = status;
    openAddTaskModal();
}


/**
 * This function performs a search whenever more than three letters are typed into the searchbar on the board-page. When there are less than three
 * letters typed in, all tasks will be displayed. To search for any given task, it uses the filter method on the allTasks-array and creates
 * a new array of searchedTasks that contains every task, which title or description matches the input. It then calls a function to sort the searched
 * tasks into the status-arrays, which then get displayed on the board page.
 * 
 * @param {string} input - It takes in the input of the searchbar on the board page as a parameter.
 */
function performSearch(input){
    if (input.trim().length >= 3){
        let searchedTasks = allTasks.filter(task =>
            task.title.toLowerCase().includes(input.toLowerCase()) ||
            task.description.toLowerCase().includes(input.toLowerCase())
        );
        sortSearchedTasks(searchedTasks);
        displayTasksInBoard();
    } else {
        sortTasks();
        displayTasksInBoard();
    }
}


/**
 * This function functions exactly as the sortTasks-function, but it only uses the searched for tasks and not every task in the allTasks-array.
 * 
 * @param {Array} tasks - It takes in the array of searchedTasks from the performSearch-function.
 */
function sortSearchedTasks(tasks){
    clearTaskArrays();
    if (tasks){
        tasks.forEach(task => {
            switch (task.status.toLowerCase()) {
                case 'todo':
                    tasksToDo.push(task);
                    break;
                case 'in_progress':
                    tasksInProgress.push(task);
                    break;
                case 'await_feedback':
                    tasksAwaiting.push(task);
                    break;
                case 'done':
                    tasksDone.push(task);
                    break;
                default:
                    console.log(`Unknown status: ${task.status}`);
            }
        });
    }
}