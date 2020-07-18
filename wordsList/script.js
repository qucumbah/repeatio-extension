//React would've worked really good here

const setLoading = (isLoading) => {
  // return;
  if (isLoading) {
    $('body').addClass('loading');
  } else {
    $('body').removeClass('loading');
  }
};

const updateScreen = (updatedWordGroups) => {
  if (updatedWordGroups) {
    $('.fullList').html( updatedWordGroups.map(renderGroup) );
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
const markWordAsLearned = (groupIndex, wordIndex) => {
  chrome.storage.sync.get(['wordGroups'], ({ wordGroups }) => {
    const [word] = wordGroups[groupIndex].splice(wordIndex, 1);
    wordGroups[wordGroups.length - 1].push(word);
    chrome.storage.sync.set({ wordGroups });
    updateScreen(wordGroups);
  });
};

const renderWord = (word, wordIndex, groupIndex) => {
  const wordContainer = $('<li class="wordContainer"></li>');
  // wordContainer.css('animation-delay', wordIndex / 32 + 's');

  const wordInput = $('<input class="word" type="text">');
  wordInput.val(word);

  const translationContainer = $('<div class="translation"></div>');
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
  const markAsLearnedButton = $(
    '<div class="markAsLearnedButton">Mark as learned</div>'
  );
  markAsLearnedButton.click(() => {
    util.showPopup(
      'Are you sure you want to mark word "' + word + '" as learned?',
      () => markWordAsLearned(groupIndex, wordIndex)
    );
  });

  const wordControls = $('<div class="wordControls"></div>');
  wordControls.append(wordInput);
  wordControls.append(markAsLearnedButton);
  wordControls.append(removeWordButton);

  wordContainer.append(wordControls);
  wordContainer.append(translationContainer);
  return wordContainer;
};

const getUnwrapButtons = (
  group,
  groupIndex,
  groupContainer,
  wordsContainer,
  limit
) => {
  const unwrapButtonsContainer = $(
    '<div class="unwrapButtonsContainer"></div>'
  );
  const unwrapTwentyButton = $(
    '<input type="button" value="Show next 20 words">'
  );
  const unwrapAllButton = $(
    '<input type="button" class="secondary" value="">'
  );

  unwrapButtonsContainer.append(unwrapTwentyButton);
  unwrapButtonsContainer.append(unwrapAllButton);
  groupContainer.append(unwrapButtonsContainer);

  let firstHiddenWordIndex = limit;

  const updateUnwrapButtonText = () => {
    const remainingWords = group.length - firstHiddenWordIndex;
    unwrapAllButton.val(`Show ${remainingWords} remaining words`);
  };
  updateUnwrapButtonText();

  unwrapTwentyButton.click(() => {
    const fromIndex = firstHiddenWordIndex;
    const toIndex = Math.min(group.length, fromIndex + 20);

    const newWordsToShow = group
      .slice(fromIndex, toIndex)
      .map((word, wordIndex) => renderWord(
        word,
        fromIndex + wordIndex,
        groupIndex
      ));

    if (toIndex === group.length) {
      unwrapButtonsContainer.remove();
    }

    wordsContainer.append(newWordsToShow);
    firstHiddenWordIndex += 20;
    updateUnwrapButtonText();
  });

  unwrapAllButton.click(() => {
    const fromIndex = firstHiddenWordIndex;
    const toIndex = group.length;

    const newWordsToShow = group
      .slice(fromIndex, toIndex)
      .map((word, wordIndex) => renderWord(
        word,
        fromIndex + wordIndex,
        groupIndex
      ));

    unwrapButtonsContainer.remove();
    wordsContainer.append(newWordsToShow);
  });

  return unwrapButtonsContainer;
};

const renderGroup = (group, groupIndex) => {
  if (group.length === 0) {
    return null;
  }

  const groupContainer = $('<div class="groupContainer"></div>');
  groupContainer.append(
    $('<div class="groupName">' + util.getGroupName(groupIndex) + '</div>')
  );

  const limit = 20;
  const groupContents = group.slice(0, Math.min(group.length, limit)).map(
    (word, wordIndex) => renderWord(word, wordIndex, groupIndex)
  );

  const wordsContainer = $('<ul class="wordsContainer"></ul>');

  wordsContainer.append(groupContents);
  groupContainer.append(wordsContainer);

  if (group.length > limit) {
    const unwrapButtons = getUnwrapButtons(
      group,
      groupIndex,
      groupContainer,
      wordsContainer,
      limit
    );
    groupContainer.append(unwrapButtons);
  }

  return groupContainer;
};

updateScreen();

$('.actionBlocker').click(util.hidePopup);
$('.goBackButton').click( () => window.close() );
$('.wordAddButton').click(
  () => window.location = '/wordAdditionMenu/index.html'
);
