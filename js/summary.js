let currentUser;
let currentUserTasks;
const BASE_URL = "https://join-4544d-default-rtdb.europe-west1.firebasedatabase.app";


document.addEventListener("DOMContentLoaded", async function(){
    await getCurrentUserData(); 
    displayGreeting();
    displayUserInitials();
    setTimeout(activateLink, 100);
    setTimeout(hideGreeting, 2000);
});


async function getCurrentUserData(){
    let response = await fetch(BASE_URL + "/allUsers/currentUser.json")
    let responseToJson = await response.json();
    let userData = Object.values(responseToJson)[0];
    currentUser = userData.name;
    await getCurrentUserTasks();
}


async function getCurrentUserTasks(){
    try {
        let response = await fetch(BASE_URL + "/allTasks/" + currentUser.trim() + ".json")

        if (!response.ok) {
            throw new Error("Network response was not ok")
        }

        let data = await response.json();
        if (!data || data.length === 0) {
            displayZeroTasks();
        } else {
            currentUserTasks = data;
            displayTaskInfos();
        }

    } catch (error) {
        console.error("Failed to fetch tasks:", error);
        displayZeroTasks();
    }
}


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


function displayTaskInfos(){
    let numberOfTasks = Object.keys(currentUserTasks).length;
    let numberOfUrgentTasks = Object.values(currentUserTasks).filter(task => task.prio === "urgent").length;
    let numberOfTasksTodo = Object.values(currentUserTasks).filter(task => task.status === "todo").length;
    let numberOfTasksDone = Object.values(currentUserTasks).filter(task => task.status === "done").length;
    let numberOfTasksInProgress = Object.values(currentUserTasks).filter(task => task.status === "inprogress").length;
    let numberOfTasksAwaitingFeedback = Object.values(currentUserTasks).filter(task => task.status === "awaiting").length;

    document.getElementById("tasks-in-board").innerHTML = numberOfTasks;
    document.getElementById("tasks-urgent").innerHTML = numberOfUrgentTasks;
    document.getElementById("tasks-to-do").innerHTML = numberOfTasksTodo;
    document.getElementById("tasks-done").innerHTML = numberOfTasksDone;
    document.getElementById("tasks-in-progress").innerHTML = numberOfTasksInProgress;
    document.getElementById("tasks-awaiting-feedback").innerHTML = numberOfTasksAwaitingFeedback;

    let closestDeadline = getClosestDeadline();
    document.getElementById("urgent-task-date").innerHTML = closestDeadline;
}


function getClosestDeadline(){
    let urgentTasks = Object.values(currentUserTasks).filter(task => task.prio === "urgent");
    let urgentTaskDates = urgentTasks.map(task => new Date(task.date));

    if (urgentTaskDates.length === 0) {
        return "-";  
    }

    let currentDate = new Date();
    let closestDeadline = urgentTaskDates.reduce((closest, date) => {
    return (Math.abs(date - currentDate) < Math.abs(closest - currentDate)) ? date : closest;
    });

    let options = { year: 'numeric', month: 'long', day: 'numeric' };
    let formattedClosestDeadline = closestDeadline.toLocaleDateString('en-US', options);

    return formattedClosestDeadline;
}


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


function displayUserName(){
    let greetingName = document.getElementById("greeting-name");
    let greetingNameMobile = document.getElementById("greeting-name-mobile");
    let greetingTime = document.getElementById("greeting-daytime");

    if(currentUser) {
        greetingName.innerHTML = currentUser;
        greetingNameMobile.innerHTML = currentUser;
    } else {
        greetingTime.innerHTML.slice(0, -1) + '!';
    }
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


function hideGreeting(){
    document.getElementById("mobile-summary-greeting").style.opacity = 0;
}