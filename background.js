'use strict';

const add = event => {
  chrome.storage.sync.get(['wordGroups'], ({ wordGroups }) => {
    wordGroups[0].push(event.selectionText);
    chrome.storage.sync.set({ wordGroups });
  });
};

const getDefaultWordGroups = () => {
  const groups = [];
  for (let i = 0; i < 11; i++) {
    groups.push([]);
  }
  return groups;
};

chrome.runtime.onInstalled.addListener(function() {
  chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    id: 'repeatioContextMenu',
    title: 'Add to repeat list',
    contexts: ['selection']
  });
  chrome.contextMenus.onClicked.addListener(add);

  // chrome.storage.sync.remove(['wordGroups'])

  chrome.storage.sync.get(['wordGroups'], ({ wordGroups }) => {
    if (!wordGroups) {
      wordGroups = getDefaultWordGroups();
    }

    chrome.storage.sync.set({ wordGroups });
  });
});
