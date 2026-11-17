const DEFAULT_BLOCKED_DOMAINS = [
  "youtube.com", "reddit.com", "facebook.com", "twitter.com",
  "instagram.com", "tiktok.com", "linkedin.com", "netflix.com",
  "twitch.tv", "discord.com", "pinterest.com"
];
const DEFAULT_ZENSPRINT_URL = "https://zensprint-vy33.vercel.app";

let wasExcused = false;

async function checkAndRedirectBlockedTabs(zensprintUrl) {
  try {
    if (!zensprintUrl) return;
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (!tab.url) continue;
      // Skip if already on ZenSprint page
      if (tab.url.startsWith(zensprintUrl) || tab.url.includes("distracted_by=")) continue;

      for (const domain of DEFAULT_BLOCKED_DOMAINS) {
        if (tab.url.includes(domain)) {
          const redirectTarget = `${zensprintUrl}/?distracted_by=${domain}`;
          console.log(`Redirecting tab ${tab.id} (${tab.url}) to ${redirectTarget}`);
          chrome.tabs.update(tab.id, { url: redirectTarget });
          break;
        }
      }
    }
  } catch (err) {
    console.error("Failed to redirect blocked tabs:", err);
  }
}

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

    // Filter out the unblocked domain cleanly
    const cleanUnblocked = unblockedSite ? unblockedSite.toLowerCase().trim() : "";
    const domainsToBlock = DEFAULT_BLOCKED_DOMAINS.filter((domain) => {
      if (!cleanUnblocked) return true;
      return !domain.includes(cleanUnblocked) && !cleanUnblocked.includes(domain);
    });

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
          // `||domain` is declarativeNetRequest URL-filter syntax (NOT a match pattern).
          // `||` anchors at the start of any subdomain, so it matches both
          // "youtube.com" and "www.youtube.com" without needing *://*.
          urlFilter: `||${domain}`,
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
    console.error("Failed to update redirect rules:", error?.message ?? error);
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
  await chrome.storage.local.set({ zensprintUrl: DEFAULT_ZENSPRINT_URL });
  updateRedirectRules(DEFAULT_ZENSPRINT_URL);
});

chrome.runtime.onStartup.addListener(async () => {
  const data = await chrome.storage.local.get("zensprintUrl");
  const zensprintUrl = data.zensprintUrl || DEFAULT_ZENSPRINT_URL;
  if (!data.zensprintUrl) await chrome.storage.local.set({ zensprintUrl });
  updateRedirectRules(zensprintUrl);
});

// Listen for messages from content scripts
// NOTE: Must NOT be declared async — must return `true` synchronously so Chrome
// keeps the message port open while the inner async function awaits.
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== "UPDATE_EXCUSE") return false;

  async function handle() {
    const excusedUntil = message.excusedUntil;
    const unblockedSite = message.unblockedSite || "";
    const now = Date.now();

    const data = await chrome.storage.local.get("zensprintUrl");
    const zensprintUrl = data.zensprintUrl || DEFAULT_ZENSPRINT_URL;

    if (excusedUntil && excusedUntil > now) {
      wasExcused = true;
      console.log(`User is excused until ${new Date(excusedUntil).toLocaleTimeString()}. Unblocking ONLY: ${unblockedSite || "none"}`);
      await updateRedirectRules(zensprintUrl, unblockedSite);

      // Only recreate alarm if not already scheduled for this exact timestamp
      const existingAlarm = await chrome.alarms.get("excuse-expiry");
      if (!existingAlarm || Math.abs(existingAlarm.scheduledTime - excusedUntil) > 2000) {
        await chrome.alarms.clear("excuse-expiry");
        chrome.alarms.create("excuse-expiry", { when: excusedUntil });
      }
    } else {
      // Not excused — if excuse was previously active and now expired, redirect open blocked tabs
      if (wasExcused) {
        wasExcused = false;
        console.log("Excuse expired! Re-enabling redirect rules & redirecting open blocked tabs.");
        await chrome.alarms.clear("excuse-expiry");
        await updateRedirectRules(zensprintUrl);
        await checkAndRedirectBlockedTabs(zensprintUrl);
      } else {
        await updateRedirectRules(zensprintUrl);
      }
    }
    sendResponse({ ok: true });
  }

  handle().catch(console.error);
  return true; // Keep message channel open for async response
});

// Listen for alarms (e.g. excuse expiration)
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "excuse-expiry") {
    wasExcused = false;
    console.log("Excuse expired via alarm! Re-enabling redirect rules & redirecting open blocked tabs.");
    const data = await chrome.storage.local.get("zensprintUrl");
    const zensprintUrl = data.zensprintUrl || DEFAULT_ZENSPRINT_URL;
    await updateRedirectRules(zensprintUrl);
    await checkAndRedirectBlockedTabs(zensprintUrl);
  }
});
