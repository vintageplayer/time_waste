import TimeWasteCounter from "./TimeWasteCounter";

let timeWasteCounter: TimeWasteCounter | null = null;

function initializeTimeWasteCounter(): void {
  if (document.body) {
    timeWasteCounter = new TimeWasteCounter();
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      timeWasteCounter = new TimeWasteCounter();
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeTimeWasteCounter);
} else {
  initializeTimeWasteCounter();
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.action === "resetTimer" && timeWasteCounter) {
    timeWasteCounter.reset();
    sendResponse({ success: true, message: "Timer reset successfully" });
  } else if (msg.action === "getElapsedTime" && timeWasteCounter) {
    const elapsedTime = timeWasteCounter.getFormattedTime();
    sendResponse({ success: true, elapsedTime });
  } else if (msg.color) {
    console.log("Receive color = " + msg.color);
    document.body.style.backgroundColor = msg.color;
    sendResponse("Change color to " + msg.color);
  } else {
    sendResponse("Unknown message type.");
  }
});
