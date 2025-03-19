chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url.includes("linkedin.com/in/")) {
      chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ["popupcontent.js"]
      }).catch(err => console.error("❌ Script injection error:", err));
  }
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getCurrentTabUrl") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      sendResponse({ url: tabs[0]?.url });
    });
    return true; // Keep the messaging channel open for sendResponse
  }

});









// Intercept GraphQL API requests on LinkedIn and extract CSRF token
chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    const url = details.url;
 
    // Ensure it's a LinkedIn GraphQL request
    if (url.startsWith("https://www.linkedin.com/") && url.includes("/graphql")) {
      const headers = details.requestHeaders.reduce((acc, header) => {
        acc[header.name.toLowerCase()] = header.value;
        return acc;
      }, {});
 
      const csrfToken = headers["csrf-token"] ;
 
      if (csrfToken) {
        console.log("Extracted CSRF Token:", csrfToken);
 
        // Update the CSRF token in Chrome's local storage
        chrome.storage.local.set({ csrfToken }, () => {
          console.log("CSRF Token updated in local storage.");
        });
      }
    }
  },
  { urls: ["*://www.linkedin.com/*"] },
  ["requestHeaders"]
);