chrome.storage.sync.get(['wordGroups'], ({ wordGroups }) => {
  const container = $('#wordGroups');

  const wordGroupsDom = wordGroups.map((group, index) => {
    const wordGroup = $(
      `<li class="wordGroup">
        <div class="groupName">${util.getGroupName(index)}</div>
        <div class="groupLength">${group.length}</div>
      </li>`
    );
    wordGroup.css({
      'animation-delay': index / 32 + 's',
    });
    return wordGroup;
  });
  container.append(wordGroupsDom);
});

//$('#repeatButton').click( () => window.location = '/main/index.html' );
$('#repeatButton').click( () => window.open('/main/index.html', '_blank') );
$('#wordsListButton').click( () => window.location = '/wordsList/index.html' );
$('#addWordButton').click(
  () => window.location = '/wordAdditionMenu/index.html'
);
