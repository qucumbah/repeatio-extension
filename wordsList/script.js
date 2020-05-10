//React would've worked really good here

const setLoading = (isLoading) => {
  // return;
  if (isLoading) {
    $('body').addClass('loading');
  } else {
    $('body').removeClass('loading');
  }
};

const updateScreen = (updatadWordGroups) => {
  if (updatadWordGroups) {
    $('.fullList').html( updatadWordGroups.map(renderGroup) );
  } else {
    util.setBlurred(true);
    // setLoading(true);
    chrome.storage.sync.get(['wordGroups'], ({ wordGroups }) => {
      $('.fullList').html( wordGroups.map(renderGroup) );
      util.setBlurred(false);
      // setLoading(false);
    });
  }
};

const removeWord = (groupIndex, wordIndex) => {
  chrome.storage.sync.get(['wordGroups'], ({ wordGroups }) => {
    wordGroups[groupIndex].splice(wordIndex, 1);
    chrome.storage.sync.set({ wordGroups });
    updateScreen(wordGroups);
  });
};

const renderWord = (word, wordIndex, groupIndex) => {
  const wordContainer = $('<li class="wordContainer"></li>');
  wordContainer.css('animation-delay', wordIndex / 32 + 's');
  wordContainer.append( $('<div class="word">' + word + '</div>') );
  const removeWordButton = $('<div class="removeWordButton">Remove</div>');
  removeWordButton.click(() => {
    util.showPopup(
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
  const wordsContainer = $('<ul class="wordsContainer"></ul>');
  wordsContainer.append(groupContents);
  groupContainer.append(wordsContainer);
  return groupContainer;
};

updateScreen();

$('.actionBlocker').click(util.hidePopup);
$('.controls *').click( () => window.location = '/popup/index.html' );
