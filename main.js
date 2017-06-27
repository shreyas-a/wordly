var selectedNode;

document.addEventListener("mouseup", function(event) {
  var range = window.getSelection().getRangeAt(0);
  selectedNode = range.cloneContents();
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  sendResponse({ selectedText: selectedNode.textContent });
});
