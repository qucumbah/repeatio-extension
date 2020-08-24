window.addEventListener('message', (event) => {
  if (event.source !== window) {
    return;
  }

  if (event.data.type === 'repeatio__addWordToRepeatList') {
    util.addWordToRepeatList(event.data.value);
  }
}, false);
