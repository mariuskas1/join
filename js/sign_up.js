const BASE_URL = "https://marius-kasparek.developerakademie.org/join_server/api/register/";


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
    let email = document.getElementById("email").value;
    let name = document.getElementById("name").value;

    signUpBtn.disabled = true;

    if(passwordOne !== passwordTwo){
        displayFailedSignUpMessage();
        signUpBtn.disabled = false;
    } else {
        try {
            let response = await fetch(BASE_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    username: email,
                    first_name: name,
                    password: passwordOne,
                    repeated_password: passwordTwo,
                }),
            });
    
            await checkSignUpResponse(response);
        } catch (error) {
            console.error(error);
            signUpBtn.disabled = false;
        }
    }
}


function displayFailedSignUpMessage(){
    document.getElementById("log-in-msg").classList.add("show");
    setTimeout(function() {
        document.getElementById("log-in-msg").classList.remove("show");
    }, 2000); 
}


/**
 * This function checks the sign-up response from the backend. If the response is ok it displays a sign-up modal and redirects the user to the login page.
 * 
 * @param {*} response - It takes in the response from the server as a parameter.
 * @returns 
 */
async function checkSignUpResponse(response){
    if (!response.ok) {
        let errorData = await response.json();
        console.error(errorData)
        signUpBtn.disabled = false;
        return;
    } else {
        let data = await response.json();
        displaySignedUpModal();
        signUpBtn.disabled = false;

        setTimeout(function () {
            window.location.href = "index.html?msg=You signed up successfully";
        }, 1000);
    }
    
}


/**
 * This function displays the "signed up successfully"-mesage.
 */
function displaySignedUpModal(){
    let modalBG = document.getElementById("sign-up-modal-bg");
    let modal = document.getElementById("sign-up-modal");

    modalBG.classList.remove("d-none");
    modal.classList.add("show");
}


