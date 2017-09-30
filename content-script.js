let word;

document.addEventListener('click', event => {
  // TODO: Failed to execute 'getRangeAt' on 'Selection': 0 is not a valid index.
  const range = window.getSelection().getRangeAt(0);
  const selectedNode = range.cloneContents();

  if (selectedNode.textContent && selectedNode.textContent.length) {
    [word] = selectedNode.textContent.split(' ');
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
  if (request.method && request.method === 'wordly') {
    chrome.storage.sync.get({ wordly: [] }, stores => {
      sendResponse({ wordly: stores.wordly });
    });
  }
  return true;
});
