var selectedNode;

document.addEventListener("mouseup", function(event) {
  var range = window.getSelection().getRangeAt(0);
  selectedNode = range.cloneContents();

  if (selectedNode.textContent && selectedNode.textContent.length) {
    // Ssending message to background
    chrome.runtime.sendMessage({
      word: selectedNode.textContent
    });
  }
});

// Listening messages from extention (popup) or background
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  sendResponse({ selectedText: selectedNode.textContent });
});
