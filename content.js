(async function () {
    // Create overlay container
    let overlay = document.createElement("div");
    overlay.id = "custom-overlay";
    overlay.innerHTML = `<center>
        <div id="overlay-header">
            <span id="drag-text">Scrapper</span>
            <button id="toggleOverlay">−</button>
        </div>
        <div id="overlay-content">
            <h3>LinkedIn Scraper</h3>
            <button class="custom-button" id="scrapeAll">🚀 Get Details</button>
            <button class="custom-button" id="saveToSheets">💾 Push To Kylas</button>
            <button class="custom-button" id="clearData">🧹 Clear Data</button>
            <div id="results"></div>
        </div></center>
    `;

    // Overlay styling
    overlay.style.position = "fixed";
    overlay.style.top = "0px";
overlay.style.right = "0px";

    overlay.style.width = "270px";
    overlay.style.background = "white";
    overlay.style.border = "1px solid #ccc";
    overlay.style.borderRadius = "10px";
    overlay.style.boxShadow = "2px 2px 10px rgba(0,0,0,0.2)";
    overlay.style.padding = "10px";
    overlay.style.zIndex = "9999";
    overlay.style.fontFamily = "Arial, sans-serif";
    overlay.style.userSelect = "none";
    overlay.style.transition = "height 0.3s ease";
    overlay.style.maxHeight = "400px";  
    overlay.style.overflowY = "auto";   

    document.body.appendChild(overlay);

    // Header styling (Drag & Minimize Button)
    let header = document.getElementById("overlay-header");
    header.style.display = "flex";
    header.style.justifyContent = "space-between";
    header.style.alignItems = "center";
    header.style.background = "#0073b1";
    header.style.color = "white";
    header.style.padding = "5px";
    header.style.borderRadius = "10px 10px 0 0";
    header.style.cursor = "grab";

    let toggleButton = document.getElementById("toggleOverlay");
    toggleButton.style.background = "transparent";
    toggleButton.style.border = "none";
    toggleButton.style.color = "white";
    toggleButton.style.cursor = "pointer";
    toggleButton.style.fontSize = "16px";

    // Style buttons
    let buttons = document.querySelectorAll(".custom-button");
    buttons.forEach((btn) => {
        btn.style.display = "block";
        btn.style.width = "100%";
        btn.style.margin = "5px 0";
        btn.style.padding = "10px";
        btn.style.fontSize = "14px";
        btn.style.fontWeight = "bold";
        btn.style.color = "#fff";
        btn.style.background = "linear-gradient(45deg, #0073b1, #005f8b)";
        btn.style.border = "none";
        btn.style.borderRadius = "5px";
        btn.style.cursor = "pointer";
        btn.style.transition = "background 0.3s, transform 0.2s";
    });

    // Button hover effects
    buttons.forEach((btn) => {
        btn.addEventListener("mouseover", () => {
            btn.style.background = "linear-gradient(45deg, #005f8b, #004a6d)";
            btn.style.transform = "scale(1.05)";
        });
        btn.addEventListener("mouseout", () => {
            btn.style.background = "linear-gradient(45deg, #0073b1, #005f8b)";
            btn.style.transform = "scale(1)";
        });
    });

    // Drag functionality
    let isDragging = false;
    let offsetX, offsetY;

    header.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.clientX - overlay.getBoundingClientRect().left;
        offsetY = e.clientY - overlay.getBoundingClientRect().top;
    });

    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            overlay.style.left = `${e.clientX - offsetX}px`;
            overlay.style.top = `${e.clientY - offsetY}px`;
        }
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
    });

    // Minimize/Maximize Button Functionality
    let isMinimized = false;
    let contentDiv = document.getElementById("overlay-content");

    toggleButton.addEventListener("click", () => {
        if (isMinimized) {
            contentDiv.style.display = "block";
            toggleButton.textContent = "−"; 
        } else {
            contentDiv.style.display = "none";
            toggleButton.textContent = "+"; 
        }
        isMinimized = !isMinimized;
    });

    // Button event listeners
    document.getElementById('scrapeAll').addEventListener('click', async () => {
        let names = scrapeNames();
        let contactInfo = await scrapeContactInfo();

        displayResults(names, 'Names');
        displayResults(contactInfo.emails, 'Emails');
        displayResults(contactInfo.websites, 'Websites');
        displayResults([contactInfo.linkedIn], 'LinkedIn Profile');

        document.getElementById('saveToSheets').dataset.name = names.length ? names[0] : "Unknown";
        document.getElementById('saveToSheets').dataset.info = JSON.stringify(contactInfo);


          ////  for  organization name
        // Find all h2 elements
        let h2Tags = Array.from(document.querySelectorAll("h2"));
    
        // Loop through each <h2> and search for "Experience" using regex
        let experienceH2 = h2Tags.find(h2 => /experience/i.test(h2.textContent.trim()));
    
        if (!experienceH2) {
            console.log(" 'Experience' section not found!");
            return null;
        }
    
        // Find the closest parent/ancestor section of Experience
        let experienceSection = experienceH2.closest("section");
    
        if (!experienceSection) {
            console.log(" Experience section wrapper not found!");
            return null;
        }
    
        // Find the first job entry (li tag) within the section
        let firstExperience = experienceSection.querySelector("ul li");
    
        if (!firstExperience) {
            console.log("No experience items found!");
            return null;
        }
    
        // Extract the first line (text content) of the first <li> item
        let firstLine = firstExperience.innerText.trim().split('\n')[1];  // Get only the first line
        // let company = firstExperience.querySelector("span.t-normal");
        console.log("✅ First Experience Line Found:", firstLine);

        // Find the button using a class name or aria-label
let button = document.querySelector('button[aria-label^="Current company:"]');  // Select button with aria-label starting with "Current company:"

if (button) {
    let label = button.getAttribute('aria-label');  // Get aria-label text
    let companyName = label.split(':')[1]?.trim();  // Extract company name after the colon

    // If "Click to skip to experience card" is present, remove it
    if (companyName && companyName.includes("Click to skip to experience card")) {
        companyName = companyName.replace("Click to skip to experience card", "").trim();  // Remove that part
    }

    console.log("✅ Company Name:", companyName);  // Output company name

    document.getElementById('saveToSheets').dataset.organization = companyName || "Unknown Organization";
    displayResults([companyName], 'Organization');

} else {
    console.log("❌ Company button not found!");
}




        



    });

    document.getElementById('saveToSheets').addEventListener('click', async () => {
        const saveButton = document.getElementById('saveToSheets');
        // alert("Data is being saved to Sheets...");

        const name = saveButton.dataset.name || "Unknown";
        const info = JSON.parse(saveButton.dataset.info || '{}');
        const organization = saveButton.dataset.organization || "Unknown Organization";
        
        try {
            console.log("FName",name.split(" ")[0]);
            console.log("LName",name.split(" ")[1]);
            console.log("Info : ",info.linkedIn);
            console.log("Websi : ",info.websites[0]||null);
            console.log("Organization: ",organization);

            const response = await fetch('https://api-qa.sling-dev.com/v1/leads/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': '3fb329e3-b943-46de-8386-895fbac92c49:4388'
                },
                body: JSON.stringify({
                    ownerId: '11263',
                    firstName: name.split(" ")[0],
                    lastName: name.split(" ")[1],
                    phoneNumbers: [
                        {
                            type: "MOBILE",
                            code: "IN",
                            value: "9090909090",
                            dialCode: "+91",
                            primary: true
                        }
                    ],
                    emails: [
                        {
                            type: "OFFICE",
                            value: "shubham@example.com",
                            primary: true
                        }
                    ],
                    timezone: "Etc/GMT+12",
                    city: "Mumbai",
                    state: "Maharashtra",
                    zipcode: "400001",
                    country: "IN",
                    department: "Sales",
                    dnd: false,
                    facebook: null,
                    twitter: null,
                    linkedIn: info.linkedIn,
                    address: "123, Example Street",
                    companyName: organization,
                    designation: "Manager",
                    companyAddress: "456, Business Avenue",
                    companyCity: "Mumbai",
                    companyState: "Maharashtra",
                    companyZipcode: "400002",
                    companyCountry: "IN",
                    companyEmployees: null,
                    companyAnnualRevenue: 10000000,
                    companyWebsite: info.websites[0]||null,
                    companyPhones: [
                        {
                            type: "MOBILE",
                            code: "IN",
                            value: "9090909090",
                            dialCode: "+91",
                            primary: true
                        }
                    ],
                    companyIndustry: "BIOTECHNOLOGY",
                    companyBusinessType: "competitor",
                    requirementName: "Office Space Rental",
                    requirementCurrency: "INR",
                    requirementBudget: 3500000,
                    products: [
                        {
                            id: 18806,
                            name: "Rent Office Space 5000 Sqft"
                        }
                    ],
                    campaign: null,
                    source: null,
                    customFieldValues: {}
                })
            });
        
            const result = await response.json();
            if (response.ok) {
                alert("Data successfully saved!");
                console.log("Response:", result);
            } else {
                console.error("Error response:", result);
                alert(`Error: ${result.message || "Something went wrong"}`);
            }
        } catch (error) {
            console.error('Error saving data:', error);
            alert('Error saving data');
        }
        
    });

    document.getElementById('clearData').addEventListener('click', () => {
        clearResults();  // Clear the results manually
    });

    function scrapeNames() {
        const h1Tag = document.querySelector('h1');
        return h1Tag ? [h1Tag.innerText.trim()] : [];
    }

    async function scrapeContactInfo() {
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
        let emails = [];
        let websites = [];
        let linkedIn = '';
    
        // Check if LinkedIn URL exists in a meta tag
        
    
        const contactInfoButton = Array.from(document.querySelectorAll('a, button')).find(
            (element) => element.innerText.trim().toLowerCase() === 'contact info'
        );
    
        if (contactInfoButton) {
            contactInfoButton.click();
            await new Promise((resolve) => setTimeout(resolve, 3000));  // Increased wait time


            const linkedinMeta = document.querySelector('meta[property="og:url"]');
        linkedIn = linkedinMeta ? linkedinMeta.content : 'Not Found';
    
        // If the LinkedIn meta tag is not found, check for the <a> tag with LinkedIn URL
        if (linkedIn === 'Not Found') {
            const linkedinLink = document.querySelector('a[href*="linkedin.com/in/"]');
            if (linkedinLink) {
                linkedIn = linkedinLink.href; // Extract the URL from the href attribute
            }
        }
    
            const modal = document.querySelector('[role="dialog"], .artdeco-modal__content');
            if (modal && modal.style.display !== 'none') {
                const modalText = modal.innerText;
                emails = Array.from(modalText.matchAll(emailRegex)).map(match => match[0]);
    
                websites = Array.from(modal.querySelectorAll('a[href^="http"]'))
                    .map(link => link.getAttribute('href'))
                    .filter(link => !link.includes('linkedin.com/'))
                    .slice(0, 2);
    
                const closeModalButton = document.querySelector('button[aria-label="Dismiss"], button[aria-label="Close"]');
                if (closeModalButton) closeModalButton.click();
            }
        }
    
        return { emails: [...new Set(emails)], websites: [...new Set(websites)], linkedIn: linkedIn };
    }
    



















  
    

    function displayResults(data, type) {
        const resultList = document.getElementById('results');
        resultList.innerHTML += `<br><h4>${type}</h4>`;
    
        if (data.length > 0) {
            data.forEach((item) => {
                const li = document.createElement('li');
                li.style.wordBreak = "break-word"; // Ensures links wrap within the box
                li.style.overflowWrap = "break-word"; // Additional safety for wrapping
    
                if (item.startsWith("http")) {
                    li.innerHTML = `<a href="${item}" target="_blank" style="word-break: break-word; display: block;">${item}</a>`;
                } else {
                    li.textContent = item;
                }
    
                resultList.appendChild(li);
            });
        } else {
            resultList.innerHTML += `<li>No ${type.toLowerCase()} found</li>`;
        }
    }

    function clearResults() {
        const resultList = document.getElementById('results');
        resultList.innerHTML = '';  // Clears the results displayed
    }
})();
