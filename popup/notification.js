/**
 * A namespace around working with notifications.
 * @type {Object}
 */
const Notification = {
  Interval: 10000, // ms

  /**
   * Sends a notification.
   * @param  {Object} wordlyObj - The wordly object for a word and its definition.
   * @return {void}
   */
  send: function (wordlyObj) {
    const { word, meaning } = wordlyObj;
    const options = {
      type: 'basic',
      iconUrl: '../icons/icon-64.png',
      title: `Definition: ${ word }`,
      message: meaning,
    };

    // Clear any previous notifications.
    if (lastNotificationId) {
      chrome.notifications.clear(lastNotificationId);
    }

    // Actually send the notification.
    chrome.notifications.create(null, options, (notificationId) => {
      lastNotificationId = notificationId;
    });
  }
};

/*
 * Helper variables.
 */
var lastNotificationId = null;
