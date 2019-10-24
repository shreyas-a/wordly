let word;
let cachedWords;

// In case of ugly text selections
function addSlashes( str ) {
    return str.slice().replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}

document.addEventListener('click', event => {
  // TODO: Failed to execute 'getRangeAt' on 'Selection': 0 is not a valid index.
  const range = window.getSelection().getRangeAt(0);
  const selectedNode = range.cloneContents();

  if (selectedNode.textContent && selectedNode.textContent.length) {
    [word] = selectedNode.textContent.split(' ');
    word = addSlashes(word);
  } else {
    word = null;
  }

  chrome.runtime.sendMessage({
    word,
    x:
      event.clientX +
      (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft),
    y:
      event.clientY +
      (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop),
  });
});

// Listening messages from extention (popup) or background
chrome.extension.onMessage.addListener((request, sender, sendResponse) => {
  if (request.method) {
    if (request.method === 'wordly-get') {
      chrome.storage.sync.get({ wordly: [] }, stores => {
        cachedWords = stores.wordly;
        sendResponse({ wordly: stores.wordly });
      });
    } else if (request.method === 'wordly-remove') {
      const wordToRemove = request.word;
      if (!wordToRemove) {
        return true;
      }
      // Can improve the efficiency of this if words are stored in a hash structure
      const index = cachedWords.findIndex(obj => obj.word === wordToRemove);
      cachedWords.splice(index, 1);
      chrome.storage.sync.set({ wordly: cachedWords });
    }
  }
  return true;
});
