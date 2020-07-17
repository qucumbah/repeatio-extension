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

  // chrome.storage.sync.remove(['wordGroups'])

  chrome.storage.sync.get(['wordGroups'], ({ wordGroups }) => {
    if (!wordGroups) {
      wordGroups = getDefaultWordGroups();
    }

    chrome.storage.sync.set({ wordGroups });
  });
});

chrome.contextMenus.onClicked.addListener(add);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { method, data } = message;

  if (method === 'fetchJSONThroughBackground') {
    fetch(data)
      .then((response) => response.json())
      .then((json) => sendResponse([null, json]))
      .catch((error) => sendResponse([error]));

    return true;
  }

  if (method === 'addWordToRepeatList') {
    chrome.storage.sync.get(['wordGroups'], ({ wordGroups }) => {
      wordGroups[0].push(data);
      chrome.storage.sync.set({ wordGroups });
    });

    return;
  }
});
