const BASE_URL = "https://join-4544d-default-rtdb.europe-west1.firebasedatabase.app";


let checkbox = document.getElementById("policy");
let signUpBtn = document.getElementById("sign-up-btn-2");


/**
 * This function enables the sign-up-button if the user agreed to the policy terms by checking the respecting box, so that the user
 * can only log-in if he accepts the terms.
 */
checkbox.addEventListener("change", function(){
    signUpBtn.disabled = !this.checked; 
})


/**
 * This function handles the click event on the sign-up button. It checks if the entered data is correct and if yes, calls the other
 * necessary function to create a new user-object and load it to the api-server.
 */
async function signUp(){
    let passwordOne = document.getElementById("password").value;
    let passwordTwo = document.getElementById("password2").value;

    if (passwordOne !== passwordTwo) {
        alert("Passwords do not match!");
    } else {
        signUpBtn.disabled = true;
        let newUser = createNewUser();
        await postUserData("/allUsers", newUser);

        window.location.href = "index.html?msg=You signed up successfully";
    }
}


/**
 * This function creates a new user-object with the data the user has typed in into the relevannt input-fields.
 * 
 * @returns - It returns the newly created user-object.
 */
function createNewUser(){
    let name = document.getElementById("name");
    let email = document.getElementById("email");
    let password = document.getElementById("password");

    newUser = {
        "name": name.value,
        "email": email.value,
        "password": password.value
    }
    return newUser;
}


/**
 * This function posts the user-object to the api-server.
 * 
 * @param {string} path - It takes in an addition to the BASE_URL as a parameter.
 * @param {object} data - It also takes in the user-object as a parameter.
 * @returns 
 */
async function postUserData(path="", data={}){
    let response = await fetch(BASE_URL + path + ".json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });
    return await response.json();
}