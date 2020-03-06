//React would've worked really good here

const setBlurred = (isBlurred) => {
  if (isBlurred) {
    $('body').addClass('blurred');
    $('.actionBlocker').show();
  } else {
    $('body').removeClass('blurred');
    $('.actionBlocker').hide();
  }
};

const setLoading = (isLoading) => {
  if (isLoading) {
    $('body').addClass('loading');
  } else {
    $('body').removeClass('loading');
  }
};

const updateScreen = (wordGroups) => {
  if (wordGroups) {
    $('.list').html( wordGroups.map(renderGroup) );
  } else {
    setBlurred(true);
    setLoading(true);
    chrome.storage.sync.get(['wordGroups'], ({ wordGroups }) => {
      $('.list').html( wordGroups.map(renderGroup) );
      setBlurred(false);
      setLoading(false);
    });
  }
  
  setTimeout(() => {
    $('.wordContainer').css({
      'padding': '1px 15px',
      'opacity': '1',
    });
  }, 50);
};

const hidePopup = () => {
  $('.popup').hide();
  $('.popup').css('opacity', 0);
  setBlurred(false);
};
const showPopup = (text, yesAction) => {
  $('.popupText').text(text);
  $('.popup .yesButton').click(function() {
    yesAction();
    $(this).off('click');
    hidePopup();
  });
  $('.popup .noButton').click(hidePopup);

  $('.popup').show();
  $('.popup').css('opacity', 1);
  setBlurred(true);
};

$('.actionBlocker').click(hidePopup);

const removeWord = (groupIndex, wordIndex) => {
  chrome.storage.sync.get(['wordGroups'], ({ wordGroups }) => {
    wordGroups[groupIndex].splice(wordIndex, 1);
    chrome.storage.sync.set({ wordGroups });
    updateScreen(wordGroups);
  });
};

const renderWord = (word, wordIndex, groupIndex) => {
  const wordContainer = $('<div class="wordContainer"></div>');
  wordContainer.css('transition-delay', wordIndex / 32 + 's');
  wordContainer.append( $('<div class="word">' + word + '<div>') );
  const removeWordButton = $('<div class="removeWordButton">Remove</div>');
  removeWordButton.click(() => {
    showPopup(
      'Are you sure you want to remove word "' + word + '"?',
      () => removeWord(groupIndex, wordIndex)
    );
  });
  wordContainer.append(removeWordButton);
  return wordContainer;
};

const renderGroup = (group, groupIndex) => {
  if (group.length === 0) {
    return null;
  }
  
  const groupContainer = $('<div class="groupContainer"></div>');
  groupContainer.append(
    $('<div class="groupName">' + util.getGroupName(groupIndex) + '</div>')
  );
  const groupContents = group.map(
    (word, wordIndex) => renderWord(word, wordIndex, groupIndex)
  );
  const wordsContainer = $('<div class="wordsContainer"></div>');
  wordsContainer.append(groupContents);
  groupContainer.append(wordsContainer);
  return groupContainer;
};

updateScreen();

$('.controls *').click( () => window.location = '/popup/index.html' );