const DEFAULT_ZENSPRINT_URL = "https://zensprint-vy33.vercel.app";

document.addEventListener("DOMContentLoaded", async () => {
  const urlInput = document.getElementById("urlInput");
  const data = await chrome.storage.local.get("zensprintUrl");
  urlInput.value = data.zensprintUrl || DEFAULT_ZENSPRINT_URL;
});
