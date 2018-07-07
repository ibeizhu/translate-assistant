/**
 * translate assistant to increase reading fluency for English article
 * @author frontMoment@sina.com
 * @github http://github.com/frontmoment
 */

document.addEventListener('DOMContentLoaded', function () {
  var api =
    'https://translate.google.cn/translate_a/single?client=gtx&sl=en&tl=zh-CN&dj=1&ie=UTF-8&oe=UTF-8&dt=at&dt=bd&dt=ex&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&';

  var utils = {
    getCodeNodeParent: function ($el) {
      var $node = $el;
      var $parent;
      while ($node.length > 0) {
        if ($node[0].nodeName === 'PRE') {
          $parent = $node;
          break;
        }
        if ($node[0].nodeName === 'BODY') {
          break;
        } else {
          $node = $node.parent();
        }
      }
      return $parent;
    },
    randomString: function (len) {
      len = len || 32;
      var $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var maxPos = $chars.length;
      var pwd = '';
      for (var i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * (maxPos + 1)));
      }
      return pwd;
    },
    preloadImage: function () {
      var imgList = [
        'https://img.alicdn.com/tfs/TB1o8GTCNGYBuNjy0FnXXX5lpXa-48-48.png',
        'https://img.alicdn.com/tfs/TB1CdVQCQyWBuNjy0FpXXassXXa-48-48.png'
      ];
      imgList.forEach(function (url) {
        var img = new Image(url);
        img.onload = function () {
        }
      })
    },
    renderTransTextDom: function (word, nodeName, id) {
      return (
        '<div class="trans-assistant-block" id="' + id + '">' +
        '<div class="trans-assistant-block-text" contentEditable data-node="' + nodeName + '">'
        + word +
        '<div class="trans-assistant-delete"></div>' +
        '</div>' +
        '</div>'
      );
    },
    appendMdPanel: function () {
      $('body').append('<div class="trans-assistant-markdown"><pre></pre></div>');
    },
    renderMarkdown: function (list) {
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
      $('.trans-assistant-markdown').find('pre').html(article);
      $('.trans-assistant-markdown').animate({
        left: 0
      }, 200);
    }
  };

  utils.preloadImage();
  utils.appendMdPanel();

  // short cut for generate translate text
  hotkeys('command+e', function (event) {
    event.preventDefault();
    var selectNode = document.getSelection();
    var translateWords = selectNode.toString();
    if (!translateWords) {
      return false;
    }
    var elId = utils.randomString(8);
    var $target = $(selectNode.anchorNode).parent();
    if ($target.find('.trans-assistant-block').length > 0) return;

    // specific nodes do not translate, like `<pre>`
    var $parent = utils.getCodeNodeParent($target);
    if ($parent) {
      $target.prepend(utils.renderTransTextDom('<pre>' + translateWords + '</pre>', 'CODE', elId));
      $target.find('.trans-assistant-block').css({
        'min-width': $parent.width()
      });
      $('#' + elId).Tdrag();
    } else {
      axios
        .get(api + 'q=' + encodeURIComponent(translateWords))
        .then(function (response) {
          translateWords = (response.data.sentences || []).reduce(function (a, b) {
            return a + (b.trans || '');
          }, '');
          $target.prepend(utils.renderTransTextDom(translateWords, $target[0].nodeName, elId));
          $target.find('.trans-assistant-block').width($target.width());
          $('#' + elId).Tdrag();
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  });

  // show markdown panel
  hotkeys('command+right', function (event) {
    event.preventDefault();
    var translateList = [];
    $('.trans-assistant-block-text').each(function () {
      translateList.push({
        nodeName: $(this).attr('data-node'),
        text: $(this).text()
      });
    });
    utils.renderMarkdown(translateList);
    $('.trans-assistant-markdown').animate({
      left: 0
    }, 200);
  });

  // hide markdown panel
  hotkeys('command+left', function (event) {
    event.preventDefault();
    $('.trans-assistant-markdown').animate({
      left: -600
    }, 200);
  });

  $('body').on('click', '.trans-assistant-delete', function () {
    $(this).parent().parent().fadeOut(300, function () {
      $(this).remove();
    });
  });
});
