/**
 * 自动翻译生成中文
 */
document.addEventListener('DOMContentLoaded', function() {
  var api =
    'https://translate.google.cn/translate_a/single?client=gtx&sl=en&tl=zh-CN&dj=1&ie=UTF-8&oe=UTF-8&dt=at&dt=bd&dt=ex&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&';

  function getTemp(word) {
    return (
      '<div class="en-assistant-block J_EnAssistantBlock"><div class="en-assistant-block-text" contentEditable>' +
      word +
      '</div></div>'
    );
  }

  hotkeys('command+e', function(event) {
    event.preventDefault();
    var selectNode = document.getSelection();
    var translateWords = selectNode.toString();
    if (!translateWords) {
      return false;
    }
    axios
      .get(api + 'q=' + encodeURIComponent(translateWords))
      .then(function(response) {
        var str = (response.data.sentences || []).reduce(function(a, b) {
          return a + (b.trans || '');
        }, '');
        var $tartget = $(selectNode.anchorNode).parent()
        $tartget.prepend(getTemp(str));
      })
      .catch(function(error) {
        console.log(error);
      });
  });
});
