console.log("🔍 Content script loaded: Checking LinkedIn profile...");

// Function to detect LinkedIn profile elements
function isOnLinkedInProfile() {    
    const profileDetected = window.location.href.includes("linkedin.com/in/") || window.location.href.includes("linkedin.com/pub/");
    return { isProfile: profileDetected, url: window.location.href };            
}

// Function to scrape LinkedIn name
function scrapeNames() {
    const h1Tag = document.querySelector('h1');
    return h1Tag ? h1Tag.innerText.trim() : "No Name Found";
}

// Function to scrape LinkedIn contact info
async function scrapeContactInfo() {
    console.log("📢 Scraping contact info...");
    
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
    let emails = [];
    let websites = [];
    let linkedIn = '';

    // Check if LinkedIn URL exists in a meta tag
    const linkedinMeta = document.querySelector('meta[property="og:url"]');
    linkedIn = linkedinMeta ? linkedinMeta.content : 'Not Found';

    // If the LinkedIn meta tag is not found, check for the <a> tag with LinkedIn URL
    if (linkedIn === 'Not Found') {
        const linkedinLink = document.querySelector('a[href*="linkedin.com/in/"]');
        if (linkedinLink) {
            linkedIn = linkedinLink.href;
        }
    }

    const contactInfoButton = Array.from(document.querySelectorAll('a, button')).find(
        (element) => element.innerText.trim().toLowerCase() === 'contact info'
    );

    if (contactInfoButton) {
        contactInfoButton.click();
        await new Promise((resolve) => setTimeout(resolve, 3000));  // Wait for modal to load

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
    
    let button = document.querySelector('button[aria-label^="Current company:"]');  // Select button with aria-label starting with "Current company:"
    let companyName;
    if (button) {
    let label = button.getAttribute('aria-label');  // Get aria-label text
    companyName = label.split(':')[1]?.trim();  // Extract company name after the colon

    // If "Click to skip to experience card" is present, remove it
    if (companyName && companyName.includes("Click to skip to experience card")) {
        companyName = companyName.replace("Click to skip to experience card", "").trim();  // Remove that part
    }
}
    return { emails: [...new Set(emails)], websites: [...new Set(websites)], companyName: companyName };
}

// Listen for messages from `KylasExtension.js`
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "checkLinkedInProfile") {
        console.log("📢 Checking if on LinkedIn profile... " + window.location.href);
        sendResponse(isOnLinkedInProfile());
    }

    if (message.action === "scrapeLinkedInName") {
        console.log("📢 Scraping LinkedIn name...");
        sendResponse({ name: scrapeNames() });
    }

    if (message.action === "scrapeLinkedInContact") {
        scrapeContactInfo().then((data) => {
            console.log("📢 Scraped contact info:", data);
            sendResponse(data);
        });
        return true; // Required to indicate an asynchronous response
    }
});
