window.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs && tabs.length) {
      chrome.tabs.sendMessage(tabs[0].id, { method: 'wordly' }, response => {
        if (chrome.runtime.lastError) {
          console.log('ERROR: ', chrome.runtime.lastError);
        } else if (response.wordly && response.wordly.length) {
          document.getElementById('wordlyWordsList').innerHTML = '';
          response.wordly.forEach(wordlyItem => {
            document.getElementById('wordlyWordsList').innerHTML +=
            '<li><span>'+ wordlyItem.word +'</span> - '+ wordlyItem.meaning +'</li>';
            // const newLI = document.createElement('li');
            // newLI.appendChild(document.createTextNode(`${wordlyItem.word} - ${wordlyItem.meaning}`));
            // document.getElementById('wordlyWordsList').appendChild(newLI);
          });

          // Send a reminder notification every so often.
          window.setInterval(() => {
            // Select a random word.
            const randomIndex = Math.floor(Math.random() * response.wordly.length);
            const wordlyObj = response.wordly[randomIndex];

            // Send the notification.
            Notification.send(wordlyObj);
          }, Notification.Interval);
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
