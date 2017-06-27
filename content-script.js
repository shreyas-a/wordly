var selectedNode;

document.addEventListener("mouseup", function(event) {
  var range = window.getSelection().getRangeAt(0);
  selectedNode = range.cloneContents();

  if (selectedNode.textContent && selectedNode.textContent.length) {
    // Ssending message to background
    chrome.runtime.sendMessage({
      type: "notification",
      options: {
        type: "basic",
        iconUrl: chrome.extension.getURL("icons/icon-128.png"),
        title: "Wordly",
        message: selectedNode.textContent
      }
    });
  }
});

// Listening messages from extention (popup) or background
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  sendResponse({ selectedText: selectedNode.textContent });
});
