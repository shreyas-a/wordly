(() => {
  const state = {
    tabId: null
  };
  const LIST_ELEMENT_ID = 'wordlyWordsList';
  const LAZY_LOAD_LIMIT = 10;
  const LAZY_LOAD_RENDER_SIZE = 5;
  const LAZY_LOAD_THRESHOLD_PX = 100;

  window.addEventListener('DOMContentLoaded', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs && tabs.length) {
        state.tabId = tabs[0].id;
        chrome.tabs.sendMessage(state.tabId, { method: 'wordly-get' }, response => {
          if (chrome.runtime.lastError) {
            console.log('ERROR: ', chrome.runtime.lastError);
          } else if (response.wordly && response.wordly.length) {
            createWordList(response.wordly);
          } else {
            document.getElementById(LIST_ELEMENT_ID).innerHTML = '<li class="no-words">No Words. Start Learning!</li>';
            // const newLI = document.createElement('li');
            // newLI.appendChild(document.createTextNode('No words'));
            // document.getElementById('wordlyWordsList').appendChild(newLI);
          }
        });
      }
    });
  });

  window.onunload = () => {
    state.tabId = null;
  }

  /**
   * Creates and draws the word list and binds scroll position based lazy item loading to the list
   * @param {[]} items 
   */
  function createWordList(items) {
    const itemsToDraw = items.slice(0);

    // Clear the rendered list
    drawList();

    // Draw the initial items, remove them from the 'itemsToDraw' array
    drawList(itemsToDraw.splice(0, LAZY_LOAD_LIMIT));

    // If there are more items to draw, draw them only when the scroll is near the bottom of the popup
    if (itemsToDraw.length > 0) {
      whenScrollIsNearBottom(() => {
        if (itemsToDraw.length > 0) {
          drawList(itemsToDraw.splice(0, LAZY_LOAD_RENDER_SIZE), true);
        }
      })
    }
  }

  /**
   * Creates the item list html and inserts it to the DOM
   * @param {[]} items array of word items 
   * @param {boolean} append append to the current list or replace or the items
   */
  function drawList(items, append = false) {
    const html = items ? getHtml(items) : '';
    render();

    function getHtml() {
      const getItemHTML = item =>
        `<li>
      <div class="word-container">
        <span>${item.word}</span>
        - ${item.meaning}
      </div>
      <div key="${item.word}" class="icon-container">
        <img src="img/bin.png">
      </div>
    </li>`;
      return items.reduce((list, item) => list += getItemHTML(item), '');
    }

    function render() {
      const listElement = document.getElementById(LIST_ELEMENT_ID);
      if (append) {
        listElement.innerHTML += html;
      } else {
        listElement.innerHTML = html;
      }

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

    }
  }

  /**
   * Detect when user scrolls the list near to the bottom of the popup.
   * The callback is called when the threshold from the bottom is reached
   * @param {Function} callback 
   */
  function whenScrollIsNearBottom(callback) {
    let previousScrollTop = 0;
    const directionIsDown = current => current > previousScrollTop
    const scrollIsNearBottom = current => (current + window.outerHeight) >= (document.body.offsetHeight - LAZY_LOAD_THRESHOLD_PX)

    document.addEventListener('scroll', () => {
      const currentScrollTop = document.body.scrollTop;
      if (directionIsDown(currentScrollTop) && scrollIsNearBottom(currentScrollTop)) {
        callback();
      }
      previousScrollTop = currentScrollTop;
    }, { capture: true, passive: true })
  }

})()
