const state = {
  tabId: null
};

window.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs && tabs.length) {
      state.tabId = tabs[0].id;
      chrome.tabs.sendMessage(state.tabId, { method: 'wordly-get' }, response => {
        if (chrome.runtime.lastError) {
          console.log('ERROR: ', chrome.runtime.lastError);
        } else if (response.wordly && response.wordly.length) {
          document.getElementById('wordlyWordsList').innerHTML = '';
          response.wordly.forEach((wordlyItem) => {
            document.getElementById('wordlyWordsList').innerHTML +=
            `<li>
              <div class="word-container">
                <span>${wordlyItem.word}</span>
                - ${wordlyItem.meaning}
              </div>
              <div key="${wordlyItem.word}" class="icon-container">
                <i class="fa fa-trash" aria-hidden="true"></i>
              </div>
            </li>`;
          });
          // Bind delete button to delete action
          Array.from(document.querySelectorAll('.icon-container')).forEach(element => {
            /* eslint no-param-reassign: 0 */
            element.addEventListener('click', () => {
              const word = element.getAttribute('key');
              // Fade-out effect
              element.parentNode.className += " removed";
              setTimeout(() => {
                element.parentNode.remove();
              }, 300);
              chrome.tabs.sendMessage(state.tabId, {
                method: 'wordly-remove',
                word
              }, () => {
                if (chrome.runtime.lastError) {
                  console.log('ERROR: ', chrome.runtime.lastError);
                }
              });
            });
          });
        } else {
          const newLI = document.createElement('li');
          newLI.appendChild(document.createTextNode('No words'));
          document.getElementById('wordlyWordsList').innerHTML = '';
          document.getElementById('wordlyWordsList').appendChild(newLI);
        }
      });
    }
  });
});

window.onunload = () => {
  state.tabId = null;
}
