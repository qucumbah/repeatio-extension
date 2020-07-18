const popupCode = `
<div class="translationPopup">
  <div class="word">
    <input type="text" class="wordInput"/>
  </div>
  <div class="translation"></div>
  <div class="buttons">
    <div class="button addButton">Add</div>
    <div class="button cancelButton">Cancel</div>
  </div>
</div>
`;

class TranslationPopup {
  constructor() {
    this.element = $(popupCode);
    this.translationPlaceholder = $('<span class="placeholder"></span>');

    this.translationContainer = this.element.find('.translation');
    this.wordInput = this.element.find('.wordInput');

    this.addButton = this.element.find('.addButton');
    this.cancelButton = this.element.find('.cancelButton');

    this.wordInput.on('input', () => this.updateTranslation());
    this.addButton.on('click', () => {
      util.addWordToRepeatList(this.wordInput.val());
      this.hide();
    });
    this.cancelButton.on('click', () => this.hide());

    window.addEventListener('mouseup', () => this.hide());
    this.element.on('mouseup', (event) => event.stopPropagation());

    this.left = -100;
    this.top = -100;

    $(document.body).append(this.element);

    this.hide();
  }

  setText(newText) {
    this.wordInput.val(newText);
    this.updateTranslation();
  }

  async updateTranslation() {
    this.translationContainer.empty();
    this.translationContainer.append(this.translationPlaceholder);

    const text = this.wordInput.val();
    const translation = await util.getTranslation(text);

    this.translationContainer.empty();
    this.translationContainer.text(translation);
  }

  hide() {
    this.element.css({
      display: 'none',
    });
  }

  show() {
    this.element.css({
      display: 'block',
    });
  }

  showAt(x, y) {
    this.left = x;
    this.top = y;

    this.updatePosition();
    this.show();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const fixingOffsets = this.getOutOfBoundsFixingOffsets();

        this.left = this.left + fixingOffsets.left;
        this.top = this.top + fixingOffsets.top;
        this.updatePosition();
      });
    });
  }

  updatePosition() {
    this.element.css({
      left: `${this.left}px`,
      top: `${this.top}px`,
    });
  }

  getOutOfBoundsFixingOffsets() {
    const htmlElement = this.element.get(0);
    const htmlElementDimensions = htmlElement.getBoundingClientRect();

    const isOutOfTopBound = htmlElementDimensions.top < 0;
    const isOutOfLeftBound = htmlElementDimensions.left < 0;
    const isOutOfRightBound = htmlElementDimensions.right > window.innerWidth;

    const getLeftOffset = () => {
      if (isOutOfLeftBound) {
        return -htmlElementDimensions.left;
      }
      if (isOutOfRightBound) {
        return -(htmlElementDimensions.right - window.innerWidth);
      }
      return 0;
    };

    return {
      top: isOutOfTopBound ? htmlElementDimensions.height + 40 : 0,
      left: getLeftOffset(),
    };
  }
}
