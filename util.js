const util = {};

util.getGroupName = groupIndex => {
  if (groupIndex === 0) return 'New words';
  if (groupIndex === 1) return 'Repeated 1 time';
  if (groupIndex < 10) {
    return 'Repeated ' + groupIndex + ' times';
  }
  return 'Learnt';
};

util.setBlurred = (isBlurred) => {
  if (isBlurred) {
    $('body').addClass('blurred');
    $('.actionBlocker').show();
  } else {
    $('body').removeClass('blurred');
    $('.actionBlocker').hide();
  }
};

util.hidePopup = () => {
  $('.popup').hide();
  $('.popup').css('opacity', 0);
  util.setBlurred(false);
};
util.showPopup = (html, yesAction) => {
  $('.popupContent').html(html);
  $('.popup .yesButton').click(function() {
    yesAction();
    $(this).off('click');
    util.hidePopup();
  });
  $('.popup .noButton').click(util.hidePopup);

  $('.popup').show();
  $('.popup').css('opacity', 1);
  util.setBlurred(true);
};

const translationApiKey = 'trnsl.1.1.20200422T083917Z.28cbd2f52df07dcd.a776528bbd937c69b808570840b48a58224acf25';
const dictionaryApiKey = 'dict.1.1.20190711T095338Z.484d81ae92e52b2a.f377215fa79771b02fb5f2343803aa24876acbe2';

util.getTranslation = async (text) => {
  // console.log(text);
  const trimmedText = text.trim();
  if (trimmedText.length === 0) {
    return Promise.resolve('');
  }

  const dictionaryApiRequest = `https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=${dictionaryApiKey}&lang=en-ru&text=${text}`;
  const translationApiRequest = `https://translate.yandex.net/api/v1.5/tr.json/translate?key=${translationApiKey}&lang=en-ru&text=${text}`;

  const [
    dictionaryApiResponse,
    translationApiResponse,
  ] = await Promise.all([
    fetch(dictionaryApiRequest),
    fetch(translationApiRequest),
  ]);

  const dictionaryResponseJson = await dictionaryApiResponse.json();
  const translationResponseJson = await translationApiResponse.json();

  const dictionaryApiHasResult = (dictionaryResponseJson.def.length !== 0);
  if (dictionaryApiHasResult) {
    return dictionaryResponseJson.def.map((definition) => (
      definition.pos + ':\n' + definition.tr
        .map((translation) => translation.text)
        .join(', ')
    )).join('\n');
  }

  return translationResponseJson.text[0];
};
