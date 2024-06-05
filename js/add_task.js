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


function createTask(){
    const form = document.getElementById("add-task-form");
    const title = document.getElementById("title").value.trim();
    const date = document.getElementById("date").value.trim();
    const category = document.getElementById("category").value.trim();

    if (title && date && category ) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        console.log(data);
    
        alert('Form submitted successfully!');
        form.reset();
    }     
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
            <span class="subtask-content">${input}</span> 
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
