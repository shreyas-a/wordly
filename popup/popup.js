chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, { details: "count" }, function(response) {
    document.getElementById("count").innerText = response.selectedText;
  });
});
