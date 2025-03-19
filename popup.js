document.getElementById("inject").addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"]
        });
    }
});





let apiKey=null;
let selectedUserId=-1;
let company=null;
let apiemail=null;
let apipassword=null;

myInitialize();
function myInitialize(){

    if(localStorage.getItem("latestlogin")!=null){
        let latestlogin = localStorage.getItem("latestlogin");
        apiemail=latestlogin;
        let latestapikey=JSON.parse(localStorage.getItem(latestlogin));
        apiKey=latestapikey.apikey;
    }
    if(apiKey==null || apiKey === undefined){
        addLoginForm();
    }else{
        addPopupToBody();
    }
}

function Logout(){
    localStorage.removeItem("latestlogin");
    localStorage.removeItem(apiemail);
    apiKey=null;
    apiemail=null;
    apipassword=null;
    const popupContainer = document.querySelector(".popup-container");
    popupContainer.remove();
    addLoginForm();
}


async function login() {
    // if(localStorage.getItem("latestlogin")!=null){
    //     let latestlogin = localStorage.getItem("latestlogin");
    //     let latestapikey=JSON.parse(localStorage.getItem(latestlogin));
    //     alert("Api key is : "+latestapikey.apikey);
    // }
    apiemail = document.getElementById("apiemail").value;
    apipassword = document.getElementById("apipassword").value;
    
    if (!apiemail || !apipassword) {
        alert("Please enter email and password.");
        return;
    }
    try {
        const response = await fetch("https://api-qa.sling-dev.com/v1/users/login", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ "email":apiemail, "password":apipassword })
        });

        if (!response.ok) {
            throw new Error("Login failed. Check your credentials.");
        }

        let myKylasApiKey = localStorage.getItem(apiemail);
        if (myKylasApiKey) {
        try {
            myKylasApiKey = JSON.parse(myKylasApiKey);
            apikey=myKylasApiKey.apikey;
            document.getElementById("myloginContainer").remove();
            addPopupToBody();
            //alert("Api Key Exists " + myKylasApiKey.email);
            return;
        } catch (error) {
            console.error("Error parsing JSON from localStorage:", error);
            localStorage.removeItem(apiemail); // Remove corrupt data
        }
    }


        const data = await response.json(); // Get JSON response
        const token = data.token; // Extract JWT token
        console.log("Here:- "+token)
        if (!token) {
            throw new Error("Token not found in response.");
        }

        // Decode JWT and extract apiaccessToken
        const apiaccessToken = "Bearer "+getapiAccessToken(token);

        await getApiKey(apiaccessToken);
        document.getElementById("myloginContainer").remove();
        addPopupToBody();
        ///alert(apiaccessToken); // Show access token in alert

    } catch (error) {
        alert("Error: " + error.message);
    }
}

async function getApiKey(apiaccessToken){

    const response = await fetch("https://api-qa.sling-dev.com/v1/api-keys/kylas-app-key", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization":apiaccessToken
            }
        });
        if (!response.ok) {
            throw new Error("Login failed.");
        }

        const data = await response.json(); // Get JSON response
        apikey = data.apiKey; // Extract JWT token

        if (!apikey) {
            throw new Error("Token not found in response.");
        }
        localStorage.setItem("latestlogin",apiemail);
        localStorage.setItem(apiemail,JSON.stringify({email:apiemail,password:apipassword,apikey:apikey}));
        //alert("Api Key is: "+apikey);


}


function getapiAccessToken(jwt) {
    try {
        const parts = jwt.split(".");
        if (parts.length !== 3) {
            throw new Error("Invalid JWT format");
        }
        const payload = JSON.parse(atob(parts[1])); // Decode Base64 payload
        console.log(payload);
        return payload.data?.accessToken || "No access token found";
    } catch (error) {
        console.error("JWT Decoding Error:", error);
        return "Error decoding token";
    }
}


function addPopupToBody() {
    // Create a new div element
    const popupContainer = document.createElement("div");
    popupContainer.classList.add("popup-container"); // Add class

    // Set the inner HTML for the popup
    popupContainer.innerHTML = `
        <div class="header">
            <img src="KylasLogo.png" alt="Kylas Logo" class="logo">
            <div class="title-container">
                <h3>Kylas Surfer</h3>
                <p>Logged In With:${apiemail || 'Unknown'}</p>
            </div>
        </div>
        <ul class="menu">
            <li id="one" class="menu-item">Open LinkedIn people search</li>
            <li id="two" class="menu-item">Get Details From Profile</li>
            <li id="three" class="menu-item">Open Kylas web app</li>
            <li id="four" class="menu-item">Logout</li>
        </ul>
    `;

    // Append the popup container to the body
    document.body.appendChild(popupContainer);
}


function addLoginForm() {
    // Create the container div
    const loginContainer = document.createElement("div");
    loginContainer.id = "myloginContainer";
    loginContainer.classList.add("login-container");

    // Set the inner HTML for the login form
    loginContainer.innerHTML = `
        <h2>Kylas Login</h2>
        <input class="login-input" type="text" id="apiemail" placeholder="email">
        <input class="login-input" type="password" id="apipassword" placeholder="Password">
        <button class="login-button" id="loginButton">Login</button>
    `;
    // Append to the body
    document.body.appendChild(loginContainer);
}



