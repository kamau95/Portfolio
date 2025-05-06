import { displayError } from './shared.js';

//handle signup here
//listen for an event and get user input send to server and return result or response to the user
document.getElementById("signup-form").addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const firstname = document.getElementById("firstname").value;
    const surname = document.getElementById("surname").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    //send data to the backend
    try{
        const response= await fetch('/signup', {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({firstname, surname, email, password}),
        })
        const result= response.json();
        if (result.success){
            //handle success
            window.location.href= result.redirect;
        }else{
            //handle validation or server errors
            const errorMessage= result.message || 'signup failed';
            displayError(errorMessage, result.errors);
        }
    }catch(error){
        // Handle network or parsing errors
        console.error("Fetch error:", error);
        displayError("An error ocurred. Please try again.");
    }
});