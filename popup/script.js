chrome.storage.sync.get(['wordGroups'], ({ wordGroups }) => {
  const container = $('#wordGroups');

  const wordGroupsDom = wordGroups.map((group, index) => {
    const wordGroup = $(
      `<div class="wordGroup">
        <div class="groupName">${util.getGroupName(index)}</div>
        <div class="groupLength">${group.length}</div>
      </div>`
    );
    wordGroup.css({
      'transition-delay': index / 32 + 's',
    });
    return wordGroup;
  });
  container.append(wordGroupsDom);
  
  setTimeout(() => {
    $('.wordGroup').css({
      'padding': '1px 15px',
      'opacity': '1',
    });
  }, 50);
});

//$('#repeatButton').click( () => window.location = '/main/index.html' );
$('#repeatButton').click( () => window.open('/main/index.html', '_blank') );
$('#wordsListButton').click( () => window.location = '/wordsList/index.html' );