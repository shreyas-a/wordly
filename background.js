let isShown = false;
const appId = '49a3467d';
const appKey = '4a16c9745036f8529e7b69f59634b696';
const NOT_FOUND_MEANING = 'Definition not found'

let wordsList = [];
let wordsDict = {};

const headers = new Headers({
  Accept: 'application/json',
  app_id: appId,
  app_key: appKey,
});

// Getting all saved words
chrome.storage.sync.get(stores => {
  wordsList = stores.wordly || [];
  wordsList.forEach((item) => {wordsDict[item.word] = item.meaning})
});

// Listening all messages
chrome.runtime.onMessage.addListener(request => {
  let code = '';
  let meaning = NOT_FOUND_MEANING;

  function sendCode(finalCode) {
    chrome.tabs.executeScript(null, {
      code: finalCode,
    });
  }

  function showLoading() {
    const { word } = request;
    const loadingLabel = "<div class='wordly_loader'></div>Loading...";
    code = [
      'var d = document.createElement("div");',
      'd.setAttribute("id","wordly")',
      'd.setAttribute("class","wordly_meaning")',
      `d.innerHTML="<span>${word}</span>${loadingLabel}"`,
      `${'d.setAttribute("style", "top: '}${request.y + 25}px;` +
        `left: ${request.x - 25}px;");` +
        'document.body.appendChild(d);',
    ].join('\n');

    isShown = true;
    sendCode(code);
  }

  function showMeaning() {
    const { word } = request;

    code = [
      'var d = document.getElementById("wordly")',
      `d.innerHTML="<span>${word}</span>${meaning}"`,
    ].join('\n');
    isShown = true;
    sendCode(code);

    if (meaning !== NOT_FOUND_MEANING) {
      if (wordsList && wordsList.length) {
        wordsList.push({ word, meaning });
      } else {
        wordsList = [];
        wordsList.push({ word, meaning });
      }

      wordsDict[word] = meaning
      chrome.storage.sync.set({ wordly: wordsList }, () => {});
    }
  }

  if (request.word && !isShown) {
    showLoading()

    // check if already have in local storage or not
    if (wordsDict[request.word] && wordsDict[request.word] !== NOT_FOUND_MEANING) {
      console.log('Found in local')
      meaning = wordsDict[request.word]
      showMeaning()
      return
    }

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
