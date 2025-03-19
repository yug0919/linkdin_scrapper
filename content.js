
(async function () {

    document.body.addEventListener("click", async function (event) {
        if (event.target.id === "leadCategory") Usernumber();
    });


    // Load external CSS
    let conatctinfodata = {};
    let selectedUserId = -1;
    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "overlay.css"; // Ensure this file is in the same directory
    document.head.appendChild(link);

    // Create overlay container
    let overlay = document.createElement("div");
    overlay.id = "custom-overlay";
    overlay.innerHTML = `
    <center>
        <div id="overlay-header">
            <button id="toggleOverlay">−</button>
        </div>
        <div id="overlay-content">
            <h3>Kylas</h3>
            <button class="custom-button" id="scrapeAll">🚀 Get Details</button>
             <div id="results"></div>
            <div id="apollo_result"></div>
            <button class="custom-button" id="apollobtn" style="display: none;">Enrich With Apollo</button>
        </div>
    </center>
`;
    document.body.appendChild(overlay);

    // Sidebar toggle functionality
    let isExpanded = true;

    // Create sidebar tab
    let sidebarTab = document.createElement("div");
    sidebarTab.id = "sidebar-tab";
    sidebarTab.textContent = "Kylas";
    document.body.appendChild(sidebarTab);

    // Click event to toggle overlay
    sidebarTab.addEventListener("click", toggleOverlay);
    document.getElementById("toggleOverlay").addEventListener("click", toggleOverlay);

    function toggleOverlay() {
        if (isExpanded) {
            overlay.style.right = "-280px"; // Fully hide overlay
            sidebarTab.style.left = "0px"; // Keep sidebar visible
        } else {
            overlay.style.right = "10px"; // Expand overlay
            sidebarTab.style.left = "-40px"; // Hide sidebar when expanded
        }
        isExpanded = !isExpanded;
    }




    let apiKey = null;
    let apiemail = null;
    let apipassword = null;

    myInitialize();

    function myInitialize() {

        if (localStorage.getItem("latestlogin") != null) {
            let latestlogin = localStorage.getItem("latestlogin");
            apiemail = latestlogin;
            let latestapikey = JSON.parse(localStorage.getItem(latestlogin));
            apiKey = latestapikey.apikey;
        }
        if (apiKey == null || apiKey === undefined) {
            addLoginForm();
        } else {
            addPopupToOverlay();
        }
    }

    // Logout function
    function Logout() {
        localStorage.removeItem("latestlogin");
        localStorage.removeItem(apiemail);
        apiKey = null;
        apiemail = null;
        apipassword = null;
        addLoginForm(); // Show login form after logout
    }

    // Login function
    async function login() {
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
                body: JSON.stringify({ "email": apiemail, "password": apipassword })
            });

            if (!response.ok) {
                throw new Error("Login failed. Check your credentials.");
            }

            let myKylasApiKey = localStorage.getItem(apiemail);
            if (myKylasApiKey) {
                try {
                    myKylasApiKey = JSON.parse(myKylasApiKey);
                    apiKey = myKylasApiKey.apikey;
                    addPopupToOverlay();
                    return;
                } catch (error) {
                    console.error("Error parsing JSON from localStorage:", error);
                    localStorage.removeItem(apiemail); // Remove corrupt data
                }
            }

            const data = await response.json();
            const token = data.token;

            if (!token) {
                throw new Error("Token not found in response.");
            }

            const apiaccessToken = "Bearer " + getapiAccessToken(token);

            await getApiKey(apiaccessToken);
            addPopupToOverlay();

        } catch (error) {
            alert("Error: " + error.message);
        }
    }

    // Fetch API Key
    async function getApiKey(apiaccessToken) {
        const response = await fetch("https://api-qa.sling-dev.com/v1/api-keys/kylas-app-key", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": apiaccessToken
            }
        });

        if (!response.ok) {
            throw new Error("Login failed.");
        }

        const data = await response.json();
        apiKey = data.apiKey;

        if (!apiKey) {
            throw new Error("API Key not found in response.");
        }

        localStorage.setItem("latestlogin", apiemail);
        localStorage.setItem(apiemail, JSON.stringify({ email: apiemail, password: apipassword, apikey: apiKey }));
    }

    // Decode JWT Token
    function getapiAccessToken(jwt) {
        try {
            const parts = jwt.split(".");
            if (parts.length !== 3) {
                throw new Error("Invalid JWT format");
            }
            const payload = JSON.parse(atob(parts[1]));
            return payload.data?.accessToken || "No access token found";
        } catch (error) {
            console.error("JWT Decoding Error:", error);
            return "Error decoding token";
        }
    }

    // Add Login Form inside Overlay
    function addLoginForm() {
        const overlay = document.getElementById("custom-overlay");
        overlay.innerHTML = `
    <center>
        <div id="overlay-content">
         <img width="120" height="32" src="https://kylas.io/wp-content/themes/kylas/home-images/kylas-logo-black.svg" class="black-logo" alt="Kylas Logo">
    
        <input class="login-input" type="text" id="apiemail" placeholder="Email">
        <input class="login-input" type="password" id="apipassword" placeholder="Password">
        <button class="custom-button" id="loginButton">Login</button>
        </div>
        </center>

    `;
        // Show overlay
        ///////////side bar////////////// 
        let isExpanded = false; // Track overlay state
        // Create sidebar tab
        let sidebarTab = document.createElement("div");
        sidebarTab.id = "sidebar-tab";
        sidebarTab.textContent = "Kylas";
        overlay.appendChild(sidebarTab);

        // Click event to toggle overlay
        sidebarTab.addEventListener("click", () => {
            if (isExpanded) {
                overlay.style.right = "-280px"; // Fully hide overlay
            } else {
                overlay.style.right = "10px"; // Expand overlay
            }
            isExpanded = !isExpanded;
        });
    }

    // Add Logged-in UI inside Overlay
    function addPopupToOverlay() {
        const overlay = document.getElementById("custom-overlay");
        overlay.innerHTML = `
    <center>
    <img width="120" height="32" src="https://kylas.io/wp-content/themes/kylas/home-images/kylas-logo-black.svg" class="black-logo" alt="Kylas Logo">
      <h6>LogIn:${apiemail || 'Unknown'}<h6>
       
    <div id="overlay-content" >
    <button class="custom-button" id="scrapeAll">🚀 Get Details</button>
     <button class="custom-button" id="apollobtn" style="display: none;">Enrich With Apollo</button>
        
         <div id="results"></div>
        
       
        <div id="apollo_result"></div>
        
 
       
            <button id="logout" >Logout<button>
        
           </div></center>
    
    `;


        ////////////side bar////////////// 
        let isExpanded = true; // Track overlay state
        // Create sidebar tab
        let sidebarTab = document.createElement("div");
        sidebarTab.id = "sidebar-tab";
        sidebarTab.textContent = "Kylas";
        overlay.appendChild(sidebarTab);

        // Click event to toggle overlay
        sidebarTab.addEventListener("click", () => {
            if (isExpanded) {
                overlay.style.right = "-280px"; // Fully hide overlay
            } else {
                overlay.style.right = "10px"; // Expand overlay
            }
            isExpanded = !isExpanded;
        });

        // overlay.style.right = "0";
        // Show overlay
    }

    async function apollo() {


        // document.getElementById('apollobtn').addEventListener('click', async () => {
        let resultList = document.getElementById('apollo_result');
        resultList.innerHTML = "";

        try {
            let data = await fetchApolloProfile();

            if (data && data.person) {
                let { first_name, last_name, email, organization, title, phone } = data.person;

                if (!document.getElementById('First Name').value) {
                    document.getElementById('First Name').value = first_name || "";
                }
                if (!document.getElementById('Last Name').value) {
                    document.getElementById('Last Name').value = last_name || "";
                }
                if (!document.getElementById('Emails').value) {
                    document.getElementById('Emails').value = email || "";
                }
                if (!document.getElementById('Title').value) {
                    document.getElementById('Title').value = title || "";
                }
                if (!document.getElementById('Organization').value) {
                    document.getElementById('Organization').value = organization?.name || "";
                }
                if (!document.getElementById('Phone').value) {
                    document.getElementById('Phone').value = organization?.phone || "";
                }


            } else {
                resultList.innerHTML = `<p style="color:red;">No profile data found.</p>`;
            }
        } catch (error) {
            console.error("An error occurred:", error);
            resultList.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
        }
        // });
    }

    async function fetchApolloProfile() {


        const endpoint = "https://api.apollo.io/api/v1/people/match?reveal_personal_emails=false&reveal_phone_number=false";

        const requestBody = {
            linkedin_url: conatctinfodata.linkedin_url

        };

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Cache-Control": "no-cache",
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "x-api-key": "PIFrD8WvoR0i3EQGNzUpGA"
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            console.log("Apollo Profile URL:", data);
            return data;
        } catch (error) {
            alert(error);
            console.error("Error fetching data from Apollo:", error);
            throw error; // Re-throw the error to handle it in the button click event

        }
    }
    let usersofKylas = null;
    async function scrapeall() {
        // document.getElementById('scrapeAll').addEventListener('click', async () => {
        document.getElementById("apollobtn").style.display = "block";
        document.getElementById('scrapeAll').style.display = "block";

        let resultList = document.getElementById('results');
        resultList.innerHTML = ""; // Clear previous results

        try {
            // 🟢 Fetch names
            let namesArray = await scrapeNames();
            console.log("✅ Names:", namesArray);

            let organizationname = await getOrganization();

            let fullName = Array.isArray(namesArray) ? namesArray[0] : namesArray || "Unknown";
            let nameParts = fullName.trim().split(/\s+/); // Split by space

            let firstName = nameParts[0] || "Unknown";  // First Name
            let lastName = nameParts.slice(1).join(" ") || "Unknown"; // Last Name


            if (!organizationname) organizationname = ["No Organization Found"];

            ////linkdin url
            currenturl = null;
            chrome.runtime.sendMessage({ action: "getCurrentTabUrl" }, (response) => {
                if (response?.url) {
                    currenturl = response.url;
                    console.log("Current tab URL:", response.url);
                } else {
                    console.error("Failed to get URL");
                }
            });





            usersofKylas = await extractNamesAndIds();
            displayResults(conatctinfodata.first_name || firstName, 'First Name');
            displayResults(conatctinfodata.last_name || lastName, 'Last Name');
            displayResults(conatctinfodata.email, 'Emails');
            displayResults(conatctinfodata.phone_number, 'Phone');
            displayResults(conatctinfodata.linkedin_url || currenturl, 'LinkedIn Profile');
            displayResults(null, 'Title');
            displayResults([organizationname], 'Organization');





        } catch (error) {
            console.error("❌ Error fetching data:", error);
        }
        // });
    }
    function getOrganization() {
        // 🟢 Scrape organization name
        let button = document.querySelector('button[aria-label^="Current company:"]');

        if (button) {
            let label = button.getAttribute('aria-label');
            let companyName = label.split(':')[1]?.trim();

            if (companyName.includes("Click to skip to experience card")) {
                companyName = companyName.replace("Click to skip to experience card", "").trim();
            }

            console.log("✅ Company Name:", companyName);
            return companyName || "Unknown Organization";
        } else {
            return "Unknown Organization";

        }
    }

    // 🟢 Function to display results in editable text fields
    function displayResults(data, type) {
        const resultList = document.getElementById('results');

        // Section Title
        const sectionTitle = document.createElement('h4');
        sectionTitle.textContent = type;
        resultList.appendChild(sectionTitle);

        let inputs = []; // Store all inputs in an array

        // Create input fields
        if (data != null) {
            const input = document.createElement('input');
            input.type = "text";
            input.value = data;
            input.id = type;
            input.style.width = "100%";
            input.style.marginBottom = "10px";
            inputs.push(input);
            resultList.appendChild(input);

        } else {
            const input = document.createElement('input');
            input.type = "text";
            input.id = type;
            input.placeholder = `No ${type.toLowerCase()} found`;
            input.style.width = "100%";
            input.style.marginBottom = "10px";
            inputs.push(input);
            resultList.appendChild(input);
        }

        // Remove existing buttons before adding new ones (prevents duplication)
        const existingButtons = document.getElementById('actionButtons');
        if (existingButtons) {
            existingButtons.remove();
        }

        // Create button container
        const buttonContainer = document.createElement('div');
        buttonContainer.id = 'actionButtons';
        buttonContainer.style.display = "flex";
        buttonContainer.style.justifyContent = "space-between";
        buttonContainer.style.marginTop = "15px";
        buttonContainer.style.alignItems = "center"; // Align items vertically
        buttonContainer.style.gap = "10px"; // Add spacing between elements

        // "Push to Kylas" Button
        const pushButton = document.createElement('button');
        pushButton.textContent = "Add";
        pushButton.style.padding = "8px 15px";
        pushButton.style.cursor = "pointer";
        pushButton.style.background = "#4CAF50";
        pushButton.style.color = "white";
        pushButton.style.border = "none";
        pushButton.style.borderRadius = "5px";

        pushButton.addEventListener('click', async () => {
            document.getElementById('scrapeAll').style.display = "block";
            document.getElementById("apollobtn").style.display = "none";

            const values = document.querySelectorAll("#results input"); // Collect all input values dynamically

            let emails = [];
            if (values[2]?.value.trim()) {
                emails.push({
                    type: "OFFICE",
                    value: values[2].value.trim(),
                    primary: true
                });
            }
            //for the phone number
            const companyPhoneNumber = values[3]?.value.trim() || null; // Assuming values[4] contains the phone number
            const countryCode = "IN"; // Set the country code (modify as needed)
            const dialCode = "+91"; // Set the dial code (modify as needed)

            const phoneNumber = companyPhoneNumber
                ? [{
                    type: "MOBILE",
                    code: countryCode,
                    value: companyPhoneNumber,
                    dialCode: dialCode,
                    primary: true
                }]
                : [];

            if (selectedUserId == -1) {
                alert("Please Select Owner Of Lead!!");
                return;
            }
            const payload = {
                firstName: values[0]?.value.trim() || "Unknown",
                lastName: values[1]?.value.trim() || "Unknown",
                emails: emails.length > 0 ? emails : null,
                phoneNumbers: phoneNumber,
                linkedIn: values[4]?.value.trim() || null,
                designation: values[5]?.value.trim() || null,
                companyName: values[6]?.value.trim() || "Unknown Organization",
                ownerId: selectedUserId
            };

            console.log("🚀 Sending Data:", payload);

            try {
                const response = await fetch('https://api-qa.sling-dev.com/v1/leads/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': apiKey
                    },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();
                if (response.ok) {

                    alert("Data successfully saved to Kylas!");
                    clearResults();
                    console.log("✅ Response:", result);
                } else {
                    console.error("❌ Error response:", result);
                    alert(`Error: ${result.message || "Something went wrong"}`);
                }
            } catch (error) {
                console.error('❌ Error saving data:', error);
                alert('Error saving data');
            }
        });


        if (usersofKylas != null) {

            const selectField = document.createElement('select');
            selectField.id = 'leadCategory';
            selectField.style.padding = "8px";
            selectField.style.borderRadius = "5px";
            selectField.style.border = "1px solid #ccc";
            selectField.style.cursor = "pointer";

            // Options for select field
            // const options = ["High Priority", "Medium Priority", "Low Priority"];
            // options.forEach(optionText => {
            //     const option = document.createElement('option');
            //     option.value = optionText.toLowerCase().replace(" ", "_"); // Set value
            //     option.textContent = optionText; // Display text
            //     selectField.appendChild(option);
            // });


            //const userDropdown = document.getElementById("leadCategory");
            // Clear existing options
            selectField.innerHTML = '<option value="">Select User</option>';

            // Populate dropdown with user data
            usersofKylas.forEach(user => {
                let option = document.createElement("option");
                option.value = user.id;  // Use user ID as value
                option.textContent = `${user.firstName} ${user.lastName}`; // Display full name
                selectField.appendChild(option);

            });
            buttonContainer.appendChild(selectField);
        }














        // "Cancel" Button
        const cancelButton = document.createElement('button');
        cancelButton.textContent = "Cancel";
        cancelButton.style.padding = "8px 15px";
        cancelButton.style.cursor = "pointer";
        cancelButton.style.background = "#f44336"; // Red
        cancelButton.style.color = "white";
        cancelButton.style.border = "none";
        cancelButton.style.borderRadius = "5px";

        cancelButton.addEventListener('click', () => {
            document.getElementById('results').innerHTML = '';

            document.querySelectorAll("#results input").forEach(input => input.value = ""); // Clear all input fields
            document.getElementById('scrapeAll').style.display = "block";
            document.getElementById("apollobtn").style.display = "none";

        });

        buttonContainer.appendChild(pushButton);

        buttonContainer.appendChild(cancelButton);

        // Append button container at the end of all fields
        resultList.appendChild(buttonContainer);
    }

    function Usernumber() {

        selectedUserId = document.getElementById("leadCategory").value; // Get selected user ID
    };


    // 🟢 Scrape name function
    function scrapeNames() {
        const h1Tag = document.querySelector('h1');
        return h1Tag ? [h1Tag.innerText.trim()] : [];
    }

    // 🟢 Scrape contact info function

    async function extractNamesAndIds() {
        try {
            // Fetch response (Replace with actual API URL if needed)
            const response = await fetch("https://api-qa.sling-dev.com/v1/users/search?sort=updatedAt,desc&page=0&size=10", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "api-key": apiKey // Add if required
                },
                body: JSON.stringify({
                    "jsonRule": null
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json(); // Convert response to JSON

            // Extract firstName, lastName, and id from the content array
            if (data.content && Array.isArray(data.content)) {
                const extractedData = data.content.map(person => ({
                    firstName: person.firstName || "N/A",
                    lastName: person.lastName || "N/A",
                    id: person.id || "N/A"
                }));

                //alert("Extracted Data:"+extractedData.length+" andd "+extractedData[0]);
                return extractedData;
            } else {
                console.error("No content found in response.");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    // 🟢 Clear results
    function clearResults() {
        document.getElementById('results').innerHTML = '';
    }
    // Event Listener for Clicks
    document.body.addEventListener("click", async function (event) {

        if (event.target.id === "saveBtn") saveBtn();
        if (event.target.id === "cancelBtn") cancelBtn();
        if (event.target.id === "apollobtn") apollo();
        if (event.target.id === "clearBtn") clearResults();
        if (event.target.id === "scrapeAll") scrapeall();
        if (event.target.id === "logout") Logout();
        if (event.target.id === "loginButton") login();
    });

    
    (function () {
        function extractProfileInfo() {
            console.log("Extracting profile info...");

            let url = window.location.href;
            let match = url.match(/linkedin\.com\/in\/([^\/]+)/);

            if (!match) {
                console.log("Not on a LinkedIn profile page.");
                return;
            }

            let identifier = match[1];
            let baseProfileUrl = `https://www.linkedin.com/in/${identifier}/`;

            console.log("Profile URL:", baseProfileUrl);
            console.log("Identifier:", identifier);


            // Get the script URL from the DOM
            const scriptElement = document.querySelector('[data-fastboot-src="/assets/vendor.js"]');
            if (!scriptElement) {
                console.error("Element with data-fastboot-src='/assets/vendor.js' not found.");
                return;
            }

            const jsUrl = scriptElement.getAttribute("src");
            if (!jsUrl) {
                console.error("No 'src' attribute found in the script element.");
                return;
            }








            // Extract CSRF token from cookies
            let csrfToken = null; // Variable to store CSRF token

            chrome.storage.local.get("csrfToken", (data) => {
                csrfToken = data.csrfToken || null;

                if (!csrfToken) {
                    console.error("CSRF token not found in local storage!");
                } else {
                    console.log("Extracted CSRF Token:", csrfToken);
                }
            })






















            // Fetch the JavaScript file
            fetch(jsUrl)
                .then((response) => response.text())
                .then((jsContent) => {
                    console.log("JavaScript file fetched successfully!");

                    // Extract the queryId using regex
                    const regex =
                        /define\("graphql-queries\/queries\/profile\/identityDashProfiles\/profile-contact-info-finder\.graphql"[^]*?id:\s*"([^"]+)"/;
                    const match = jsContent.match(regex);

                    if (!match) {
                        console.error("queryId not found in the JavaScript file.");
                        return;
                    }

                    const queryId = match[1];
                    console.log("Extracted queryId:", queryId);

                    // Make the LinkedIn API request using extracted identifier
                    fetch(
                        `https://www.linkedin.com/voyager/api/graphql?variables=(memberIdentity:${identifier})&queryId=${queryId}`,
                        {
                            headers: {
                                "csrf-token": csrfToken,
                                accept: "application/json",
                            },
                            credentials: "include", // Ensures cookies are sent
                        }
                    )
                        .then((result) => result.json())
                        .then((data) => {
                            console.log("GraphQL Response:", data);

                            // Extract required fields
                            const profile =
                                data?.data?.identityDashProfilesByMemberIdentity?.elements[0] || {};

                            const extractedInfo = {
                                first_name: profile?.firstName || null,
                                last_name: profile?.lastName || null,
                                email: profile?.emailAddress?.emailAddress || null,
                                phone_number:
                                    profile?.phoneNumbers?.length &&
                                    profile?.phoneNumbers[0]?.phoneNumber?.number || null,
                                company: profile?.companyName || null, // Extract company name
                                linkedin_url: baseProfileUrl,
                            };
                            conatctinfodata = extractedInfo;

                            console.log("Extracted Profile Info:", extractedInfo);


                            console.log(extractedInfo.first_name);
                            console.log(extractedInfo.linkedin_url);
                            console.log(extractedInfo.email);
                            console.log(extractedInfo.phone_number);
                            console.log(extractedInfo.company);
                        })
                        .catch((error) => console.error("Error fetching GraphQL data:", error));
                })
                .catch((error) => console.error("Error fetching script:", error));
        }

        // **Detect URL Changes Dynamically**
        let lastUrl = window.location.href;
        const observer = new MutationObserver(() => {
            if (window.location.href !== lastUrl) {
                console.log("URL changed! Scraping new profile data...");
                lastUrl = window.location.href;
                extractProfileInfo();
            }
        });

        observer.observe(document, { subtree: true, childList: true });

        // **Run once initially**
        extractProfileInfo();










    })();





})();














































































