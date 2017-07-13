// Listening all messages
chrome.runtime.onMessage.addListener(function(request) {
  if (request.word) {
    // Double Click
    var code = [
      'var d = document.createElement("div");',
      'd.setAttribute("id","wordly")',
      'd.innerHTML="' + request.word + '"',
      'd.setAttribute("style", "' +
        'border: 1px solid #999;' +
        'top: ' +
        request.y +
        'px;' +
        'left: ' +
        request.x +
        'px;' +
        'border-radius: 4px;' +
        'box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);' +
        'color: #222;' +
        'font-size: 14px;' +
        'line-height: normal;' +
        'padding: 9px;' +
        'position: absolute;' +
        'width: 300px;");',
      'document.body.appendChild(d);',
    ].join('\n');
  } else {
    // Single Click
    code = 'document.getElementById("wordly").outerHTML="";';
  }

  chrome.tabs.executeScript(null, {
    code: code,
  });
});
