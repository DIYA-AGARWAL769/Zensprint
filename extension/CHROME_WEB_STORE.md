# Chrome Web Store release notes

## Store listing draft

- **Name:** ZenSprint Focus Cop
- **Short description:** Redirect distracting websites to your ZenSprint dashboard during focus sessions.
- **Single purpose:** Redirect selected distracting websites to a user's ZenSprint dashboard during focus sessions and restore access when a temporary break expires.
- **Category:** Productivity
- **Privacy policy URL:** `https://zensprint-vy33.vercel.app/privacy.html`
- **Distribution:** Public

### Permission justifications

- `declarativeNetRequest`: redirect navigation to the selected distracting-site domains to the ZenSprint dashboard.
- `storage`: remember the dashboard URL and temporary redirect configuration locally.
- `alarms`: restore redirect rules when an allowed break expires.
- `tabs`: find and redirect already-open blocked tabs when a break expires.
- Website host permissions: apply redirects only to the listed distracting domains and run the small exception-sync script on the ZenSprint dashboard. The script reads only the dashboard's temporary break and unblocked-site settings.

### Privacy declarations to complete in the dashboard

- The extension processes web browsing activity for the named user-facing redirect feature.
- A matching domain is passed to the ZenSprint dashboard and, when the user is signed in, is sent to the backend for a distraction log.
- The extension does not read page contents, form data, passwords, or the ZenSprint authentication token.
- The extension does not sell user data or use it for advertising.

Before submission, confirm these statements match the final code and choose the appropriate Chrome Web Store data-use declarations. Add a support contact to the listing so users can reach the developer.

## Release checklist

1. Confirm the production dashboard is live at `https://zensprint-vy33.vercel.app` and the privacy policy is live at the URL above.
2. Zip the contents of this `extension` directory (the `manifest.json` must be at the ZIP root).
3. In the Chrome Web Store Developer Dashboard, upload the ZIP, complete the store listing and privacy declarations, add at least one 1280x800 screenshot, then submit for review.
4. Chrome Web Store publishing requires an enrolled developer account with 2-Step Verification enabled.
