// Service worker for VOT Chrome extension
// Handles notifications, CORS-bypassing fetch proxy, and toggle state

const ACTIVE_ICONS = {
  16: "icons/icon-16.png",
  32: "icons/icon-32.png",
  48: "icons/icon-48.png",
  128: "icons/icon-128.png",
};

const INACTIVE_ICONS = {
  16: "icons/icon-16-grey.png",
  32: "icons/icon-32-grey.png",
  48: "icons/icon-48-grey.png",
  128: "icons/icon-128-grey.png",
};

// Set icon based on current state on startup
chrome.runtime.onStartup.addListener(updateIcon);
chrome.runtime.onInstalled.addListener(() => {
  // Default to enabled on first install
  chrome.storage.local.get("votEnabled", (result) => {
    if (result.votEnabled === undefined) {
      chrome.storage.local.set({ votEnabled: true });
    }
    updateIcon();
  });
});

// Toggle on icon click
chrome.action.onClicked.addListener(async (tab) => {
  const { votEnabled } = await chrome.storage.local.get("votEnabled");
  const newState = !votEnabled;
  await chrome.storage.local.set({ votEnabled: newState });
  await updateIcon();

  // Notify all tabs about the state change
  const tabs = await chrome.tabs.query({});
  for (const t of tabs) {
    try {
      chrome.tabs.sendMessage(t.id, {
        type: "vot_toggle",
        enabled: newState,
      }).catch(() => {});
    } catch {}
  }
});

async function updateIcon() {
  const { votEnabled } = await chrome.storage.local.get("votEnabled");
  const enabled = votEnabled !== false; // default true
  const icons = enabled ? ACTIVE_ICONS : INACTIVE_ICONS;
  const title = enabled
    ? "VOT: Translation enabled (click to disable)"
    : "VOT: Translation disabled (click to enable)";

  await chrome.action.setIcon({ path: icons });
  await chrome.action.setTitle({ title });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "notification") {
    chrome.notifications.create({
      type: "basic",
      iconUrl: chrome.runtime.getURL("icons/icon-128.png"),
      title: message.title || "VOT",
      message: message.text || "",
    });
    sendResponse({ success: true });
  } else if (message.type === "fetch_proxy") {
    handleFetchProxy(message)
      .then((result) => {
        sendResponse(result);
      })
      .catch((err) => {
        console.warn("[VOT BG] fetch_proxy error:", message.url, err.message);
        sendResponse({ error: err.message });
      });
    return true; // keep message channel open for async response
  }
});

async function handleFetchProxy(message) {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    message.timeout || 15000,
  );

  try {
    let body = undefined;
    if (message.body != null) {
      if (Array.isArray(message.body)) {
        body = new Uint8Array(message.body).buffer;
      } else {
        body = message.body;
      }
    }

    const response = await fetch(message.url, {
      method: message.method || "GET",
      headers: message.headers || {},
      body,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const buffer = await response.arrayBuffer();
    const bodyArray = Array.from(new Uint8Array(buffer));
    const headers = Object.fromEntries(response.headers.entries());

    return {
      status: response.status,
      headers,
      body: bodyArray,
      url: response.url,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}
