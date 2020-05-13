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
const updateWord = (groupIndex, wordIndex, newWord) => {
  chrome.storage.sync.get(['wordGroups'], ({ wordGroups }) => {
    const oldWord = wordGroups[groupIndex][wordIndex];
    if (oldWord === newWord) {
      return;
    }

    wordGroups[groupIndex][wordIndex] = newWord;
    chrome.storage.sync.set({ wordGroups });
    updateScreen(wordGroups);
  });
};

const renderWord = (word, wordIndex, groupIndex) => {
  const wordContainer = $('<li class="wordContainer"></li>');
  wordContainer.css('animation-delay', wordIndex / 32 + 's');

  const wordInput = $('<input class="word" type="text">');
  wordInput.val(word);

  const translationContainer = $('<div class="translationContainer"></div>');
  const updateTranslation = async () => {
    const currentWord = wordInput.val();
    const translation = await util.getTranslation(currentWord);
    translationContainer.text(translation);
  };

  wordInput.on('focus', () => {
    wordContainer.addClass('isEditing');
    updateTranslation();
  });
  wordInput.on('blur', () => {
    wordContainer.removeClass('isEditing');
    updateWord(groupIndex, wordIndex, wordInput.val());
  });

  wordInput.on('input', updateTranslation);

  const removeWordButton = $('<div class="removeWordButton">Remove</div>');
  removeWordButton.click(() => {
    util.showPopup(
      'Are you sure you want to remove word "' + word + '"?',
      () => removeWord(groupIndex, wordIndex)
    );
  });

  const wordControls = $('<div class="wordControls"></div>');
  wordControls.append(wordInput);
  wordControls.append(removeWordButton);

  wordContainer.append(wordControls);
  wordContainer.append(translationContainer);
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
$('.goBackButton').click( () => window.location = '/popup/index.html' );
$('.wordAddButton').click(
  () => window.location = '/wordAdditionMenu/index.html'
);
