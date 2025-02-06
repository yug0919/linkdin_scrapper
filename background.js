chrome.runtime.onInstalled.addListener(() => {
  console.log("Background service worker initialized.");
});

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "scrapeNames") {
    console.log("Received 'scrapeNames' action from popup.");

    // Inject content.js into the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        sendResponse({ message: "No active tab found." });
        return;
      }

      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          files: ["content.js"],
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error("Script injection failed:", chrome.runtime.lastError.message);
            sendResponse({ message: "Failed to execute script." });
            return;
          }
          console.log("Content script successfully injected.");
          sendResponse({ message: "Scraping started." });
        }
      );
    });

    // Keep the message channel open for async response
    return true;
  }
});
