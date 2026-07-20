document.addEventListener("DOMContentLoaded", async () => {
  const urlInput = document.getElementById("urlInput");
  const saveBtn = document.getElementById("saveBtn");
  const status = document.getElementById("status");

  // Load saved URL
  const data = await chrome.storage.local.get("zensprintUrl");
  const currentUrl = data.zensprintUrl || "http://localhost:5173";
  urlInput.value = currentUrl;

  // Save on button click
  saveBtn.addEventListener("click", async () => {
    let rawUrl = urlInput.value.trim();
    if (!rawUrl) {
      status.textContent = "URL cannot be empty!";
      status.style.color = "#f87171";
      return;
    }

    // Remove trailing slash if present
    if (rawUrl.endsWith("/")) {
      rawUrl = rawUrl.slice(0, -1);
    }

    // Ensure it starts with http or https
    if (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
      rawUrl = "https://" + rawUrl;
      urlInput.value = rawUrl;
    }

    await chrome.storage.local.set({ zensprintUrl: rawUrl });
    status.textContent = "Saved successfully!";
    status.style.color = "#2dd4bf";
    setTimeout(() => {
      status.textContent = "";
    }, 2000);
  });
});
