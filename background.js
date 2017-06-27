// Listening all messages
chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.word) {
    chrome.tabs.executeScript(null, {
      code: 'document.body.append("Wordly: ' + request.word + '");'
    });
  }
});
