var isShown = false;
var app_id = '49a3467d';
var app_key = '4a16c9745036f8529e7b69f59634b696';

var headers = new Headers({
  Accept: 'application/json',
  app_id: app_id,
  app_key: app_key,
});

// Listening all messages
chrome.runtime.onMessage.addListener(function(request) {
  var code = '';

  function sendCode(code) {
    chrome.tabs.executeScript(null, {
      code: code,
    });
  }

  if (request.word && !isShown) {
    var url = 'https://od-api.oxforddictionaries.com/api/v1/entries/en/' + request.word;

    fetch(
      new Request(url, {
        headers: new Headers(headers),
      })
    )
      .then(function(res) {
        return res.json();
      })
      .then(function(out) {
        console.log('Checkout this JSON! ', out);
        code = [
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
            'background-color: #d1f3ff;' +
            'font-size: 14px;' +
            'line-height: normal;' +
            'padding: 9px;' +
            'position: absolute;' +
            'z-index: 99999;' +
            'width: 300px;");',
          'document.body.appendChild(d);',
        ].join('\n');
        isShown = true;
        sendCode(code);
      })
      .catch(function(err) {
        console.error(err);
      });
  } else {
    code = ['var d = document.getElementById("wordly");', 'd && (d.outerHTML="");'].join('\n');
    isShown = false;
    sendCode(code);
  }
});
