window.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs && tabs.length) {
      chrome.tabs.sendMessage(tabs[0].id, { method: 'wordly' }, response => {
        if (chrome.runtime.lastError) {
          console.log('ERROR: ', chrome.runtime.lastError);
        } else if (response.wordly && response.wordly.length) {
          document.getElementById('wordlyWordsList').innerHTML = '';
          response.wordly.forEach(wordlyItem => {
<<<<<<< 332468252725138bc758a7bf4bd74e86861a25ac
            const newLI = document.createElement('li');
            newLI.appendChild(document.createTextNode(`${wordlyItem.word} - ${wordlyItem.meaning}`));
            document.getElementById('wordlyWordsList').appendChild(newLI);
=======
            document.getElementById('wordlyWordsList').innerHTML +=
            '<li><span>'+ wordlyItem.word +'</span> - '+ wordlyItem.meaning +'</li>';
            // const newLI = document.createElement('li');
            // newLI.appendChild(document.createTextNode(`${wordlyItem.word} - ${wordlyItem.meaning}`));
            // document.getElementById('wordlyWordsList').appendChild(newLI);
>>>>>>> css Styling
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
