const DEFAULT_BLOCKED_DOMAINS = [
  "youtube.com", "reddit.com", "facebook.com", "twitter.com",
  "instagram.com", "tiktok.com", "linkedin.com", "netflix.com",
  "twitch.tv", "discord.com", "pinterest.com"
];

async function updateRedirectRules(zensprintUrl, unblockedSite = "") {
  try {
    // 1. Get all current dynamic rules
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const ruleIdsToRemove = existingRules.map((r) => r.id);

    // If URL is empty, just clear rules (unblock sites)
    if (!zensprintUrl) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: ruleIdsToRemove
      });
      console.log("ZenSprint dynamic rules cleared (sites unblocked).");
      return;
    }

    // Filter out the unblocked domain
    const domainsToBlock = DEFAULT_BLOCKED_DOMAINS.filter(
      (domain) => domain !== unblockedSite
    );

    // If no domains are left to block, just clear rules
    if (domainsToBlock.length === 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: ruleIdsToRemove
      });
      console.log("All blocked domains are currently unblocked.");
      return;
    }

    // 2. Generate new rules
    const newRules = domainsToBlock.map((domain, index) => {
      const id = index + 1;
      return {
        id,
        priority: 1,
        action: {
          type: "redirect",
          redirect: {
            url: `${zensprintUrl}/?distracted_by=${domain}`
          }
        },
        condition: {
          urlFilter: `*://*.${domain}/*`,
          resourceTypes: ["main_frame"]
        }
      };
    });

    // 3. Update dynamic rules
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: ruleIdsToRemove,
      addRules: newRules
    });
    console.log(`ZenSprint dynamic rules updated. Unblocked site: ${unblockedSite || "none"}`);
  } catch (error) {
    console.error("Failed to update redirect rules:", error);
  }
}

// Listen for updates from storage
chrome.storage.onChanged.addListener((changes) => {
  if (changes.zensprintUrl) {
    updateRedirectRules(changes.zensprintUrl.newValue);
  }
});

// On startup/install, check current URL
chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.local.get("zensprintUrl");
  if (data.zensprintUrl) {
    updateRedirectRules(data.zensprintUrl);
  } else {
    const defaultUrl = "http://localhost:5173";
    await chrome.storage.local.set({ zensprintUrl: defaultUrl });
    updateRedirectRules(defaultUrl);
  }
});

chrome.runtime.onStartup.addListener(async () => {
  const data = await chrome.storage.local.get("zensprintUrl");
  if (data.zensprintUrl) {
    updateRedirectRules(data.zensprintUrl);
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(async (message) => {
  if (message.type === "UPDATE_EXCUSE") {
    const excusedUntil = message.excusedUntil;
    const unblockedSite = message.unblockedSite || "";
    const now = Date.now();

    // Clear existing alarm
    await chrome.alarms.clear("excuse-expiry");

    const data = await chrome.storage.local.get("zensprintUrl");
    const zensprintUrl = data.zensprintUrl || "http://localhost:5173";

    if (excusedUntil && excusedUntil > now) {
      console.log(`User is excused until ${new Date(excusedUntil).toLocaleTimeString()}. Unblocking ONLY: ${unblockedSite || "none"}`);
      // Update rules, unblocking ONLY the specified site
      await updateRedirectRules(zensprintUrl, unblockedSite);

      // Set a chrome alarm to re-block when excuse expires
      chrome.alarms.create("excuse-expiry", { when: excusedUntil });
    } else {
      // Not excused. Ensure rules are active.
      await updateRedirectRules(zensprintUrl);
    }
  }
});

// Listen for alarms (e.g. excuse expiration)
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "excuse-expiry") {
    console.log("Excuse expired! Re-enabling redirect rules to block all sites.");
    const data = await chrome.storage.local.get("zensprintUrl");
    const zensprintUrl = data.zensprintUrl || "http://localhost:5173";
    await updateRedirectRules(zensprintUrl);
  }
});
