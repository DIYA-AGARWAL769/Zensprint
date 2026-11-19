const DEFAULT_BLOCKED_DOMAINS = [
  "youtube.com", "reddit.com", "facebook.com", "twitter.com",
  "instagram.com", "tiktok.com", "linkedin.com", "netflix.com",
  "twitch.tv", "discord.com", "pinterest.com"
];
const DEFAULT_ZENSPRINT_URL = "https://zensprint-vy33.vercel.app";

let wasExcused = false;
let redirectUpdateQueue = Promise.resolve();

async function checkAndRedirectBlockedTabs(zensprintUrl, blockedSites = DEFAULT_BLOCKED_DOMAINS) {
  try {
    if (!zensprintUrl) return;
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (!tab.url) continue;
      // Skip if already on ZenSprint page
      if (tab.url.startsWith(zensprintUrl) || tab.url.includes("distracted_by=")) continue;

      for (const domain of blockedSites) {
        if (new URL(tab.url).hostname === domain || new URL(tab.url).hostname.endsWith(`.${domain}`)) {
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

function updateRedirectRules(zensprintUrl, unblockedSite = "", blockedSites = DEFAULT_BLOCKED_DOMAINS, breakActive = false) {
  // Chrome can fire the storage-change and install/startup events together.
  // Serialize them so two calls cannot both add the same dynamic rule IDs.
  redirectUpdateQueue = redirectUpdateQueue
    .then(() => applyRedirectRules(zensprintUrl, unblockedSite, blockedSites, breakActive))
    .catch((error) => {
      console.error("Failed to update redirect rules:", error?.message ?? error);
    });
  return redirectUpdateQueue;
}

async function applyRedirectRules(zensprintUrl, unblockedSite = "", blockedSites = DEFAULT_BLOCKED_DOMAINS, breakActive = false) {
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const ruleIdsToRemove = existingRules.map((rule) => rule.id);

  if (!zensprintUrl) {
    if (ruleIdsToRemove.length) {
      await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: ruleIdsToRemove });
    }
    console.log("ZenSprint dynamic rules cleared (sites unblocked).");
    return;
  }

  const cleanUnblocked = unblockedSite ? unblockedSite.toLowerCase().trim() : "";
  // A break without a single-site exception unlocks every selected site.
  // A single-site exception keeps the other selected sites blocked.
  const domainsToBlock = (breakActive && !cleanUnblocked ? [] : blockedSites).filter((domain) => {
    if (!DEFAULT_BLOCKED_DOMAINS.includes(domain)) return false;
    if (!cleanUnblocked) return true;
    return domain !== cleanUnblocked && !domain.endsWith(`.${cleanUnblocked}`);
  });

  const newRules = domainsToBlock.map((domain, index) => ({
    id: index + 1,
    priority: 1,
    action: {
      type: "redirect",
      redirect: { url: `${zensprintUrl}/?distracted_by=${domain}` }
    },
    condition: {
      // `||domain` matches the domain and its subdomains.
      urlFilter: `||${domain}`,
      resourceTypes: ["main_frame"]
    }
  }));

  const currentById = new Map(existingRules.map((rule) => [rule.id, rule]));
  const alreadyCurrent = existingRules.length === newRules.length && newRules.every((rule) => {
    const current = currentById.get(rule.id);
    return current &&
      current.priority === rule.priority &&
      current.action?.type === rule.action.type &&
      current.action?.redirect?.url === rule.action.redirect.url &&
      current.condition?.urlFilter === rule.condition.urlFilter &&
      JSON.stringify(current.condition?.resourceTypes) === JSON.stringify(rule.condition.resourceTypes);
  });

  if (alreadyCurrent) return;

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: ruleIdsToRemove,
    addRules: newRules
  });
  console.log(`ZenSprint dynamic rules updated. Unblocked site: ${unblockedSite || "none"}`);
}

// Listen for updates from storage
chrome.storage.onChanged.addListener((changes) => {
  if (changes.zensprintUrl) {
    chrome.storage.local.get("blockedSites").then((config) => {
      const blockedSites = Array.isArray(config.blockedSites) ? config.blockedSites : DEFAULT_BLOCKED_DOMAINS;
      updateRedirectRules(changes.zensprintUrl.newValue, "", blockedSites);
    });
  }
});

// On startup/install, check current URL
chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.local.set({ zensprintUrl: DEFAULT_ZENSPRINT_URL });
  const config = await chrome.storage.local.get("blockedSites");
  const blockedSites = Array.isArray(config.blockedSites) ? config.blockedSites : DEFAULT_BLOCKED_DOMAINS;
  updateRedirectRules(DEFAULT_ZENSPRINT_URL, "", blockedSites);
});

chrome.runtime.onStartup.addListener(async () => {
  const data = await chrome.storage.local.get("zensprintUrl");
  const zensprintUrl = data.zensprintUrl || DEFAULT_ZENSPRINT_URL;
  if (!data.zensprintUrl) await chrome.storage.local.set({ zensprintUrl });
  const config = await chrome.storage.local.get("blockedSites");
  updateRedirectRules(zensprintUrl, "", Array.isArray(config.blockedSites) ? config.blockedSites : DEFAULT_BLOCKED_DOMAINS);
});

// Listen for messages from content scripts
// NOTE: Must NOT be declared async — must return `true` synchronously so Chrome
// keeps the message port open while the inner async function awaits.
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== "UPDATE_EXCUSE") return false;

  async function handle() {
    const excusedUntil = message.excusedUntil;
    const unblockedSite = message.unblockedSite || "";
    const blockedSites = Array.isArray(message.blockedSites)
      ? message.blockedSites.filter((domain) => DEFAULT_BLOCKED_DOMAINS.includes(domain))
      : DEFAULT_BLOCKED_DOMAINS;
    if (Array.isArray(message.blockedSites)) await chrome.storage.local.set({ blockedSites });
    const now = Date.now();

    const data = await chrome.storage.local.get("zensprintUrl");
    const zensprintUrl = data.zensprintUrl || DEFAULT_ZENSPRINT_URL;

    if (excusedUntil && excusedUntil > now) {
      wasExcused = true;
      console.log(`User is excused until ${new Date(excusedUntil).toLocaleTimeString()}. Unblocking ONLY: ${unblockedSite || "none"}`);
      await updateRedirectRules(zensprintUrl, unblockedSite, blockedSites, true);

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
        await updateRedirectRules(zensprintUrl, "", blockedSites);
        await checkAndRedirectBlockedTabs(zensprintUrl, blockedSites);
      } else {
        await updateRedirectRules(zensprintUrl, "", blockedSites);
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
    const config = await chrome.storage.local.get("blockedSites");
    const blockedSites = Array.isArray(config.blockedSites) ? config.blockedSites : DEFAULT_BLOCKED_DOMAINS;
    await updateRedirectRules(zensprintUrl, "", blockedSites);
    await checkAndRedirectBlockedTabs(zensprintUrl, blockedSites);
  }
});
