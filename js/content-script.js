/**
 * 自动翻译生成中文
 */
document.addEventListener('DOMContentLoaded', function () {
  var api =
    'https://translate.google.cn/translate_a/single?client=gtx&sl=en&tl=zh-CN&dj=1&ie=UTF-8&oe=UTF-8&dt=at&dt=bd&dt=ex&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&';

  function getTemp(word, nodeName) {
    return (
      '<div class="trans-assistant-block">' +
      '<div class="trans-assistant-block-text" contentEditable data-node="' + nodeName + '">'
      + word +
      '<div class="trans-assistant-delete"></div>' +
      '</div>' +
      '</div>'
    );
  }

  function isCodeNode($el) {
    var flag = false;
    var $node = $el;
    while ($node.length > 0) {
      if ($node[0].nodeName === 'PRE' || $node[0].nodeName === 'CODE') {
        flag = true;
        break;
      } else {
        $node = $node.parent();
      }
    }
    return flag;
  }

  function exportMarkDown(list) {
    var titleSyntax = {
      'H1': '#',
      'H2': '##',
      'H3': '###',
      'H4': '####',
      'H5': '#####'
    };
    var article = list.map(function (item) {
      if (titleSyntax[item.nodeName]) {
        return titleSyntax[item.nodeName] + ' ' + item.text;
      } else if (item.nodeName === 'CODE') {
        return '\`\`\`\n' + item.text + '\n\`\`\`';
      } else {
        return item.text;
      }
    }).join('\n');
    console.log(article);
    return article;
  }

  hotkeys('command+e', function (event) {
    event.preventDefault();
    var selectNode = document.getSelection();
    var translateWords = selectNode.toString();
    if (!translateWords) {
      return false;
    }
    var $target = $(selectNode.anchorNode).parent();
    if ($target.find('.trans-assistant-block').length > 0) return;
    if (isCodeNode($target)) {
      $target.prepend(getTemp(translateWords, 'CODE'));
    } else {
      axios
        .get(api + 'q=' + encodeURIComponent(translateWords))
        .then(function (response) {
          var transStr = (response.data.sentences || []).reduce(function (a, b) {
            return a + (b.trans || '');
          }, '');
          $target.prepend(getTemp(transStr, $target[0].nodeName));
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  });

  hotkeys('command+/', function (event) {
    event.preventDefault();
    var translateList = [];
    $('.trans-assistant-block-text').each(function () {
      translateList.push({
        nodeName: $(this).attr('data-node'),
        text: $(this).text()
      });
    });
    exportMarkDown(translateList);
  });

  $('body').on('click', '.trans-assistant-delete', function () {
    $(this).parent().parent().fadeOut(300, function () {
      $(this).remove();
    });
  });

  // var handleDrag = {
  //   position : {
  //     offsetX: 0, //点击处偏移元素的X
  //     offsetY: 0, //偏移Y值
  //     state: 0 //是否正处于拖拽状态，1表示正在拖拽，0表示释放
  //   },
  //   onMouseDown:function (e) {
  //     this.position.offsetX = e.offsetX;
  //     this.position.offsetY = e.offsetY;
  //     this.position.state = 1;
  //     console.log('onMouseMove',e.offsetX,e.offsetY);
  //   },
  //   onMouseMove:function (e) {
  //     if (this.position.state) {
  //       this.position.endX = e.clientX;
  //       this.position.endY = e.clientY;
  //       console.log('onMouseMove',e.offsetX,e.offsetY);
  //       $(e.currentTarget).css({
  //         left: this.position.endX - this.position.offsetX,
  //         top: this.position.endY - this.position.offsetY
  //       });
  //     }
  //   },
  //   onMouseUp:function () {
  //     this.position.state = 0;
  //   }
  // };
  //
  // $('body').on('mousedown','.trans-assistant-block-text',handleDrag.onMouseDown.bind(handleDrag));
  // $('body').on('mousemove','.trans-assistant-block-text',handleDrag.onMouseMove.bind(handleDrag));
  // $('body').on('mouseup','.trans-assistant-block-text',handleDrag.onMouseUp.bind(handleDrag));
});
