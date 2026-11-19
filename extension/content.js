function sendExcuseUpdate() {
  // Guard: if extension context is invalidated (e.g. after reload), stop silently
  if (!chrome.runtime?.id) return;

  const excusedUntil = localStorage.getItem("zensprint_excused_until");
  const unblockedSite = localStorage.getItem("zensprint_unblocked_site") || "";
  let blockedSites = null;
  try {
    const saved = JSON.parse(localStorage.getItem("zensprint_blocked_domains") || "null");
    if (Array.isArray(saved)) blockedSites = saved;
  } catch { /* Use extension defaults for invalid settings. */ }

  chrome.runtime.sendMessage(
    {
      type: "UPDATE_EXCUSE",
      excusedUntil: excusedUntil ? parseInt(excusedUntil, 10) : 0,
      unblockedSite,
      blockedSites
    },
    () => {
      // Suppress "Receiving end does not exist" when service worker is sleeping (MV3 normal behaviour)
      if (chrome.runtime.lastError) {
        // intentionally ignored
      }
    }
  );
}

// Initial update on load
sendExcuseUpdate();

// Poll every 2s (reduced from 1s to lower overhead)
setInterval(sendExcuseUpdate, 2000);
