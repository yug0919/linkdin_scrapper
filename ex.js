// Check if the overlay already exists
if (!document.getElementById("custom-overlay")) {
    // Create overlay div
    let overlay = document.createElement("div");
    overlay.id = "custom-overlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.background = "rgba(0, 0, 0, 0.7)";
    overlay.style.zIndex = "10000";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.innerHTML = `<div style="background: white; padding: 20px; border-radius: 10px;">
                            <h2>Injected Overlay</h2>
                            <button id="close-overlay">Close</button>
                         </div>`;

    document.body.appendChild(overlay);

    // Close button functionality
    document.getElementById("close-overlay").addEventListener("click", () => {
        overlay.remove();
    });
}
