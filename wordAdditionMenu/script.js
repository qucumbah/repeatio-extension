const addWord = (word) => {
  chrome.storage.sync.get(['wordGroups'], ({ wordGroups }) => {
    wordGroups[0].push(word);
    chrome.storage.sync.set({ wordGroups });
  });
};

const translationContainer = $('.translation');

const setTranslationText = (translationText) => {
  translationContainer.text(translationText);
};

const wordInput = $('#wordInput');
wordInput.on('input', () => {
  const text = wordInput.val();
  util.getTranslation(text).then(
    (translationText) => setTranslationText(translationText)
  );
});

$('.yesButton').click(() => {
  addWord(wordInput.val());
  wordInput.val('');
  setTranslationText('');
});
$('.noButton').click(() => window.location = '/popup/index.html');
