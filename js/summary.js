let currentUser;
let allTasks;
const BASE_URL = "https://join1-29d52-default-rtdb.europe-west1.firebasedatabase.app";


/**
 * This function is used to call several other functions after the DOM-content is loaded.
 */
document.addEventListener("DOMContentLoaded", async function(){
    getCurrentUserData(); 
    await getAllTasks();
    displayGreeting();
    setTimeout(displayUserInitials, 200);
    setTimeout(activateLink, 100);
    setTimeout(hideGreeting, 2000);
});



/**
 * This function loads all the tasks of the current user from the server and saves them in the local currenUserTasks-array. 
 * It then calls the functions to display the basic infos for all tasks on the summary page.
 */
async function getAllTasks(){
    try {
        let response = await fetch(BASE_URL + "/allTasks/" + ".json")
        if (!response.ok) {
            throw new Error("Network response was not ok")
        }

        let data = await response.json();
        if (!data || data.length === 0) {
            displayZeroTasks();
        } else {
            allTasks = data;
            displayTaskInfos();
        }
    } catch (error) {
        console.error("Failed to fetch tasks:", error);
        displayZeroTasks();
    }
}


/**
 * This function is called, when there are no tasks for the current user account. It displays the infor on the summary page, that there are no tasks, no upcoming deadlines etc.
 */
function displayZeroTasks(){
    document.getElementById("tasks-to-do").innerHTML = 0;
    document.getElementById("tasks-done").innerHTML = 0;
    document.getElementById("tasks-urgent").innerHTML = 0;
    document.getElementById("urgent-task-date").innerHTML = "-";
    document.getElementById("urgent-task-subtitle").innerHTML = "No upcoming deadline";
    document.getElementById("tasks-in-board").innerHTML = 0;
    document.getElementById("tasks-in-progress").innerHTML = 0;
    document.getElementById("tasks-awaiting-feedback").innerHTML = 0;
}



/**
 * This function displays the basic task infos on the summary page, according to the data stored in the allTasks-array.
 * To achieve this it creates new arrays for the number of tasks 'todo' etc and then checks their length.
 */
function displayTaskInfos(){
    let numberOfTasks = Object.keys(allTasks).length;
    let numberOfUrgentTasks = Object.values(allTasks).filter(task => task.prio === "urgent").length;
    let numberOfTasksTodo = Object.values(allTasks).filter(task => task.status === "todo").length;
    let numberOfTasksDone = Object.values(allTasks).filter(task => task.status === "done").length;
    let numberOfTasksInProgress = Object.values(allTasks).filter(task => task.status === "in progress").length;
    let numberOfTasksAwaitingFeedback = Object.values(allTasks).filter(task => task.status === "await feedback").length;

    document.getElementById("tasks-in-board").innerHTML = numberOfTasks;
    document.getElementById("tasks-urgent").innerHTML = numberOfUrgentTasks;
    document.getElementById("tasks-to-do").innerHTML = numberOfTasksTodo;
    document.getElementById("tasks-done").innerHTML = numberOfTasksDone;
    document.getElementById("tasks-in-progress").innerHTML = numberOfTasksInProgress;
    document.getElementById("tasks-awaiting-feedback").innerHTML = numberOfTasksAwaitingFeedback;

    let closestDeadline = getClosestDeadline();
    document.getElementById("urgent-task-date").innerHTML = closestDeadline;
}


/**
 * This function calculates the closest deadline from all tasks in the allTasks array.
 * 
 * @returns - It returns the closest deadline of all tasks, formatted like this 'September 12, 2024'.
 */
function getClosestDeadline(){
    let taskDates = Object.values(allTasks).map(task => new Date(task.date));

    let currentDate = new Date();
    let closestDeadline = taskDates.reduce((closest, date) => {
    return (Math.abs(date - currentDate) < Math.abs(closest - currentDate)) ? date : closest;
    });

    let options = { year: 'numeric', month: 'long', day: 'numeric' };
    let formattedClosestDeadline = closestDeadline.toLocaleDateString('en-US', options);

    return formattedClosestDeadline;
}


/**
 * This function displays a personal greeting for the user, depending on the time of the day.
 */
function displayGreeting(){
    let greetingTime = document.getElementById("greeting-daytime");
    let greetingTimeMobile = document.getElementById("greeting-daytime-mobile")
    let currentHour = new Date().getHours();

    if (currentHour < 12) {
        greetingTime.innerHTML = "Good morning,";
        greetingTimeMobile.innerHTML = "Good morning,";
    }
    else if (currentHour < 18) {
        greetingTime.innerHTML = "Good afternoon,";
        greetingTimeMobile.innerHTML = "Good afternoon,";
    }
    else {
        greetingTime.innerHTML = "Good evening,";
        greetingTimeMobile.innerHTML = "Good evening,";
    };

    displayUserName();
}


/**
 * This function displays the name of the user for the personal greeting. It displays a simple exclamation mark instead if there is no current user
 * data available, that is, if the current user is logged in with the guest account.
 */
function displayUserName(){
    let greetingName = document.getElementById("greeting-name");
    let greetingNameMobile = document.getElementById("greeting-name-mobile");
    let greetingTime = document.getElementById("greeting-daytime");
    let greetingTimeMobile = document.getElementById("greeting-daytime-mobile");

    if(currentUser) {
        greetingName.innerHTML = currentUser;
        greetingNameMobile.innerHTML = currentUser;
    } else {
        greetingTime.innerHTML = greetingTime.innerHTML.slice(0, -1) + `!`;
        greetingTimeMobile.innerHTML = greetingTime.innerHTML.slice(0, -1) + `!`;
    }
}


/**
 * This function activates the link to the 'Summary' page in the menu on the left side, so that it is clear to the user, that he or she already is on the 'Summary' page.
 */
function activateLink(){
    let summaryDivs = document.querySelectorAll(".summary-div");
    
    summaryDivs.forEach(function(summaryDiv) {
        summaryDiv.classList.add("active-link");

        let images = summaryDiv.querySelectorAll("img");
        images.forEach(function(img){
            img.src = "assets/img/summary1.png"
        });
    });
}


/**
 * This function hides the greeting.
 */
function hideGreeting(){
    document.getElementById("mobile-summary-greeting").style.display = "none";
}