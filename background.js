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
  var meaning = 'Defenition not found';

  function sendCode(code) {
    chrome.tabs.executeScript(null, {
      code: code,
    });
  }

  function showMeaning() {
    var word = request.word;
    console.log(word, ' : ', meaning);
    code = [
      'var d = document.createElement("div");',
      'd.setAttribute("id","wordly")',
      'd.innerHTML="' + word + ' - ' + meaning + '"',
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
  }

  if (request.word && !isShown) {
    var url = 'https://od-api.oxforddictionaries.com/api/v1/';

    // First search meaning for selected word
    fetch(
      new Request(url + 'entries/en/' + request.word, {
        headers: new Headers(headers),
      })
    )
      .then(function(res) {
        if (res && res.status !== 404) {
          // Word exists
          return res.json();
        }

        // Word doesn't exist
        // Checking related words for the word
        return fetch(
          new Request(url + 'inflections/en/' + request.word, {
            headers: new Headers(headers),
          })
        )
          .then(function(res) {
            if (res && res.status !== 404) {
              return res.json();
            }
          })
          .then(function(res) {
            // Search meaning for related word
            if (
              res &&
              res.results &&
              res.results.length &&
              res.results[0].lexicalEntries &&
              res.results[0].lexicalEntries.length &&
              res.results[0].lexicalEntries[0].inflectionOf.length &&
              res.results[0].lexicalEntries[0].inflectionOf[0].id
            ) {
              console.log('Searching for: ', res.results[0].lexicalEntries[0].inflectionOf[0].id);

              return fetch(
                new Request(url + 'entries/en/' + res.results[0].lexicalEntries[0].inflectionOf[0].id, {
                  headers: new Headers(headers),
                })
              ).then(function(res) {
                return res.json();
              });
            }

            // No related wordsd found
            // Reject Promise
            return Promise.reject();
          });
      })
      .then(function(out) {
        if (
          out &&
          out.results &&
          out.results.length &&
          out.results[0].lexicalEntries &&
          out.results[0].lexicalEntries.length &&
          out.results[0].lexicalEntries[0].entries &&
          out.results[0].lexicalEntries[0].entries.length &&
          out.results[0].lexicalEntries[0].entries[0].senses &&
          out.results[0].lexicalEntries[0].entries[0].senses.length &&
          out.results[0].lexicalEntries[0].entries[0].senses[0].definitions &&
          out.results[0].lexicalEntries[0].entries[0].senses[0].definitions.length &&
          out.results[0].lexicalEntries[0].entries[0].senses[0].definitions[0]
        ) {
          meaning = out.results[0].lexicalEntries[0].entries[0].senses[0].definitions[0];
        }
        showMeaning();
      })
      .catch(function(err) {
        console.error(err);
        showMeaning();
      });
  } else {
    code = ['var d = document.getElementById("wordly");', 'd && (d.outerHTML="");'].join('\n');
    isShown = false;
    sendCode(code);
  }
});
