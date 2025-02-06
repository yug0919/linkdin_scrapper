// document.getElementById('scrapeNames').addEventListener('click', async () => {
//     const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//     const results = await chrome.scripting.executeScript({
//       target: { tabId: tab.id },
//       func: scrapeNames,
//     });
  
//     const names = results[0].result;
//     displayResults(names, 'Name Curent name');
//   });

  
//   document.getElementById('scrapeEmails').addEventListener('click', async () => {
//     const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//     const results = await chrome.scripting.executeScript({
//       target: { tabId: tab.id },
//       func: scrapeEmails,
//     });
  
//     const emails = results[0].result;
//     displayResults(emails, 'Emails');
//   });
  
//   function displayResults(data, type) {
//     const resultList = document.getElementById('results');
//     resultList.innerHTML = `<h3>${type} Found:</h3>`;
    
//     if (data.length > 0) {
//       data.forEach(item => {
//         const li = document.createElement('li');
//         li.textContent = item;
//         resultList.appendChild(li);
//       });
//     } else {
//       resultList.innerHTML += `<li>No ${type.toLowerCase()} found</li>`;
//     }
//   }
  
//   function scrapeNames() {
//     const h1Tag = document.querySelector('h1'); 
//     return h1Tag ? [h1Tag.innerText.trim()] : []; 
//   }
//   function scrapeEmails() {
//     const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  
//     // First, let's look for email addresses in text nodes
//     const textEmails = Array.from(document.body.innerText.matchAll(emailRegex))
//       .map(match => match[0]);
  
//     // Second, let's check for email addresses in "mailto:" links
//     const mailtoEmails = Array.from(document.querySelectorAll('a[href^="mailto:"]'))
//       .map(link => link.getAttribute('href').replace('mailto:', '').trim());
  
//     // Combine the two arrays and remove duplicates
//     const allEmails = [...new Set([...textEmails, ...mailtoEmails])];
  
//     return allEmails;
//   }



document.getElementById('scrapeAll').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    const nameResults = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: scrapeNames,
    });
    
    const contactResults = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: scrapeContactInfo,
    });

    const names = nameResults[0]?.result || [];
    const { emails, websites, linkedIn } = contactResults[0]?.result || { emails: [], websites: [], linkedIn: '' };

    displayResults(names, 'Name (Current name)');
    displayResults(emails, 'Emails');
    displayResults(websites, 'Websites');
    displayResults([linkedIn], 'LinkedIn Profile');

    document.getElementById('saveToSheets').dataset.name = names.length ? names[0] : "Unknown";
    document.getElementById('saveToSheets').dataset.info = JSON.stringify({ emails, websites, linkedIn });

    console.log("Scraped Data:", { names, emails, websites, linkedIn });
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

    const linkedinMeta = document.querySelector('meta[property="og:url"]');
    if (linkedinMeta) {
        linkedIn = linkedinMeta.content;
    } else {
        const profileLink = document.querySelector('a[href*="linkedin.com/in/"]');
        linkedIn = profileLink ? profileLink.href : 'Not Found';
    }

    const contactInfoButton = Array.from(document.querySelectorAll('a, button')).find(
        (element) => element.innerText.trim().toLowerCase() === 'contact info'
    );

    if (contactInfoButton) {
        contactInfoButton.click();
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const modal = document.querySelector('[role="dialog"], .artdeco-modal__content');

        if (modal) {
            const modalText = modal.innerText;
            emails = Array.from(modalText.matchAll(emailRegex)).map(match => match[0]);

            websites = Array.from(modal.querySelectorAll('a[href^="http"]'))
                .map(link => link.getAttribute('href'))
                .filter(link => !link.includes('linkedin.com/in/'))
                .slice(0, 2);

            const closeModalButton = document.querySelector('button[aria-label="Dismiss"], button[aria-label="Close"]');
            if (closeModalButton) closeModalButton.click();
        }
    }

    return {
        emails: [...new Set(emails)],
        websites: [...new Set(websites)],
        linkedIn: linkedIn
    };
}
function displayResults(data, type) {
    const resultList = document.getElementById('results');
    resultList.innerHTML += `<h3>${type} Found:</h3>`;

    if (data.length > 0) {
        data.forEach((item) => {
            const li = document.createElement('li');

            // If it's a URL (starts with http), make it a link; otherwise, display as plain text
            if (item.startsWith("http")) {
                li.innerHTML = `<a href="${item}" target="_blank">${item}</a>`;
            } else {
                li.textContent = item;
            }

            resultList.appendChild(li);
        });
    } else {
        resultList.innerHTML += `<li>No ${type.toLowerCase()} found</li>`;
    }
} 












document.getElementById('saveToSheets').addEventListener('click', async () => {
    const saveButton = document.getElementById('saveToSheets');
    
    // Alert to show that the button was clicked
    alert("data is Saved to Sheets ");

    // Get the dynamic data
    const name = saveButton.dataset.name || "Unknown";  // Use the dynamic name from the dataset
    const info = JSON.parse(saveButton.dataset.info || '{}');  // Parse the JSON data stored in dataset

    const { emails, websites, linkedIn } = info;

    try {
        // Sending dynamic data to Google Apps Script via fetch
        const response = await fetch('https://script.google.com/macros/s/AKfycbyoNQp1SRma2m-ChDJyuCc8JXCymibimfI_AhJjEJhE50JQEhvBRYT3vfcGpUvE2Iw/exec', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                linkedIn: linkedIn,
                emails: emails,
                websites: websites
            }),
            mode: 'no-cors'  // Use no-cors mode if CORS issues persist
        });

        // Check if the response is okay
        if (!response.ok) {
            throw new Error('Failed to save data');
        }

        // Parse the response as JSON
        const result = await response.json();
        console.log(result);  // Log the response to the console
        
        // Show a success alert with the response
        alert('Data successfully saved! Response: ' + JSON.stringify(result));
        
    } catch (error) {
        // Handle errors and display them in the console and as an alert
        console.error('Error sending data:', error);
        // alert('Error sending data: ' + error.message);
    }
});
