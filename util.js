const util = {};

util.getGroupName = groupIndex => {
  if (groupIndex === 0) return 'New words';
  if (groupIndex === 1) return 'Repeated 1 time';
  if (groupIndex < 10) {
    return 'Repeated ' + groupIndex + ' times';
  }
  return 'Learned words';
};

util.learnedWordsGroupIndex = 10;

util.setBlurred = (isBlurred) => {
  if (isBlurred) {
    $('body').addClass('blurred');
    $('.actionBlocker').show();
  } else {
    $('body').removeClass('blurred');
    $('.actionBlocker').hide();
  }
};

util.hidePopup = () => {
  $('.popup').hide();
  $('.popup').css('opacity', 0);
  util.setBlurred(false);
};
util.showPopup = (html, yesAction) => {
  $('.popupContent').html(html);
  $('.popup .yesButton').click(function() {
    yesAction();
    $(this).off('click');
    util.hidePopup();
  });
  $('.popup .noButton').click(util.hidePopup);

  $('.popup').show();
  $('.popup').css('opacity', 1);
  util.setBlurred(true);
};

const fetchJSONThroughBackground = (request) => new Promise(
  (resolve, reject) => {
    const message = {
      method: 'fetchJSONThroughBackground',
      data: request,
    };

    const callback = ([error, response]) => {
      if (error !== null) {
        reject(error);
      }

      resolve(response);
    };

    chrome.runtime.sendMessage(message, callback);
  }
);

util.getTranslation = async (text) => {
  const trimmedText = text.trim();
  if (trimmedText.length === 0) {
    return Promise.resolve('');
  }

  const translationApiRequest = `https://repeatio-translation-server.herokuapp.com/translate?source=en&target=ru&text=${text}`;

  try {
    return fetch(translationApiRequest).then((response) => response.text());
  } catch (exception) {
    return `Translation error: ${exception.message}`;
  }
};

util.addWordToRepeatList = (word) => chrome.runtime.sendMessage({
  method: 'addWordToRepeatList',
  data: word,
});

util.speechSynthesisSupported = window.speechSynthesis !== null;

util.pronounce = (text) => {
  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utterance);
};
