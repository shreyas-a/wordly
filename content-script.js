let word;

document.addEventListener('click', event => {
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
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  sendResponse({ selectedText: word });
});
