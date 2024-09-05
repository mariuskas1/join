function getTaskTemplate(task){
    const taskCategoryHTML = renderTaskCategoryDisplay(task.category);
    const taskContactsHTML = renderTaskContacts(task.assignedTo);
    const taskPrioHTML = renderTaskPrioDisplay(task.prio);
    const subtasksHTML = renderSubtaskDisplay(task.subtasks);

    return `
        <div class="board-task-div" draggable="true" ondragstart="startDragging(${task.id})" onclick="openTaskDisplayModal(${task.id})">
            ${taskCategoryHTML}
            <span class="board-task-title">${task.title}</span>
            <span class="board-task-description">${task.description}</span>
            ${subtasksHTML}
            <div class="board-task-bottom-div">
                <div class="board-task-contacts-div">
                    ${taskContactsHTML}
                </div>
                ${taskPrioHTML}
            </div>
        </div>
    `;
}


function getLargeTaskTemplate(task) {
    const taskCategoryHTML = renderLargeTaskCategoryDisplay(task.category);
    const taskContactsHTML = renderLargeTaskContactsDisplay(task.assignedTo);
    const taskPrioHTML = renderLargeTaskPrioDisplay(task.prio);

    return `
        <div class="task-display-large" onclick="event.stopPropagation()">
            <div class="large-task-display-header">
                ${taskCategoryHTML}
                <img src="assets/img/close.png" class="large-task-close-icon" onclick="hideTaskDisplayModal()">
            </div>
            <span class="large-task-title">${task.title}</span>
            <span class="large-task-description">${task.description}</span>
            
            <table class="large-task-info-table">
                <tr>
                    <td class="large-task-info-description">Due date:</td>
                    <td class="large-task-info-content">${task.date}</td>
                </tr>
                <tr>
                    <td class="large-task-info-description">Priority:</td>
                    ${taskPrioHTML}
                </tr>
            </table>

            <span class="large-task-info-description">Assigned To:</span>
            <div class="large-task-contacts-display">
                ${taskContactsHTML}
            </div>
            <span class="large-task-info-description">Subtasks</span>
            <div class="large-task-subtasks-display" id="large-task-subtasks-display">
            </div>
            <div class="large-task-display-footer">
                <button class="large-task-button" onclick="deleteTask(${task.id})">
                    <img class="task-footer-btn-icon" src="assets/img/delete.png"> Delete
                </button>
                <div class="large-task-btn-seperator"></div>
                <button class="large-task-button" onclick="displayEditTaskModal(${task.id})">
                    <img class="task-footer-btn-icon" src="assets/img/edit.png"> Edit
                </button>
            </div>
        </div>
    `;
}


function getEditTaskTemplate(openedTask){
    return `
         <div class="task-display-large" onclick="event.stopPropagation()">
         <div class="edit-task-display-header">
                    <img src="assets/img/close.png" class="large-task-close-icon" onclick="hideTaskDisplayModal()">
                </div>
            <div class="edit-task-content">
                
                <div class="edit-task-modal-body">
                    <div class="input">
                        <label for="title">Title</label>
                        <input type="text" class="edit-task-input" id="edit-title" value="${openedTask.title}" spellcheck="false">
                    </div>
                    <div class="input">
                        <label for="description">Description</label>
                        <textarea type="textarea" id="edit-description" value="${openedTask.description}" spellcheck="false">${openedTask.description}</textarea>
                    </div>
                    <div class="input">
                        <label for="date">Due date</label>
                        <input type="date" class="edit-task-input" id="edit-date" value="${openedTask.date}">
                    </div>
                    <div class="input">
                        <span>Prio</span>
                        <div class="prio-btns">
                            <div class="input-container">
                                <input type="radio" id="urgent" name="prio-edit" value="urgent">
                                <div class="radio-tile" id="urgent-tile">
                                    <label for="urgent">Urgent</label>
                                    <img src="assets/img/urgent.png">
                                </div>
                            </div>
                            <div class="input-container">
                                <input type="radio" id="medium" name="prio-edit" value="medium">
                                <div class="radio-tile" id="medium-tile">
                                    <label for="urgent">Medium</label>
                                    <img src="assets/img/medium.png" id="medium-img">
                                </div>
                            </div>
                            <div class="input-container">
                                <input type="radio" id="low" name="prio-edit" value="low">
                                <div class="radio-tile" id="low-tile">
                                    <label for="urgent">Low</label>
                                    <img src="assets/img/low.png">
                                </div>
                            </div>
                        </div>
                        <div class="input">
                            <label for="assigned">Assigned to</label>
                            <select id="edit-assigned">
                                <option value="" disabled selected>Select contacts to assign</option>
                            </select>
                        </div>   
                        <div class="edit-task-assigned-contacts-display" id="edit-task-assigned-contacts-display"></div>
                        <div class="input" id="subtasks-input">
                            <label for="subtasks">Subtasks</label>
                            <div class="subtask-input-container">
                                <input type="text" name="subtasks" id="subtasks-edit" placeholder="Add new subtask" spellcheck="false">
                                <img class="add-subtask-icon" src="assets/img/add.png" onclick="addSubtaskEditForm()">
                            </div>
                            <ul id="edit-task-subtasks-list">                              
                            </ul>
                        </div>                   
                </div>
                <div class="edit-task-modal-footer">
                    <button class="edit-task-btn" onclick="editTask(${openedTask.id})">Ok <img src="assets/img/check_white.png"></button>
                </div>
            </div>
        </div>
    `;
}