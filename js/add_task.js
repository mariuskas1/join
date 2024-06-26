



document.addEventListener("DOMContentLoaded", function(){
    setTimeout(activateLink, 100);
});


function activateLink(){
    let addTaskDivs = document.querySelectorAll(".add-task-div");
    
    addTaskDivs.forEach(function(addTaskDiv) {
        addTaskDiv.classList.add("active-link");

        let images = addTaskDiv.querySelectorAll("img");
        images.forEach(function(img){
            img.src = "assets/img/edit_square1.png"
        });
    });
}


function clearForm(){
    const form = document.getElementById("add-task-form");
    form.reset();
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




async function uploadNewTask(event){  
    let form = document.getElementById("add-task-form");
    event.preventDefault();
    let newTask = createNewTask();
    if (newTask){
        await postData("/allTasks", newTask);
        form.reset();
        document.getElementById("subtasks-list").innerHTML = '';
    } else {
        console.log("Failed to create a new task. Please check the form inputs.");
    }
}     



function createNewTask(){
    let date = document.getElementById("date");
    let category = document.getElementById("category");
    let description = document.getElementById("description");
    let assignedTo = document.getElementById("assigned");
    let title = document.getElementById("title");

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
            "subtasks": subtaskValues
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


function hideRequiredLabels(){
    document.querySelectorAll(".required-label").forEach(label => {
        label.style.opacity = 0;
    });
}


function getSelectedPriority() {
    let selectedPriority = document.querySelector('input[name="prio"]:checked').value;
    return selectedPriority;
}


function getSubtaskValues(){
    let subtaskValues = {};
    let subtasks = document.querySelectorAll(".subtask-input");
    if (subtasks.length > 0) {
        subtasks.forEach((input, index) => {
            subtaskValues[`input${index}`] = input.value;
        });
    }
    return subtaskValues;
}


const BASE_URL = "https://join-4544d-default-rtdb.europe-west1.firebasedatabase.app";


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