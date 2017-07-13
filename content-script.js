var word;

document.addEventListener('click', function(event) {
  var range = window.getSelection().getRangeAt(0);
  var selectedNode = range.cloneContents();

  if (selectedNode.textContent && selectedNode.textContent.length) {
    word = selectedNode.textContent.split(' ')[0];
  } else {
    word = null;
  }

  chrome.runtime.sendMessage({
    word: word,
    x: event.clientX,
    y: event.clientY,
  });
});

// Listening messages from extention (popup) or background
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  sendResponse({ selectedText: word });
});
