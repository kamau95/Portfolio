//this handles the navigation and sidebar
function showSidebar() {
  const sidebar = document.querySelector(".sidebar");
  sidebar.style.display = "flex";
}

function hideSidebar() {
  const sidebar = document.querySelector(".sidebar");
  sidebar.style.display = "none";
}
//handle signup here
//listen for an event and get user input send to server and return result or response to the user
document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("firstname").value;
  const surname = document.getElementById("surname").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  //send data to the backend
  const response = await fetch("http://localhost:3000/signup", {
    method: 'POST',
    headers: {"content-type":'application/json'},
    body: JSON.stringify({username, surname, email, password}),
  });
  const result =await response.json();
});

//handle login here
document.getElementById('login-form').addEventListener("submit", async (e)=>{
  e.preventDefault();
  
  const email= document.getElementById('email').value;
  const password= document.getElementById('password').value;

  //send to backend
  const response= fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: {"content-type": 'application/json'},
    body: JSON.stringify({email, password}),
  });
  const loginResult= (await response).json();
})

