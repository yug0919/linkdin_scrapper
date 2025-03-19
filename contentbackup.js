



// (async function () {
//     let linkedIn = '';
//       // Load external CSS
//       let link = document.createElement("link");
//       link.rel = "stylesheet";
//       link.href = "overlay.css"; // Ensure this file is in the same directory
//       document.head.appendChild(link);
//     // Create overlay container
//     let overlay = document.createElement("div");
//     overlay.id = "custom-overlay";
//     overlay.innerHTML = `<center>
//         <div id="overlay-header">
//             <button id="toggleOverlay">−</button>
//         </div>
//         <div id="overlay-content">
//             <h3>Kylas</h3>
//             <button class="custom-button" id="scrapeAll">🚀 Get Details</button>
//             <div id="results"></div>
//             <div id="apollo_result"></div>
//              <button class="custom-button" id="apollobtn" style="display: none;">Enrich With Apollo</button>

//         </div></center>
//     `;
//     document.body.appendChild(overlay);


// ////////////side bar////////////// 
//     let isExpanded = false; // Track overlay state
//     // Create sidebar tab
//     let sidebarTab = document.createElement("div");
//     sidebarTab.id = "sidebar-tab";
//     sidebarTab.textContent = "Kylas";
//     overlay.appendChild(sidebarTab);
    
//     // Click event to toggle overlay
//     sidebarTab.addEventListener("click", () => {
//         if (isExpanded) {
//             overlay.style.right = "-280px"; // Fully hide overlay
//         } else {
//             overlay.style.right = "10px"; // Expand overlay
//         }
//         isExpanded = !isExpanded;
//     });


//     document.getElementById('apollobtn').addEventListener('click', async () => {
//         let resultList = document.getElementById('apollo_result');
//         resultList.innerHTML = "";
    
//         try {
//             let data = await fetchApolloProfile();
    
//             if (data && data.person) {
//                 let { first_name, last_name, email, organization ,title} = data.person;
            
//             document.getElementById('First Name').value = first_name || "";
//             document.getElementById('Last Name').value = last_name || "";
//             document.getElementById('Emails').value = email || "";
//             document.getElementById('title').value = title || "";
//             document.getElementById('Organization').value = organization?.name || "";


//         } else {
//             resultList.innerHTML = `<p style="color:red;">No profile data found.</p>`;
//         }
//         } catch (error) {
//             console.error("An error occurred:", error);
//             resultList.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
//         }
//     });
    
//     async function fetchApolloProfile() {
    
    
//         const endpoint = "https://api.apollo.io/api/v1/people/match?reveal_personal_emails=false&reveal_phone_number=false";
       
//         const requestBody = {
//             linkedin_url:linkedIn
//         };
    
//         try {
//             const response = await fetch(endpoint, {
//                 method: "POST",
//                 headers: {
//                     "Cache-Control": "no-cache",
//                     "Content-Type": "application/json",
//                     "Accept": "application/json",
//                     "x-api-key": "PIFrD8WvoR0i3EQGNzUpGA"
//                 },
//                 body: JSON.stringify(requestBody)
//             });
    
//             if (!response.ok) {
//                 throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
//             }
    
//             const data = await response.json();
//             console.log("Apollo Profile URL:", data);
//             return data;
//         } catch (error) {
//             console.error("Error fetching data from Apollo:", error);
//             throw error; // Re-throw the error to handle it in the button click event
//         }
//     }
    
//     document.getElementById('scrapeAll').addEventListener('click', async () => {
//         document.getElementById("apollobtn").style.display = "block";
//         document.getElementById('scrapeAll').style.display="none";

//         let resultList = document.getElementById('results');
//         resultList.innerHTML = ""; // Clear previous results
    
//         try {
//             // 🟢 Fetch names
//             let namesArray = await scrapeNames();
//             console.log("✅ Names:", namesArray);
    
//             let fullName = Array.isArray(namesArray) ? namesArray[0] : namesArray || "Unknown";
//             let nameParts = fullName.trim().split(/\s+/); // Split by space
    
//             let firstName = nameParts[0] || "Unknown";  // First Name
//             let lastName = nameParts.slice(1).join(" ") || "Unknown"; // Last Name
    
//             // 🟢 Fetch contact info
//             let contactInfo = await scrapeContactInfo();
//             console.log("✅ Contact Info:", contactInfo);

//             let organizationname=await getOrganization();
    
//             // Ensure valid data
//             if (!contactInfo.emails) contactInfo.emails = ["No Emails Found"];
//             if (!contactInfo.websites) contactInfo.websites = ["No Websites Found"];
//             if (!contactInfo.linkedIn) contactInfo.linkedIn = "No LinkedIn Found";
//             if (!organizationname) organizationname = ["No Organization Found"];
//             // 🟢 Display results in editable input fields
            

//             displayResults([firstName], 'First Name');
//             displayResults([lastName], 'Last Name');
//             displayResults(contactInfo.emails, 'Emails');
//             displayResults(contactInfo.websites, 'Websites');
//             displayResults([contactInfo.linkedIn], 'LinkedIn Profile');
//             displayResults("", 'title');
//             displayResults([organizationname], 'Organization');



          
//         } catch (error) {
//             console.error("❌ Error fetching data:", error);
//         }
//     });
//     function getOrganization(){
//           // 🟢 Scrape organization name
//           let button = document.querySelector('button[aria-label^="Current company:"]');
    
//           if (button) {
//               let label = button.getAttribute('aria-label');
//               let companyName = label.split(':')[1]?.trim();
  
//               if (companyName.includes("Click to skip to experience card")) {
//                   companyName = companyName.replace("Click to skip to experience card", "").trim();
//               }
  
//               console.log("✅ Company Name:", companyName);
//             return companyName || "Unknown Organization";
//           } else {
//              return "Unknown Organization";
             
//           }
//     }
    
//     // 🟢 Function to display results in editable text fields
//     function displayResults(data, type) {
//         const resultList = document.getElementById('results');
    
//         // Section Title
//         const sectionTitle = document.createElement('h4');
//         sectionTitle.textContent = type;
//         resultList.appendChild(sectionTitle);
    
//         let inputs = []; // Store all inputs in an array
    
//         // Create input fields
//         if (data.length > 0) {
//             data.forEach((item) => {
//                 const input = document.createElement('input');
//                 input.type = "text";
//                 input.value = item;
//                 input.id=type;
//                 input.style.width = "100%";
//                 input.style.marginBottom = "10px";
//                 inputs.push(input);
//                 resultList.appendChild(input);
//             });
//         } else {
//             const input = document.createElement('input');
//             input.type = "text";
//             input.id=type;
//             input.placeholder = `No ${type.toLowerCase()} found`;
//             input.style.width = "100%";
//             input.style.marginBottom = "10px";
//             inputs.push(input);
//             resultList.appendChild(input);
//         }
    
//         // Remove existing buttons before adding new ones (prevents duplication)
//         const existingButtons = document.getElementById('actionButtons');
//         if (existingButtons) {
//             existingButtons.remove();
//         }
    
//         // Create button container
//         const buttonContainer = document.createElement('div');
//         buttonContainer.id = 'actionButtons';
//         buttonContainer.style.display = "flex";
//         buttonContainer.style.justifyContent = "space-between";
//         buttonContainer.style.marginTop = "15px";
    
//         // "Push to Kylas" Button
//         const pushButton = document.createElement('button');
//         pushButton.textContent = "Add Lead";
//         pushButton.style.padding = "8px 15px";
//         pushButton.style.cursor = "pointer";
//         pushButton.style.background = "#4CAF50"; 
//         pushButton.style.color = "white";
//         pushButton.style.border = "none";
//         pushButton.style.borderRadius = "5px";
    
//         pushButton.addEventListener('click', async () => {
//             const values = document.querySelectorAll("#results input"); // Collect all input values dynamically
//             let emails = [];
//             if (values[2]?.value.trim()) {
//                 emails.push({
//                     type: "OFFICE",
//                     value: values[2].value.trim(),
//                     primary: true
//                 });
//             }



//             const payload = {
//                 firstName: values[0]?.value.trim() || "Unknown",
//                 lastName: values[1]?.value.trim() || "Unknown",
//                 emails:emails.length > 0 ? emails : null,
//                 companyWebsite: values[3]?.value.trim() || null,
//                 linkedIn: values[4]?.value.trim() || null,
//                 designation:values[5]?.value.trim() || null,
//                 companyName: values[6]?.value.trim() || "Unknown Organization"
              
//             };
    
//             console.log("🚀 Sending Data:", payload);
    
//             try {
//                 const response = await fetch('https://api-qa.sling-dev.com/v1/leads/', {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'api-key': '3fb329e3-b943-46de-8386-895fbac92c49:4388'
//                     },
//                     body: JSON.stringify(payload)
//                 });
    
//                 const result = await response.json();
//                 if (response.ok) {

//                     alert("Data successfully saved to Kylas!");
//                     clearResults();
//                     console.log("✅ Response:", result);
//                 } else {
//                     console.error("❌ Error response:", result);
//                     alert(`Error: ${result.message || "Something went wrong"}`);
//                 }
//             } catch (error) {
//                 console.error('❌ Error saving data:', error);
//                 alert('Error saving data');
//             }
//         });
    
//         // "Cancel" Button
//         const cancelButton = document.createElement('button');
//         cancelButton.textContent = "Cancel";
//         cancelButton.style.padding = "8px 15px";
//         cancelButton.style.cursor = "pointer";
//         cancelButton.style.background = "#f44336"; // Red
//         cancelButton.style.color = "white";
//         cancelButton.style.border = "none";
//         cancelButton.style.borderRadius = "5px";
    
//         cancelButton.addEventListener('click', () => {
//             document.getElementById('results').innerHTML = '';

//             document.querySelectorAll("#results input").forEach(input => input.value = ""); // Clear all input fields
//             document.getElementById('scrapeAll').style.display="block";
//             document.getElementById("apollobtn").style.display = "none";

//         });
    
//         buttonContainer.appendChild(pushButton);
//         buttonContainer.appendChild(cancelButton);
    
//         // Append button container at the end of all fields
//         resultList.appendChild(buttonContainer);
//     }
    
    
    
    
//     // 🟢 Scrape name function
//     function scrapeNames() {
//         const h1Tag = document.querySelector('h1');
//         return h1Tag ? [h1Tag.innerText.trim()] : [];
//     }
    
//     // 🟢 Scrape contact info function
//     async function scrapeContactInfo() {
//         const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
//         let emails = [];
//         let websites = [];
        
//         linkedIn='';
    
//         const contactInfoButton = Array.from(document.querySelectorAll('a, button'))
//             .find((element) => element.innerText.trim().toLowerCase() === 'contact info');
    
//         if (contactInfoButton) {
//             contactInfoButton.click();
//             await new Promise((resolve) => setTimeout(resolve, 5000));
    
//             // 🟢 Scrape LinkedIn Profile
//             const linkedinMeta = document.querySelector('meta[property="og:url"]');
//             linkedIn = linkedinMeta ? linkedinMeta.content : 'Not Found';
    
//             if (linkedIn === 'Not Found') {
//                 const linkedinLink = document.querySelector('a[href*="linkedin.com/in/"]');
//                 if (linkedinLink) {
//                     linkedIn = linkedinLink.href;
//                 }
//             }
    
//             const modal = document.querySelector('[role="dialog"], .artdeco-modal__content');
//             if (modal && modal.style.display !== 'none') {
//                 const modalText = modal.innerText;
//                 emails = Array.from(modalText.matchAll(emailRegex)).map(match => match[0]);
    
//                 websites = Array.from(modal.querySelectorAll('a[href^="http"]'))
//                     .map(link => link.getAttribute('href'))
//                     .filter(link => !link.includes('linkedin.com/'))
//                     .slice(0, 2);
    
//                 const closeModalButton = document.querySelector('button[aria-label="Dismiss"], button[aria-label="Close"]');
//                 if (closeModalButton) closeModalButton.click();
//             }
//         }
    
//         return { emails: [...new Set(emails)], websites: [...new Set(websites)], linkedIn: linkedIn };
//     }
    
//     // 🟢 Clear results
//     function clearResults() {
//         document.getElementById('results').innerHTML = '';
//     }

// /////////////////////////////////////////////////////

// //////////////////////////////////////////////

// /////////////




    
    
// })();
