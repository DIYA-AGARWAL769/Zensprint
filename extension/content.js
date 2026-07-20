function sendExcuseUpdate() {
  try {
    const excusedUntil = localStorage.getItem("zensprint_excused_until");
    const unblockedSite = localStorage.getItem("zensprint_unblocked_site") || "";
    chrome.runtime.sendMessage({
      type: "UPDATE_EXCUSE",
      excusedUntil: excusedUntil ? parseInt(excusedUntil, 10) : 0,
      unblockedSite: unblockedSite
    });
  } catch (err) {
    console.error("ZenSprint content script error:", err);
  }
}

// Initial update on load
sendExcuseUpdate();

// Poll periodically to keep in sync (lightweight)
setInterval(sendExcuseUpdate, 1000);
