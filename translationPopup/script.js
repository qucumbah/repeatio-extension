const getSelection = () => {
  const selection = (
    (window.getSelection && window.getSelection())
    || (document.getSelection && document.getSelection())
  );

  const { x, y, width } = selection.getRangeAt(0).getBoundingClientRect();
  const text = selection.toString();

  return {
    selectionX: x + width / 2,
    selectionY: y,
    text
  };
};

const popup = new TranslationPopup();

const showTranslationPopup = () => {
  const { selectionX, selectionY, text } = getSelection();

  popup.setText(text);
  popup.showAt(selectionX, selectionY);
};

window.addEventListener('keypress', (keyEvent) => {
  if (keyEvent.code !== 'KeyQ') {
    return;
  }

  if (!keyEvent.ctrlKey) {
    return;
  }

  showTranslationPopup();
});
