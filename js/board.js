const BASE_URL = "https://join-4544d-default-rtdb.europe-west1.firebasedatabase.app";
let currentUser;
let currentUserData;
let currentUserTasks;
let tasksToDo = [];
let tasksInProgress = [];
let tasksAwaiting = [];
let tasksDone = [];
let contacts = [];
let openedTask;

let currentDraggedElement;
let addTaskStatus;


document.addEventListener("DOMContentLoaded", async function(){
    setTimeout(activateLink, 100);
    await getCurrentUserData();
    setTimeout(displayUserInitials, 40);
    await loadContacts();
    await getCurrentUserTasks();
    changeCreateTaskFunction();
});


function changeCreateTaskFunction(){
    document.getElementById("create-task-btn").onclick = function(event){
        createTaskOnBoard(event);
    }
}


async function createTaskOnBoard(event){
    await uploadNewTask(event);
    hideAddTaskModal();
    await getCurrentUserTasks();
    sortTasks();
    displayTasksInBoard();
}


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



function openAddTaskModal(){
    document.getElementById('add-task-modal').classList.remove('display-none');
    displayContactsInForm();
}

function hideAddTaskModal(){
    document.getElementById('add-task-modal').classList.add('display-none');
}



async function getCurrentUserTasks(){
    try {
        let response = await fetch(BASE_URL + "/allTasks/" + currentUser.trim() + ".json")

        if (!response.ok) {
            throw new Error("Network response was not ok")
        }

        let data = await response.json();
        if (!data || data.length === 0) {
           displayTasksInBoard();
        } else {
            currentUserTasks = Object.values(data);
            sortTasks();
            displayTasksInBoard();
        }

    } catch (error) {
        console.error("Failed to fetch tasks:", error);
    }
}


function sortTasks(){
    clearTaskArrays();
    if (currentUserTasks){
        currentUserTasks.forEach(task => {
            switch (task.status.toLowerCase()) {
                case 'todo':
                    tasksToDo.push(task);
                    break;
                case 'in progress':
                    tasksInProgress.push(task);
                    break;
                case 'await feedback':
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


function clearTaskArrays(){
    tasksToDo = [];
    tasksInProgress = [];
    tasksAwaiting = [];
    tasksDone = [];
}


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


function renderTaskCategoryDisplay(category){
    if (category === "User Story"){
        return `<span class="board-task-category-div" id="board-task-category-us">User Story</span>`;
    }
    if (category === "Technical Task"){
        return `<span class="board-task-category-div" id="board-task-category-tt">Technical Task</span>`;
    }
}


function renderSubtaskDisplay(subtasks){ 
    if(subtasks){
        let subtasksArray = Object.values(subtasks);
        let allSubtasks = subtasksArray.length;
        let subtasksDone = subtasksArray.filter(subtask => subtask.status === "done").length;
        let subtasksDoneInPercent = (subtasksDone / allSubtasks) * 100;

          
        return `
            <div class="board-task-subtasks-display">
                    <div class="board-subtasks-bar-container">
                            <div class="board-subtasks-bar" style="width: ${subtasksDoneInPercent}%"></div>
                    </div>
                    <span class="board-subtasks-display">${subtasksDone}/${allSubtasks} Subtasks</span>
            </div>
        
        `
    }
    else {
        return ``;
    }

}


function startDragging(id){
    currentDraggedElement = id;
}


function allowDrop(ev) {
    ev.preventDefault();
  }


async function moveTo(status){
    const task = currentUserTasks.find(task => task.id === currentDraggedElement.toString());
    task.status = status;
    removeHighlightClassAll();
    await updateTasks();
}


async function updateTasks(){
    clearTaskArrays();
    await deleteTasksOnServer();
    await uploadTasksOnServer();
    await getCurrentUserTasks();
}


async function deleteTasksOnServer(){
    let response = await fetch(BASE_URL + "/allTasks/" + currentUser + ".json",{
        method: "DELETE",
    });
    return responseToJson = await response.json();
}


async function uploadTasksOnServer(){
    for (let i = 0; i < currentUserTasks.length; i++) {
        const task = currentUserTasks[i];
        let existingTask = {
           "title": task.title,
            "date": task.date,
            "category": task.category,
            "prio": task.prio,
            "description": task.description,
            "assignedTo": task.assignedTo,
            "subtasks": task.subtasks,
            "status" : task.status,
            "id": task.id
        }
        await postData("/allTasks/" + currentUser.trim(), existingTask);
    }
}


function highlight(id){
    document.getElementById(id).classList.add('drag-area-highlight');
}


function removeHighlight(id){
    document.getElementById(id).classList.remove('drag-area-highlight');
}


function removeHighlightClassAll(){
    const columns = document.querySelectorAll('.board-column-body');
    columns.forEach(column => {
        column.classList.remove('drag-area-highlight');
    });
}


function openTaskDisplayModal(id){
    openedTask = currentUserTasks.find(task => task.id === id.toString());
    let taskDisplayModal = document.getElementById('task-display-modal');

    taskDisplayModal.classList.remove('display-none');
    taskDisplayModal.innerHTML = getLargeTaskTemplate(openedTask);
    renderLargeTaskSubtasksDisplay(openedTask.subtasks);
}


function hideTaskDisplayModal(){
    document.getElementById('task-display-modal').classList.add('display-none');
    updateTasks();
}


function renderLargeTaskCategoryDisplay(category){
    if (category === "User Story"){
        return `<div class="large-task-category" id="board-task-category-us">User Story</div>`
    }
    if (category === "Technical Task"){
        return `<div class="large-task-category" id="board-task-category-tt">Technical Task</div>`
    }
}


function renderLargeTaskContactsDisplay(assignedContacts){
    if(typeof assignedContacts === 'string'){
        assignedContacts = [assignedContacts];
    }
    
    return assignedContacts.map(contactName => {
        const assignedContactData = contacts.find(contact => contact.name === contactName);
        
        if(assignedContactData) {
            return `
                    <div class="large-task-contact-div">
                        <div class="large-task-contact-initials" style="background-color: ${assignedContactData.color}">${assignedContactData.initials}</div>
                        <span class="large-task-contact-name">${assignedContactData.name}</span>
                    </div>
            `;
        } else {
            return `<div class="large-task-contact-div">
                        <div class="large-task-contact-initials" style="opacity:0"> - </div>
                        <span class="large-task-contact-name">-</span>
                    </div>`;
        }
    })
}


function renderLargeTaskSubtasksDisplay(subtasks){
    let largeTaskSubtaskDisplay = document.getElementById("large-task-subtasks-display");

    if(subtasks){
        let subtasksArray = Object.values(subtasks);

        for (let i = 0; i < subtasksArray.length; i++) {
            const subtask = subtasksArray[i];
            
            if (subtask.status === "todo"){
                largeTaskSubtaskDisplay.innerHTML += `
                    <div class="large-task-subtask-div">
                        <img src="assets/img/notchecked.png" class="subtask-checkbox" onclick="switchSubtaskStatus(${subtask.id}); switchSubtaskCheckbox(this);">
                        <span class="large-task-subtaks-name">${subtask.name}</span>
                    </div>
                `;
            }

            if (subtask.status === "done"){
                largeTaskSubtaskDisplay.innerHTML += `
                    <div class="large-task-subtask-div">
                        <img src="assets/img/checked.png" class="subtask-checkbox" onclick="switchSubtaskStatus(${subtask.id}); switchSubtaskCheckbox(this);">
                        <span class="large-task-subtaks-name">${subtask.name}</span>
                    </div>
                `;
            }
        }
    }
}


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


function switchSubtaskStatus(subtaskID) {
    let openedTaskIndex = currentUserTasks.findIndex(task => task.id === openedTask.id.toString());
    let editedTask = createNewTaskWithEditedSubtaskStatus(subtaskID);
    
    currentUserTasks[openedTaskIndex] = editedTask;
    updateTasks();
    
}


function createNewTaskWithEditedSubtaskStatus(subtaskID){
    let newTask = JSON.parse(JSON.stringify(openedTask)); 

    for(let key in newTask.subtasks){
        let subtask = newTask.subtasks[key];
        
        if(subtask.id === subtaskID.toString()){
            subtask.status = subtask.status === "todo" ? "done" : "todo";
            break;
        } 
    }

    return newTask;
}



function switchSubtaskCheckbox(element){
    if(element.src.includes("assets/img/notchecked.png")){
        element.src = "assets/img/checked.png";
    } else if (element.src.includes("assets/img/checked.png")){
        element.src = "assets/img/notchecked.png";
    }
}




async function deleteTask(id){
    const taskIndex = currentUserTasks.findIndex(task => task.id === id.toString());
    currentUserTasks.splice(taskIndex, 1);
    clearTaskArrays();
    await updateTasks();
    hideTaskDisplayModal();
}


function displayEditTaskModal(){
    
    let taskDisplayModal = document.getElementById('task-display-modal');

    taskDisplayModal.innerHTML = getEditTaskTemplate(openedTask);

    displayContactsInEditTaskForm();
    displayContactsInEditTaskModal(openedTask.assignedTo);
    displayTaskPriority(openedTask.prio);
    displaySubtasksInEditTaskModal(openedTask.subtasks);
}


function displayTaskPriority(prio){
    let radioButton = document.querySelector(`input[name="prio-edit"][value="${prio}"]`);
    radioButton.checked = true;
}


function editTask(id){
    let openedTaskIndex = currentUserTasks.findIndex(task => task.id === id.toString());
    let editedTask = createEditedTask(openedTask);
    
    currentUserTasks[openedTaskIndex] = editedTask;
    clearTaskArrays();
    hideTaskDisplayModal();
}


function createEditedTask(openedTask){
    let date = document.getElementById("edit-date");
    let description = document.getElementById("edit-description");
    let assignedTo = document.getElementById("edit-assigned");
    let title = document.getElementById("edit-title");

    let selectedPriority = getEditedPriority();
    let subtaskValues = getSubtaskValues();
    let editedTask = null;


    if (title.value && date.value){
        editedTask = {
            "title": title ? title.value : "",  
            "date": date ? date.value : "",  
            "category": openedTask.category,  
            "prio": selectedPriority || "",  
            "description": description ? description.value : "", 
            "assignedTo": assignedTo ? assignedTo.value : "",  
            "subtasks": subtaskValues || [],  
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



function displaySubtasksInEditTaskModal(subtasks){
    let subtaskList = document.getElementById("edit-task-subtasks-list");
    
    if(subtasks){
        let currentSubtasks = Object.values(subtasks);

        for (let i = 0; i < currentSubtasks.length; i++) {
            const subtask = currentSubtasks[i];
            
            subtaskList.innerHTML += `
                <li>
                    <img class="bullet-point" src="assets/img/circle-solid.svg" >
                    <input type="text" class="subtask-input bg-white" name="subtask-input" value="${subtask.name}" disabled spellcheck="false">
                    <div class="subtask-icons">
                        <img class="subtask-icon" onclick="editSubtask(this)" src="assets/img/edit.png">
                        <img class="subtask-icon" onclick="deleteSubtask(this)" src="assets/img/delete.png">
                    </div>
                </li>          
            `;
        }
    }
    
}


function displayContactsInEditTaskForm(){
    let contactsList = document.getElementById("edit-assigned");
        
    for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        contactsList.innerHTML += `<option value="${contact.name}">${contact.name}</option>`;
    }
}


function addSubtaskEditForm(){
    let input = document.getElementById("subtasks-edit").value;
    let subtasksList = document.getElementById("edit-task-subtasks-list");

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

    document.getElementById("subtasks-edit").value = '';
}


function addTaskWithStatus(status){
    addTaskStatus = status;
    openAddTaskModal();
}


function performSearch(input){
    if (input.trim().length >= 3){
        let searchedTasks = currentUserTasks.filter(task =>
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


function sortSearchedTasks(tasks){
    clearTaskArrays();
    if (tasks){
        tasks.forEach(task => {
            switch (task.status.toLowerCase()) {
                case 'todo':
                    tasksToDo.push(task);
                    break;
                case 'in progress':
                    tasksInProgress.push(task);
                    break;
                case 'await feedback':
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