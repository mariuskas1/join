const BASE_URL = "https://join1-29d52-default-rtdb.europe-west1.firebasedatabase.app/";
let currentUser;
let contacts = [];
let addTaskStatus;


/**
 * This function is used to call several other functions after the DOM-content is loaded.
 */
document.addEventListener("DOMContentLoaded", async function(){
    setTimeout(activateLink, 100);
    await getCurrentUserData();
    setTimeout(displayUserInitials, 200);
    await loadContacts();
    setTimeout(displayContactsInForm, 300);
});


/**
 * This function activates the link to the 'Add Task' page in the menu on the left side, so that it is clear to the user, that he or she already is on the 'Add Task' page.
 */
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


/**
 * This function clears the add-task-form.
 */
function clearForm(){
    const form = document.getElementById("add-task-form");
    form.reset();
}


/**
 * This function deletes the subtask from the add-task-form.
 * 
 * @param {HTMLElement} element - It takes in the html element the user clicked on as a parameter.
 */
function deleteSubtask(element){
    let subtask = element.closest('li');
    subtask.remove();
}


/**
 * This function enables the input-element every subtask-element consists of, so that it can be edited.
 * 
 * @param {HTMLElement} element - It takes in the html element the user clicked on as a parameter.
 */
function editSubtask(element) {
    let listElement = element.closest('li');
    let subtaskInput = listElement.querySelector('input');
    subtaskInput.removeAttribute('disabled');
    subtaskInput.focus();
}
 


/**
 * This function hide the 'required'-labels for the required input-elements.
 */
function hideRequiredLabels(){
    document.querySelectorAll(".required-label").forEach(label => {
        label.style.opacity = 0;
    });
}


/**
 * This function retrieves the selected priority for the task from the form.
 * 
 * @returns - It returns the selected priority.
 */
function getSelectedPriority() {
    let selectedPriority = document.querySelector('input[name="prio"]:checked').value;
    return selectedPriority;
}


/**
 * This function retrieves the subtask-names from the form.
 * 
 * @returns - It returns the values of the subtask-input-elements.
 */
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


