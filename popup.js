chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function(tabs) {
    alert('Tabs: ' + JSON.stringify(tabs))
  });