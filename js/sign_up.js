

let checkbox = document.getElementById("policy");
let signUpBtn = document.getElementById("sign-up-btn-2");

checkbox.addEventListener("change", function(){
    signUpBtn.disabled = !this.checked; 
})


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


const BASE_URL = "https://join-4544d-default-rtdb.europe-west1.firebasedatabase.app";


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