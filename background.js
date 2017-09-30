let isShown = false;
const appId = '49a3467d';
const appKey = '4a16c9745036f8529e7b69f59634b696';

const headers = new Headers({
  Accept: 'application/json',
  app_id: appId,
  app_key: appKey,
});

// Listening all messages
chrome.runtime.onMessage.addListener(request => {
  let code = '';
  let meaning = 'defenition not found';

  function sendCode(finalCode) {
    chrome.tabs.executeScript(null, {
      code: finalCode,
    });
  }

  function showMeaning() {
    const { word } = request;

    code = [
      'var d = document.createElement("div");',
      'd.setAttribute("id","wordly")',
      'd.setAttribute("class","wordly_popup")',
      `d.innerHTML="${word} - ${meaning}"`,
      `${'d.setAttribute("style", "top: '}${request.y}px;` +
        `left: ${request.x}px;");` +
        'document.body.appendChild(d);',
    ].join('\n');
    isShown = true;
    sendCode(code);
  }

  if (request.word && !isShown) {
    const url = 'https://od-api.oxforddictionaries.com/api/v1/';

    // First search meaning for selected word
    fetch(
      new Request(`${url}entries/en/${request.word}`, {
        headers: new Headers(headers),
      })
    )
      .then(res => {
        if (res && res.status === 200) {
          // Word exists
          return res.json();
        }

        // Word doesn't exist
        // Checking related words for the word
        console.log('Searching for related words');
        return fetch(
          new Request(`${url}inflections/en/${request.word}`, {
            headers: new Headers(headers),
          })
        )
          .then(similarWordsResponse => {
            if (similarWordsResponse && similarWordsResponse.status === 200) {
              return similarWordsResponse.json();
            }
            return Promise.reject();
          })
          .then(relatedListResponse => {
            // Search meaning for related word
            if (
              relatedListResponse &&
              relatedListResponse.results &&
              relatedListResponse.results.length &&
              relatedListResponse.results[0].lexicalEntries &&
              relatedListResponse.results[0].lexicalEntries.length &&
              relatedListResponse.results[0].lexicalEntries[0].inflectionOf.length &&
              relatedListResponse.results[0].lexicalEntries[0].inflectionOf[0].id
            ) {
              console.log(
                'Searching meaning for: ',
                relatedListResponse.results[0].lexicalEntries[0].inflectionOf[0].id
              );

              return fetch(
                new Request(`${url}entries/en/${relatedListResponse.results[0].lexicalEntries[0].inflectionOf[0].id}`, {
                  headers: new Headers(headers),
                })
              ).then(relatedMeaningResponse => relatedMeaningResponse.json());
            }

            // No related word found
            // Reject Promise
            return Promise.reject();
          });
      })
      .then(out => {
        if (
          out &&
          out.results &&
          out.results.length &&
          out.results[0].lexicalEntries &&
          out.results[0].lexicalEntries.length &&
          out.results[0].lexicalEntries[0].entries &&
          out.results[0].lexicalEntries[0].entries.length &&
          out.results[0].lexicalEntries[0].entries[0].senses &&
          out.results[0].lexicalEntries[0].entries[0].senses.length
        ) {
          if (
            out.results[0].lexicalEntries[0].entries[0].senses[0].definitions &&
            out.results[0].lexicalEntries[0].entries[0].senses[0].definitions.length
          ) {
            [meaning] = out.results[0].lexicalEntries[0].entries[0].senses[0].definitions;
          } else if (
            out.results[0].lexicalEntries[0].entries[0].senses[0].crossReferenceMarkers &&
            out.results[0].lexicalEntries[0].entries[0].senses[0].crossReferenceMarkers.length
          ) {
            [meaning] = out.results[0].lexicalEntries[0].entries[0].senses[0].crossReferenceMarkers;
          }
        }
        showMeaning();
      })
      .catch(() => {
        showMeaning();
      });
  } else {
    code = ['var d = document.getElementById("wordly");', 'd && (d.outerHTML="");'].join('\n');
    isShown = false;
    sendCode(code);
  }
});
