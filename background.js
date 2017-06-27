// Listening all messages
chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.word) {
    var code = [
      'var d = document.createElement("div");',
      "d.innerHTML='" + request.word + "'",
      'd.setAttribute("style", "' +
        "border: 1px solid #999;" +
        "top: 1px;" +
        "left: 1px;" +
        "border-radius: 4px;" +
        "box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);" +
        "color: #222;" +
        "font-size: 14px;" +
        "line-height: normal;" +
        "padding: 9px;" +
        "position: absolute;" +
        'width: 300px;");',
      "document.body.appendChild(d);"
    ].join("\n");

    chrome.tabs.executeScript(null, {
      code: code
    });
  }
});
