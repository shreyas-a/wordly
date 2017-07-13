var word,
  clickCount = 0;

function sendMessage(event) {
  // Sending message to background
  chrome.runtime.sendMessage({
    word: word,
    x: event.clientX,
    y: event.clientY,
  });
}

function singleClick(event) {
  word = null;
  sendMessage(event);
}

function doubleClick(event) {
  var range = window.getSelection().getRangeAt(0);
  var selectedNode = range.cloneContents();

  if (selectedNode.textContent && selectedNode.textContent.length) {
    word = selectedNode.textContent.split(' ')[0];
  } else {
    word = null;
  }
  sendMessage(event);
}

document.addEventListener('click', function(event) {
  clickCount++;
  if (clickCount === 1) {
    singleClickTimer = setTimeout(function() {
      clickCount = 0;
      singleClick(event);
    }, 400);
  } else if (clickCount === 2) {
    clearTimeout(singleClickTimer);
    clickCount = 0;
    doubleClick(event);
  }
});

// Listening messages from extention (popup) or background
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  sendResponse({ selectedText: word });
});
