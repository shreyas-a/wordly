window.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs && tabs.length) {
      chrome.tabs.sendMessage(tabs[0].id, { method: 'wordly' }, response => {
        if (chrome.runtime.lastError) {
          console.log('ERROR: ', chrome.runtime.lastError);
        } else if (response.wordly && response.wordly.length) {
          document.getElementById('wordlyWordsList').innerHTML = '';
          response.wordly.forEach(wordlyItem => {
            const newLI = document.createElement('li');
            newLI.appendChild(document.createTextNode(`${wordlyItem.word} - ${wordlyItem.meaning}`));
            document.getElementById('wordlyWordsList').appendChild(newLI);
          });
        } else {
          const newLI = document.createElement('li');
          newLI.appendChild(document.createTextNode('No words'));
          document.getElementById('wordlyWordsList').appendChild(newLI);
        }
      });
    }
  });
});
