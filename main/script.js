const numberOfWordsContainer = $('#numberOfWords');
const startButton = $('#startButton')

let totalWords;
const getTotalWords = (
  (wordGroups) => wordGroups.reduce((sum, group) => sum + group.length, 0)
);

const setStartButtonEnabledOrDisabled = () => {
  const value = numberOfWordsContainer.val();
  startButton.prop('disabled', (value < 1) || (value > totalWords));
};

numberOfWordsContainer.on('input focus', () => {
  setStartButtonEnabledOrDisabled();
});

chrome.storage.sync.get(['wordGroups'], ({ wordGroups: allWordGroups }) => {
  //Exclude learnt words group
  const wordGroups = allWordGroups.slice(0, allWordGroups.length - 1);
  totalWords = getTotalWords(wordGroups);
  numberOfWordsContainer.attr({
    max: totalWords,
    min: 0,
  });
  numberOfWordsContainer.val(totalWords);
  setStartButtonEnabledOrDisabled();
});

const getDistribution = (wordGroups, wordsToRepeat) => {
  const totalWords = getTotalWords(wordGroups);
  const multiplier = wordsToRepeat / totalWords;

  let wordsDistributed = 0;
  const distribution = wordGroups.map(group => {
    const result = Math.floor(group.length * multiplier);
    wordsDistributed += result;
    return result;
  });

  let wordsLeftToDistribute = wordsToRepeat - wordsDistributed;
  let index = 0;
  while ((wordsLeftToDistribute !== 0) && (index !== wordGroups.length)) {
    if (wordGroups[index].length > distribution[index]) {
      distribution[index]++;
      wordsLeftToDistribute--;
    }
    index++;
  }

  return distribution;
};

const distributeWords = (wordGroups, distribution) => {
  return distribution.reduce((result, number, groupIndex) => {
    return result.concat( pickFrom(wordGroups[groupIndex], number) );
  }, []);
};

const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};
const pickFrom = (array, number) => {
  if (number > array.length) {
    throw new Exception('Too many values to pick');
  }

  return shuffle( array.slice(0) ).slice(0, number);
};

const playGame = (wordGroups, distribution, callback) => {
  $('#preparation').hide();
  $('#game').show();

  const wordContainer = $('.word');
  const translationContainer = $('.translation');
  const wordsLeftContainer = $('.wordsLeft');
  const nextWordButton = $('#nextButton');
  const showTranslationButton = $('#showTranslationButton');
  const alwaysShowTranslation = $('#alwaysShowTranslation');
  const finishButton = $('#finishButton');

  finishButton.on('click', () => callback(wordGroups));

  const showTranslation = async () => {
    showTranslationButton.hide();
    nextWordButton.css('grid-column', 'span 2');

    const text = wordContainer.text();
    translationContainer.text('.....');
    const translation = await util.getTranslation(text);
    translationContainer.text(translation);
  };
  const hideTranslation = () => {
    showTranslationButton.show();
    nextWordButton.css('grid-column', 'span 1');
    translationContainer.text('');
  };

  const showWord = (word) => {
    wordContainer.text(word);
    showTranslationButton.show();
    if (!alwaysShowTranslation.attr('checked')) {
      hideTranslation();
    }
  };

  showTranslationButton.on('click', showTranslation);

  const pickRandomGroup = distribution => {
    const random = Math.random();
    const totalWords = distribution.reduce((prev, cur) => prev + cur, 0);
    let sum = 0;
    return distribution.findIndex((wordsInThisGroup) => {
      sum += wordsInThisGroup / totalWords;
      return sum > random;
    });
  };

  let currentGroupIndex;
  const next = () => {
    currentGroupIndex = pickRandomGroup(distribution);
    showWord( wordGroups[currentGroupIndex][0] );
    hideTranslation();
    wordsLeftContainer.text('Words left: ' + wordsLeft);
  };

  let wordsLeft = distribution.reduce((prev, cur) => prev + cur, 0);
  next();
  nextWordButton.on('click', () => {
    const currentWord = wordGroups[currentGroupIndex].shift();
    wordGroups[currentGroupIndex + 1].push(currentWord);
    distribution[currentGroupIndex]--;
    wordsLeft--;

    if (wordsLeft === 0) {
      callback(wordGroups);
      return;
    }

    next();
  });
};

$('#startButton').on('click', () => {
  const numberOfWords = numberOfWordsContainer.val();

  chrome.storage.sync.get(['wordGroups'], ({ wordGroups: allWordGroups }) => {
    //Exclude learnt words group
    const wordGroups = allWordGroups.slice(0, allWordGroups.length - 1);
    const distribution = getDistribution(wordGroups, numberOfWords);

    playGame(allWordGroups, distribution, (newWordGroups) => {
      $('#game').hide();
      $('#endScreen').show();
      chrome.storage.sync.set({ wordGroups: newWordGroups });
    });
  });
});

$('.goBackButton').on('click', () => window.close());

document.addEventListener('DOMContentLoaded', () => $('.blockTransionsOnStart').toggleClass('blockTransionsOnStart'));
