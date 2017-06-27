var count = 0;

document.addEventListener("click", function(event) {
  count += 1;
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  sendResponse({ count: count });
});
