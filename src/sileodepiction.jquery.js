/*! Sileo Depiction v0.1
 - https://www.yourepo.com/sileo-native-depictions
 - GNU GPL - 3.0 license - Copyright 2019 - YouRepo
 */
 ;(function(window) {
  "use strict";
  var $ = window.jQuery;
  var converter = new showdown.Converter();
  $.fn.SileoDepiction = function() {
    return {
      container: $(this),
      originalJSON  : null,
      originalName  : null,
      originalAuthor: null,
      originalIcon  : null,
      load          : function(json, name, author, icon) {
        this.originalJSON = json;
        this.originalName = name;
        this.originalAuthor = author;
        this.originalIcon = icon;
        loadSileoDepiction(this.container, json, name, author, icon);
      },
      stringify     : function() {
        return stringifySileoDepiction(this.container);
      },
      edit          : function() {
        var depic = this.container.find('.SileoDepiction-DepictionTabView').first();
        if(depic && depic.length > 0 && !depic.hasClass('SileoDepiction-edit')) {
          depic.addClass('SileoDepiction-edit');
          depic.find('.contenteditable').attr('contenteditable', true);
          setTimeout(function() {
            updateStackView(depic.find('.SileoDepiction-tabSwitch.SileoDepiction-active'));
          }, 150);
        }
      },
      cancel        : function() {
        var depic = this.container.find('.SileoDepiction-DepictionTabView').first();
        if(depic && depic.length > 0 && depic.hasClass('SileoDepiction-edit')) {
          loadSileoDepiction(this.container, this.originalJSON, this.originalName, this.originalAuthor, this.originalIcon);
        }
      },
      save          : function() {
        var depic = this.container.find('.SileoDepiction-DepictionTabView').first();
        if(depic && depic.length > 0 && depic.hasClass('SileoDepiction-edit')) {
          depic.removeClass('SileoDepiction-edit');
          depic.find('.SileoDepiction-tabSwitch .SileoDepiction-text').removeAttr('contenteditable');
          depic.find('.SileoDepiction-DepictionHeaderView .SileoDepiction-text').removeAttr('contenteditable');
        }
        var json = stringifySileoDepiction(this.container);
        if(json && json != '') {
          try {
            var parsed = JSON.parse(json);
            this.originalJSON = parsed;
            this.cancel();
            return json;
          } catch(error) {
            alert('Impossible to parse stringifySileoDepiction');
            console.log(error);
          }
        }
        return false;
      }
    }
  };
  function loadSileoDepiction(container, json, name, author, icon) {
    var content = '<div class="SileoDepiction"><div class="SileoDepiction-DepictionTabView" data-minversion="';
    if(json && parseFloat(json.minVersion) > 0) {
      content += json.minVersion;
    } else {
      content += '0.3';
    }
    content += '<div class="SileoDepiction-headerImage"';
    if(json && json.headerImage) {
      content += ' style="background-image:url(\'' + json.headerImage + '\')"';
    }
    content += '><div class="SileoDepiction-headerImageShadow"></div></div>';
    if(name && name.length > 0 && author && author.length > 0 && icon && icon.length > 0) {
      content += '<div class="SileoDepiction-headerPackage">';
      content += '<img class="SileoDepiction-sectionImage" src="' + icon + '" />';
      content += '<p class="SileoDepiction-name">' + name + '</p>';
      content += '<p class="SileoDepiction-author">' + author + '</p>';
      content += '</div>';
    }
    content += '<ul class="SileoDepiction-DepictionTabHeaderView">';
    if(json && json.tabs && json.tabs.length > 0) {
      $.each(json.tabs, function(i) {
        var tab = json.tabs[i];
        if(tab.class == 'DepictionStackView') {
          content += addTab(i, (tab.tabname ? tab.tabname : 'Tab ' + (tab + 1)), false);
        }
      });
    }
    content += '<li class="SileoDepiction-border"></li>';
    content += '<li class="SileoDepiction-addTab">+</li>';
    content += '</ul>';
    content += '<div class="SileoDepiction-DepictionTabContentView">';
    if(json && json.tabs && json.tabs.length > 0) {
      $.each(json.tabs, function(i) {
        var tab = json.tabs[i];
        content += '<div class="SileoDepiction-DepictionStackView">';
        if(tab.views && tab.views.length > 0) {
          $.each(tab.views, function(j) {
            var view = tab.views[j];
            if(view) {
              if(view.class == 'DepictionHeaderView')
                content += addHeaderView(i, j, false, view.title);
              else if(view.class == 'DepictionImageView')
                content += addImageView(i, j, view.URL, view.height, view.width, view.horizontalPadding, view.cornerRadius, view.alignment);
              else if(view.class == 'DepictionMarkdownView')
                content += addMarkdownView(i, j, view.useSpacing, view.useRawFormat, view.markdown);
              else if(view.class == 'DepictionScreenshotsView')
                content += addScreenshotsView(i, j, view.screenshots, view.itemCornerRadius, view.itemSize);
              else if(view.class == 'DepictionSeparatorView')
                content += addSeparatorView(i, j);
              else if(view.class == 'DepictionSpacerView')
                content += addSpacerView(i, j, view.spacing);
              else if(view.class == 'DepictionSubheaderView')
                content += addSubheaderView(i, j, false, view.title, view.useBoldText, view.useBottomMargin);
              else if(view.class == 'DepictionTableButtonView')
                content += addTableButtonView(i, j, false, view.action, view.title);
              else if(view.class == 'DepictionTableTextView')
                content += addTableTextView(i, j, false, view.title, view.text);
              else
                alert(view.class + ' not yet supported.');
            }
          });
        }
        content += addEditView();
        content += '</div>';
      });
    }
    content += '</div>';
    content += '</div>';
    content += '<div class="SileoDepiction-DepictionModalView"><div class="SileoDepiction-modal">';
    content += '<div class="SileoDepiction-modal-header"><h3>Modal</h3><span class="SileoDepiction-closeModal">&times;</span></div>';
    content += '<div class="SileoDepiction-modal-body"></div></div></div></div>';
    container.html(content);
    var h = container.find('.SileoDepiction-DepictionTabHeaderView');
    var c = h.children().first();
    if(c.hasClass('SileoDepiction-tabSwitch')) {
      updateStackView(c);
    } else {
      updateBorder(h);
    }
  }
  function stringifySileoDepiction(container) {
    var stringified = '';
    var depic = container.find('.SileoDepiction-DepictionTabView').first();
    if(depic && depic.length > 0) {
      var json = {
        class:       'DepictionTabView',
        headerImage: depic.find('.SileoDepiction-headerImage').css('background-image').replace(')','').replace('url(', '').replace(/\"/gi, ''),
        minVersion:  parseFloat(depic.attr('data-minversion')),
        tabs:        []
      };
      $.each(depic.find('.SileoDepiction-DepictionStackView'), function(i) {
        if(!$(this).hasClass('.SileoDepiction-edit')) {
          var tab = {
            class:   'DepictionStackView',
            tabname: depic.find('.SileoDepiction-tabSwitch:nth-child(' + (i + 1) + ') .SileoDepiction-text').text(),
            views:   []
          };
          $.each($(this).children(), function(j) {
            if($(this).hasClass('SileoDepiction-DepictionHeaderView')) {
              tab.views.push({
                class: 'DepictionHeaderView',
                title: $(this).find('.SileoDepiction-text').text()
              });
            } else if($(this).hasClass('SileoDepiction-DepictionImageView')) {
              tab.views.push({
                class:             'DepictionImageView',
                alignment:         parseInt($(this).find('img').attr('data-alignment') ? $(this).find('img').attr('data-alignment') : 0),
                cornerRadius:      parseFloat(($(this).find('img').attr('data-cornerradius') ? $(this).find('img').attr('data-cornerradius') : '0')),
                height:            parseFloat(($(this).find('img').attr('height') * 2).toFixed(5)),
                horizontalPadding: parseFloat(($(this).find('img').attr('data-horizontalpadding') ? $(this).find('img').attr('data-horizontalpadding') : '0')),
                URL:               $(this).find('img').attr('src'),
                width:             parseFloat(($(this).find('img').attr('width') * 2).toFixed(5)),
              });
            } else if($(this).hasClass('SileoDepiction-DepictionMarkdownView')) {
              tab.views.push({
                class:        'DepictionMarkdownView',
                markdown:     converter.makeMarkdown($(this).children().first().html()),
                useRawFormat: ($(this).attr('data-userawformat') ? true : false),
                useSpacing:   ($(this).attr('data-SileoDepiction-useSpacing') ? true : false)
              });
            } else if($(this).hasClass('SileoDepiction-DepictionScreenshotsView')) {
              var view = {
                class:            'DepictionScreenshotsView',
                itemSize:         $(this).attr('data-itemsize'),
                itemCornerRadius: parseFloat(($(this).attr('data-itemcornerradius') ? $(this).attr('data-itemcornerradius') : '0')),
                screenshots: []
              };
              $.each($(this).find('img'), function(k) {
                if($(this).attr('src')) {
                  view.screenshots.push({
                    accessibilityText: ($(this).attr('alt') ? $(this).attr('alt') : 'Screenshot'),
                    url:               $(this).attr('src')
                  });
                }
              });
              tab.views.push(view);
            } else if($(this).hasClass('SileoDepiction-DepictionSeparatorView')) {
              tab.views.push({
                class: 'DepictionSeparatorView'
              });
            } else if($(this).hasClass('SileoDepiction-DepictionSpacerView')) {
              tab.views.push({
                class:  'DepictionSpacerView',
                spacing: parseFloat($(this).attr('data-spacing'))
              });
            } else if($(this).hasClass('SileoDepiction-DepictionSubheaderView')) {
              tab.views.push({
                class:            'DepictionSubheaderView',
                useBoldText:      ($(this).find('p').hasClass('SileoDepiction-useBoldText') ? true : false),
                useBottomMargin:  ($(this).find('p').hasClass('SileoDepiction-useBottomMargin') ? true : false),
                title:            $(this).find('p').text()
              });
            } else if($(this).hasClass('SileoDepiction-DepictionTableButtonView')) {
              tab.views.push({
                class: 'DepictionTableButtonView',
                action: $(this).find('a').attr('href'),
                title:  $(this).find('.SileoDepiction-text').text()
              });
            } else if($(this).hasClass('SileoDepiction-DepictionTableTextView')) {
              tab.views.push({
                class: 'DepictionTableTextView',
                text:  $(this).find('.SileoDepiction-text').text(),
                title: $(this).find('.SileoDepiction-title').text()
              });
            } else if(!$(this).hasClass('SileoDepiction-editSileoDepiction')) {
              alert($(this).attr('class') + ' not yet supported.');
            }
          });
          json.tabs.push(tab);
        }
      });
      try {
        stringified = JSON.stringify(json);
      } catch(error) {
        alert('Impossible to stringify the value.');
        console.log(error);
      }
    } else {
      alert('No depiction found.');
    }
    return stringified;
  }
  function addTab(i, name, edit) {
    return '<li data-tab="' + i + '" class="SileoDepiction-tabSwitch"><div class="SileoDepiction-text contenteditable"' +
    (edit ?
      ' contenteditable="true"' :
      ''
    ) +
    '>' +
    (name && name.length > 0 ?
      name :
      'Tab ' + (i + 1)
    ) +
    '</div><span class="SileoDepiction-removeTab">&times;</span>' +
    '</li>';
  }
  function addEditView() {
    return '<div class="SileoDepiction-editSileoDepiction">' +
    '<select>' +
    '<option>Select a view</option>' +
    '<option value="header">Header</option>' +
    '<option value="image">Image</option>' +
    '<option value="markdown">Markdown</option>' +
    '<option value="screenshots">Screenshots</option>' +
    '<option value="separator">Separator</option>' +
    '<option value="spacer">Spacer</option>' +
    '<option value="subheader">Subheader</option>' +
    '<option value="tablebutton">Table button</option>' +
    '<option value="tabletext">Table text</option>' +
    '</select><br />' +
    '<button class="addSileoDepiction">Add</button>' +
    '</div>';
  }
  function addHeaderView(i, j, edit, title) {
    return '<div id="SileoDepiction-' + i + '-' + j + '" data-name="Header" class="SileoDepiction-DepictionHeaderView"><div class="SileoDepiction-text contenteditable"' +
    (edit ?
      ' contenteditable="true"' :
      ''
    ) +
    '>' +
    (title && title.length > 0 ?
      title :
      'No title'
    ) +
    '</div><span class="SileoDepiction-removeView">&times;</span></div>';
  }
  function addImageView(i, j, URL, height, width, horizontalPadding, cornerRadius, alignment) {
    return '<div id="SileoDepiction-' + i + '-' + j + '" data-name="Image" class="SileoDepiction-DepictionImageView"' +
    (alignment ?
      ' style="text-align:' +
      (alignment == 1 ?
        'center;"' :
        'right;"'
      ) :
      ''
    ) + 
    '><img src="' +
    (URL && URL.length > 0 ?
      URL :
      ''
    ) +
    '" height="' +
    (height > 0 ?
      height * 0.5 :
      ''
    ) +
    '" width="' +
    (width > 0 ?
      width * 0.5 :
      ''
    ) +
    '" style="' +
    (height > 0 ?
      'height:' + (height * 0.5) + 'px;' :
      ''
    ) +
    (width > 0 ?
      'width:' + (width * 0.5) + 'px;' :
      ''
    ) +
    (horizontalPadding ?
      'padding: 0 ' + (horizontalPadding * 0.5) + 'px;' :
      ''
    ) +
    (cornerRadius ?
      'border-radius:' + cornerRadius + 'px;' :
      ''
    ) +
    (alignment ?
      'text-align:' +
      (alignment == 1 ?
        'center;' :
        'right;'
      ) +
      '" data-alignment="' + alignment :
      ''
    ) +
    (horizontalPadding ?
      '" data-horizontalpadding="' + horizontalPadding :
      ''
    ) +
    (cornerRadius ?
      '" data-cornerradius="' + cornerRadius :
      ''
    ) +
    '" alt="Image" />' +
    '<span class="SileoDepiction-removeView">&times;</span>' +
    '<span class="SileoDepiction-wrenchView">Edit</span>' +
    '</div>';
  }
  function addMarkdownView(i, j, useSpacing, useRawFormat, markdown) {
    if(useRawFormat) {
      converter.setOption('rawHeaderId', true);
      converter.setOption('rawPrefixHeaderId', true);
    } else {
      converter.setOption('rawHeaderId', false);
      converter.setOption('rawPrefixHeaderId', false);
    }
    return'<div id="SileoDepiction-' + i + '-' + j + '" data-name="Markdown" class="SileoDepiction-DepictionMarkdownView"' +
    (useSpacing ?
      ' SileoDepiction-useSpacing" data-usespacing="true"' :
      '"'
    ) +
    (useRawFormat ?
      ' data-userawformat="true"' :
      ''
    ) +
    '><div id="SileoDepiction-markdown-' + i + '-' + j + '">' +
    converter.makeHtml((markdown ? markdown : 'No markdown').replace(/(body|html)/, '#SileoDepiction-markdown-' + i + '-' + j + '{')) +
    '</div>' +
    '<span class="SileoDepiction-removeView">&times;</span>' +
    '<span class="SileoDepiction-wrenchView">Edit</span>' +
    '</div>';
  }
  function addScreenshotsView(i, j, screenshots, itemCornerRadius, itemSize) {
    var cornerRadius, height, width = 0;
    if(itemCornerRadius) {
      cornerRadius = itemCornerRadius;
    } else {
      itemCornerRadius = 0;
    }
    if(itemSize) {
      var is = itemSize.replace('{','').replace('}','').split(',');
      if(Array.isArray(is)) {
        if(is[0] > 0) {
          width = parseFloat(is[0]) * 0.75;
        }
        if(is[1] > 0) {
          height = parseFloat(is[1]) * 0.75;
        }
      }
    } else {
      itemSize = '';
    }
    var content = '<div id="SileoDepiction-' + i + '-' + j + '" data-name="Screenshots" class="SileoDepiction-DepictionScreenshotsView" data-itemcornerradius="' + itemCornerRadius + '" data-itemsize="' + itemSize + '">';
    content += '<ul style="height:' + height + 'px">';
    if(screenshots && screenshots.length > 0) {
      $.each(screenshots, function(i) {
        if(screenshots[i].url) {
          content += '<li style="border-radius:' + cornerRadius + ';height:' + height + 'px;width:' + width + 'px">';
          content += '<img src="' + screenshots[i].url + '" alt="';
          if(screenshots[i].accessibilityText) {
            content += screenshots[i].accessibilityText;
          } else {
            content += 'Screenshot'
          }
          content += '" style="border-radius:' + cornerRadius + 'px;height:' + height + 'px;width:' + width + 'px" height="' + height + '" width="' + width + '" />';
          content += '</li>';
        }
      });
    }
    content += '</ul>';
    content += '<span class="SileoDepiction-removeView">&times;</span>';
    content += '<span class="SileoDepiction-wrenchView">Edit</span>';
    content += '</div>';
    return content;
  }
  function addSeparatorView(i, j) {
    return '<div id="SileoDepiction-' + i + '-' + j + '" data-name="Separator" class="SileoDepiction-DepictionSeparatorView"><span class="SileoDepiction-removeView">&times;</span></div>';
  }
  function addSpacerView(i, j, spacing) {
    return '<div id="SileoDepiction-' + i + '-' + j + '" data-name="Spacer" class="SileoDepiction-DepictionSpacerView"' +
    (spacing && spacing > 0 ?
      ' style="height:' + (spacing * 0.5) + 'px" data-spacing="' + spacing + '"' :
      ' data-spacing="0"'
    ) +
    '><span class="SileoDepiction-removeView">&times;</span><span class="SileoDepiction-wrenchView">Edit</span></div>';
  }
  function addSubheaderView(i, j, edit, title, useBoldText, useBottomMargin) {
    return '<div id="SileoDepiction-' + i + '-' + j + '" data-name="Subheader" class="SileoDepiction-DepictionSubheaderView">' +
    '<p class="contenteditable ' + (useBoldText ? ' SileoDepiction-useBoldText' : '') + (useBottomMargin ? ' SileoDepiction-useBottomMargin' : '') + '"' +
    (edit ?
      ' contenteditable="true"' :
      ''
    ) +
    '>' +
    (title && title.length > 0 ?
      title :
      'No title'
    ) +
    '</p><span class="SileoDepiction-removeView">&times;</span><span class="SileoDepiction-wrenchView">Edit</span></div>';
  }
  function addTableButtonView(i, j, edit, action, title) {
    return '<div id="SileoDepiction-' + i + '-' + j + '" data-name="Table button" class="SileoDepiction-DepictionTableButtonView"><a target="_blank" ' +
    (action && action.length > 0 ?
      ' href="' + action + '"' :
      ''
    ) +
    '><div class="SileoDepiction-text contenteditable"' +
    (edit ?
      ' contenteditable="true"' :
      ''
    ) +
    '>' +
    (title && title.length > 0 ?
      title :
      'No title'
    ) +
    '</div><span class="SileoDepiction-link">Link</span><span class="SileoDepiction-chevron">›</span></a><span class="SileoDepiction-removeView">&times;</span></div>';
  }
  function addTableTextView(i, j, edit, title, text) {
    return '<div id="SileoDepiction-' + i + '-' + j + '" data-name="Table text" class="SileoDepiction-DepictionTableTextView"><div class="SileoDepiction-title contenteditable"' +
    (edit ?
      ' contenteditable="true"' :
      ''
    ) +
    '>' +
    (title && title.length > 0 ?
      title :
      'No title'
    ) +
    '</div><div class="SileoDepiction-text contenteditable"' +
    (edit ?
      ' contenteditable="true"' :
      ''
    ) +
    '>' +
    (text && text.length > 0 ?
      text :
      'No text'
    ) +
    '</div><span class="SileoDepiction-removeView">&times;</span></div>';
  }
  function delay(callback, ms) {
    var timer = 0;
    return function() {
      var context = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        callback.apply(context, args);
      }, ms || 0);
    };
  }
  function updateBorder(ul) {
    var t = ul.find('.SileoDepiction-tabSwitch.SileoDepiction-active');
    if(t.length) {
      ul.find('li.SileoDepiction-border').animate({left: (t.get(0).offsetLeft + 2 + ((parseInt(t.attr('data-tab')) + 1) == 1 ? 20 : 0)), width: t.width() + 4}, 'fast');
    } else {
      ul.find('li.SileoDepiction-border').animate({width:0}, 'fast');
    }
  }
  function updateStackView(li) {
    var clicked = parseInt(li.attr('data-tab')) + 1;
    var ul = li.parent();
    ul.find('.SileoDepiction-tabSwitch').removeClass('SileoDepiction-active');
    li.addClass('SileoDepiction-active');
    var left = 0;
    for(var i = 0;i < clicked;i++) {
      if(i < (clicked - 1)) {
        left += ul.find('.SileoDepiction-tabSwitch[data-tab="' + i + '"]').width() + 4;
      } else {
        left -= ul.width() * 0.5 + 10 - ul.find('.SileoDepiction-tabSwitch[data-tab="' + i + '"]').width();
      }
    }
    updateBorder(ul);
    ul.animate({scrollLeft: left}, 'fast');
    ul.next().animate({
      scrollLeft: ((clicked - 1) * 281.5),
      height: ul.next().find('.SileoDepiction-DepictionStackView:nth-child(' + clicked + ')').height() + 'px'
    }, 'fast');
  }
  $(document).on('click', '.addSileoDepiction', function(e) {
    e.preventDefault();
    var parent = $(this).parent();
    var stack = parent.parent();
    var container = stack.parent();
    var li = container.prev().find('.SileoDepiction-tabSwitch.SileoDepiction-active');
    switch($(this).prev().prev().val()) {
      case 'header':
        parent.before(addHeaderView(li.attr('data-tab'), (stack.children().length - 1), true));
        break;
      case 'image':
        parent.before(addImageView(li.attr('data-tab'), (stack.children().length - 1)));
        break;
      case 'markdown':
        parent.before(addMarkdownView(li.attr('data-tab'), (stack.children().length - 1)));
        break;
      case 'screenshots':
        parent.before(addScreenshotsView(li.attr('data-tab'), (stack.children().length - 1)));
        break;
      case 'separator':
        parent.before(addSeparatorView(li.attr('data-tab'), (stack.children().length - 1)));
        break;
      case 'spacer':
        parent.before(addSpacerView(li.attr('data-tab'), (stack.children().length - 1), 10));
        break;
      case 'subheader':
        parent.before(addSubheaderView(li.attr('data-tab'), (stack.children().length - 1), true));
        break;
      case 'tablebutton':
        parent.before(addTableButtonView(li.attr('data-tab'), (stack.children().length - 1), true));
        break;
      case 'tabletext':
        parent.before(addTableTextView(li.attr('data-tab'), (stack.children().length - 1), true));
        break;
      default:
        alert('Please select a view.');
    }
    updateStackView(li);
  });
  $(document).on('click', '.SileoDepiction-edit .SileoDepiction-DepictionTableButtonView a', function(e) {
    e.preventDefault();
  });
  $(document).on('click', '.SileoDepiction-edit .SileoDepiction-DepictionTableButtonView a .SileoDepiction-link', function(e) {
    e.preventDefault();
    var url = window.prompt('What URL do you want to use?', $(this).parent().attr('href'));
    if(url) {
      $(this).parent().attr('href', url);
    }
  });
  $(document).on('click', '.SileoDepiction-DepictionTabView .SileoDepiction-tabSwitch', function(e) {
    e.preventDefault();
    var t = $(this);
    var clicked = parseInt(t.attr('data-tab')) + 1;
    var ul = t.parent();
    ul.find('.SileoDepiction-tabSwitch').removeClass('SileoDepiction-active');
    t.addClass('SileoDepiction-active');
    updateStackView(t);
  });
  $(document).on('click', '.SileoDepiction-DepictionTabView .SileoDepiction-addTab', function(e) {
    e.preventDefault();
    var newTab = $(this).parent().next().find('.SileoDepiction-DepictionStackView').length;
    $(this).prev().before(addTab(newTab, 'Tab ' + (newTab + 1), true));
    $(this).parent().next().append('<div class="SileoDepiction-DepictionStackView">' + addEditView() + '</div>');
    $(this).parent().find('.SileoDepiction-tabSwitch').removeClass('SileoDepiction-active');
    var li = $(this).parent().find('.SileoDepiction-tabSwitch').last();
    updateStackView(li);
    li.find('.SileoDepiction-text').focus();
  });
  $(document).on('click', '.SileoDepiction-DepictionTabView .SileoDepiction-removeTab', function(e) {
    e.preventDefault();
    e.stopPropagation();
    if(window.confirm('Are you sure you want to delete this tab and all views?')) {
      var li = $(this).parent();
      var prev = $(this).parent().prev();
      var next = $(this).parent().next();
      var isActive = $(this).parent().hasClass('SileoDepiction-active');
      var clicked = parseInt(li.attr('data-tab')) + 1;
      var ul = li.parent();
      var views = ul.next();
      var total = views.find('.SileoDepiction-DepictionStackView').length;
      li.fadeOut('fast', function() {
        $(this).remove();
      });
      views.find('.SileoDepiction-DepictionStackView:nth-child(' + clicked + ')').fadeOut('fast', function() {
        $(this).remove();
        if(total > 1 && clicked <= total) {
          var i = 0;
          for(i = clicked;i<total;i++) {
            ul.find('.SileoDepiction-tabSwitch[data-tab="' + i + '"]').attr('data-tab', (i - 1));
          }
          if(isActive && clicked == 1) {
            next.addClass('SileoDepiction-active');
          } else if(isActive) {
            prev.addClass('SileoDepiction-active');
          }
          updateStackView(ul.find('.SileoDepiction-tabSwitch.SileoDepiction-active'));
        } else {
          updateBorder(ul);
        }
      });
    }
  });
  $(document).on('keydown keyup', '.SileoDepiction-DepictionTabView .SileoDepiction-tabSwitch .SileoDepiction-text', function (e) {
    updateBorder($(this).parent().parent());
  });
  $(document).on('click', '.SileoDepiction-DepictionTabContentView .SileoDepiction-wrenchView', function(e) {
    e.preventDefault();
    e.stopPropagation();
    var parent = $(this).parent();
    var stack = $(this).parent().parent();
    var modal = stack.parent().parent().parent().find('.SileoDepiction-DepictionModalView');
    modal.attr('data-view', parent.attr('id'));
    modal.attr('data-type', parent.attr('class'));
    modal.addClass('SileoDepiction-visible');
    var titleModal = modal.find('h3');
    var bodyModal = modal.find('.SileoDepiction-modal-body');
    if(parent.hasClass('SileoDepiction-DepictionImageView')) {
      titleModal.text(parent.attr('data-name'));
      bodyModal.html('<p class="SileoDepiction-text-center"><label for="URL">Image URL</label></p>');
      var p = $('<p>').appendTo(bodyModal);
      p.html($('<input>').attr({type: 'text', placeholder: 'Image URL', value: parent.find('img').attr('src'), name: 'URL', id: 'URL'}));
      bodyModal.append('<p class="SileoDepiction-text-center"><label for="height">Height</label></p>');
      var p = $('<p>').appendTo(bodyModal);
      p.append($('<input>').attr({type: 'number', step: '0.01', placeholder: 'Height', value: (parseFloat(parent.find('img').attr('height') ? parent.find('img').attr('height') : '0') * 2).toFixed(5), name: 'height', id: 'height'}));
      bodyModal.append('<p class="SileoDepiction-text-center"><label for="width">Width</label></p>');
      var p = $('<p>').appendTo(bodyModal);
      p.append($('<input>').attr({type: 'number', step: '0.01', placeholder: 'Width', value: (parseFloat(parent.find('img').attr('width') ? parent.find('img').attr('width') : '0') * 2).toFixed(5), name: 'width', id: 'width'}));
      bodyModal.append('<p class="SileoDepiction-text-center"><label for="alignment">Alignment</label></p>');
      var p = $('<p>').appendTo(bodyModal);
      var select = $('<select>').attr({id: 'alignment', name: 'alignment'}).appendTo(p);
      var alignment = parseInt(parent.find('img').attr('data-alignment') ? parent.find('img').attr('data-alignment') : 0);
      var optionLeft = $("<option>").attr('value', '0').text('Left');
      select.append(optionLeft);
      var optionCenter = $("<option>").attr('value', '1').text('Center');
      if(alignment == 1) {
        optionCenter.attr('selected', 'selected');
      }
      select.append(optionCenter);
      var optionRight = $("<option>").attr('value', '2').text('Right');
      if(alignment == 2) {
        optionRight.attr('selected', 'selected');
      }
      select.append(optionRight);
      bodyModal.append('<p class="SileoDepiction-text-center"><label for="cornerRadius">Corner radius</label></p>');
      var p = $('<p>').appendTo(bodyModal);
      p.append($('<input>').attr({type: 'number', step: '0.01', placeholder: 'Corner radius', value: parseFloat(parent.find('img').attr('data-cornerradius') ? parent.find('img').attr('data-cornerradius') : '0'), name: 'cornerRadius', id: 'cornerRadius'}));
      bodyModal.append('<p class="SileoDepiction-text-center"><label for="horizontalPadding">Horizontal padding</label></p>');
      var p = $('<p>').appendTo(bodyModal);
      p.append($('<input>').attr({type: 'number', step: '0.01', placeholder: 'Horizontal padding', value: parseFloat(parent.find('img').attr('data-horizontalpadding') ? parent.find('img').attr('data-horizontalpadding') : '0'), name: 'horizontalPadding', id: 'horizontalPadding'}));
      bodyModal.append('<p><button class="saveModal">Save</button></p>');
    } else if(parent.hasClass('SileoDepiction-DepictionMarkdownView')) {
      titleModal.text(parent.attr('data-name'));
      bodyModal.html('<p><textarea placeholder="Markdown">' + converter.makeMarkdown(parent.children().first().html()) + '</textarea></p>');
      var useRawFormat = $('<input>').attr({type: 'checkbox', name: 'useRawFormat', id: 'useRawFormat'});
      if(parent.attr('data-userawformat')) {
        useRawFormat.attr('checked', 'checked');
      }
      var p = $('<p>').appendTo(bodyModal);
      p.html('<label for="useRawFormat">Use raw format : </label>');
      p.append(useRawFormat);
      var useSpacing = $('<input>').attr({type: 'checkbox', name: 'useSpacing', id: 'useSpacing'});
      if(parent.attr('data-usespacing')) {
        useSpacing.attr('checked', 'checked');
      }
      var p = $('<p>').appendTo(bodyModal);
      p.html('<label for="useSpacing">Use spacing : </label>');
      p.append(useSpacing);
      bodyModal.append('<p><button class="saveModal">Save</button></p>');
    } else if(parent.hasClass('SileoDepiction-DepictionScreenshotsView')) {
      var width, height = 0;
      if(parent.attr('data-itemsize')) {
        var is = parent.attr('data-itemsize').replace('{','').replace('}','').split(',');
        if(Array.isArray(is)) {
          if(is[0] > 0) {
            width = parseFloat(is[0]);
          }
          if(is[1] > 0) {
            height = parseFloat(is[1]);
          }
        }
      }
      titleModal.text(parent.attr('data-name'));
      bodyModal.html('<p class="SileoDepiction-text-center"><label for="itemCornerRadius">Corner radius</label></p>');
      var p = $('<p>').appendTo(bodyModal);
      p.append($('<input>').attr({type: 'number', step: '0.01', placeholder: 'Corner radius', value: parseFloat(parent.attr('data-itemcornerradius') ? parent.attr('data-itemcornerradius') : '0'), name: 'itemCornerRadius', id: 'itemCornerRadius'}));
      bodyModal.append('<p class="SileoDepiction-text-center"><label for="height">Height</label></p>');
      var p = $('<p>').appendTo(bodyModal);
      p.append($('<input>').attr({type: 'number', step: '0.01', placeholder: 'Height', value: height, name: 'height', id: 'height'}));
      bodyModal.append('<p class="SileoDepiction-text-center"><label for="width">Width</label></p>');
      var p = $('<p>').appendTo(bodyModal);
      p.append($('<input>').attr({type: 'number', step: '0.01', placeholder: 'Width', value: width, name: 'width', id: 'width'}));
      bodyModal.append('<hr />');
      $.each(parent.find('img'), function(k) {
        var div = $('<div data-screen="' + (k + 1) + '">').appendTo(bodyModal);
        div.html('<p class="SileoDepiction-text-center">Screenshot ' + (k + 1) + '<span class="SileoDepiction-removeScreenshot">&times;</span></p>');
        div.append('<p class="SileoDepiction-text-center"><label for="URL[' + (k + 1) +']">Image URL</label></p>');
        var p = $('<p>').appendTo(div);
        p.html($('<input>').attr({type: 'text', placeholder: 'Image URL', value: ($(this).attr('src') ? $(this).attr('src') : ''), name: 'URL[]', id: 'URL[' + (k + 1) +']'}));
        div.append('<p class="SileoDepiction-text-center"><label for="accessibilityText[' + (k + 1) +']">Accessibility text</label></p>');
        var p = $('<p>').appendTo(div);
        p.html($('<input>').attr({type: 'text', placeholder: 'Accessibility text', value: ($(this).attr('alt') ? $(this).attr('alt') : ''), name: 'accessibilityText[]', id: 'accessibilityText[' + (k + 1) +']'}));
        div.append('<hr />');
      });
      bodyModal.append('<p><button class="addMoreScreenshot">Add another screenshot</button></p>');
      bodyModal.append('<p><button class="saveModal">Save</button></p>');
    } else if(parent.hasClass('SileoDepiction-DepictionSpacerView')) {
      titleModal.text(parent.attr('data-name'));
      bodyModal.html('<p class="SileoDepiction-text-center"><label for="spacing">Spacing :</label></p>');
      var p = $('<p>').appendTo(bodyModal);
      p.html($('<input>').attr({type: 'number', step: '0.01', placeholder: 'Spacing', value: parent.attr('data-spacing'), name: 'spacing', id: 'spacing'}));
      bodyModal.append('<p><button class="saveModal">Save</button></p>');
    } else if(parent.hasClass('SileoDepiction-DepictionSubheaderView')) {
      titleModal.text(parent.attr('data-name'));
      bodyModal.html('<p class="SileoDepiction-text-center"><label for="title">Title :</label></p>');
      var p = $('<p>').appendTo(bodyModal);
      p.html($('<input>').attr({type: 'text', placeholder: 'Title', value: parent.children().first().text(), name: 'title', id: 'title'}));
      var useBoldText = $('<input>').attr({type: 'checkbox', name: 'useBoldText', id: 'useBoldText'});
      if(parent.children().first().hasClass('SileoDepiction-useBoldText')) {
        useBoldText.attr('checked', 'checked');
      }
      var p = $('<p>').appendTo(bodyModal);
      p.html('<label for="useBoldText">Use bold text : </label>');
      p.append(useBoldText);
      var useBottomMargin = $('<input>').attr({type: 'checkbox', name: 'useBottomMargin', id: 'useBottomMargin'});
      if(parent.children().first().hasClass('SileoDepiction-useBottomMargin')) {
        useBottomMargin.attr('checked', 'checked');
      }
      var p = $('<p>').appendTo(bodyModal);
      p.html('<label for="useBottomMargin">Use bottom margin : </label>');
      p.append(useBottomMargin);
      bodyModal.append('<p><button class="saveModal">Save</button></p>');
    } else {
      titleModal.text('Modal');
      bodyModal.html('<p>In progress...</p>');
      alert(parent.attr('class') + ' is not yet supported.');
    }
  });
  $(document).on('click', '.addMoreScreenshot', function(e) {
    e.preventDefault();
    var n = $(this).parent().parent().find('input[name="URL[]"]').length + 1;
    var div = $('<div data-screen="' + n + '">');
    $(this).parent().before(div);
    div.html('<p class="SileoDepiction-text-center">Screenshot ' + n + '<span class="SileoDepiction-removeScreenshot" data-screen="' + n + '">&times;</span></p>');
    div.append('<p class="SileoDepiction-text-center"><label for="URL[' + n +']">Image URL</label></p>');
    var p = $('<p>').appendTo(div);
    p.html($('<input>').attr({type: 'text', placeholder: 'Image URL', value: '', name: 'URL[]', id: 'URL[' + n +']'}));
    div.append('<p class="SileoDepiction-text-center"><label for="accessibilityText[' + n +']">Accessibility text</label></p>');
    var p = $('<p>').appendTo(div);
    p.html($('<input>').attr({type: 'text', placeholder: 'Accessibility text', value: '', name: 'accessibilityText[]', id: 'accessibilityText[' + n +']'}));
    div.append('<hr />');
  });
  $(document).on('click', '.saveModal', function(e) {
    e.preventDefault();
    var modalContent = $(this).parent().parent();
    var modal = modalContent.parent().parent();
    var target = $('#' + modal.attr('data-view'));
    var type = modal.attr('data-type');
    if(target && type) {
      if(type == 'SileoDepiction-DepictionImageView') {
        var style = '';
        var select = modal.find('select[name="alignment"] option:selected').val();
        if(select) {
          target.find('img').attr('data-alignment', select);
          if(select == 1) {
            target.attr('style', 'text-align:center');
          } else {
            target.attr('style', 'text-align:right');
          }
        } else {
          target.find('img').attr('data-alignment', '0');
          target.attr('style', 'text-align:left');
        }
        var cornerRadius = modal.find('input[name="cornerRadius"]').val();
        if(cornerRadius) {
          target.find('img').attr('data-cornerradius', cornerRadius);
          style += 'border-radius:' + cornerRadius + 'px;';
        } else {
          target.find('img').attr('data-cornerradius', '0');
        }
        var horizontalpadding = modal.find('input[name="horizontalPadding"]').val();
        if(horizontalpadding) {
          target.find('img').attr('data-horizontalpadding', horizontalpadding);
          style += 'padding:0 ' + (horizontalpadding * 0.5) + 'px;';
        } else {
          target.find('img').attr('data-horizontalpadding', '0');
          style += 'padding:0;';
        }
        var height = modal.find('input[name="height"]').val();
        if(height) {
          target.find('img').attr('height', (height * 0.5));
          style += 'height:' + (height * 0.5) + 'px;';
        } else {
          target.find('img').attr('height', 0);
        }
        var width = modal.find('input[name="width"]').val();
        if(width) {
          target.find('img').attr('width', (width * 0.5));
          style += 'width:' + (width * 0.5) + 'px;';
        } else {
          target.find('img').attr('width', 0);
        }
        var URL = modal.find('input[name="URL"]').val();
        if(URL) {
          target.find('img').attr('src', URL);
        }
        target.find('img').attr('style', style);
        modal.removeClass('SileoDepiction-visible');
        updateStackView(modal.prev().find('.SileoDepiction-tabSwitch.SileoDepiction-active'));
      } else if(type == 'SileoDepiction-DepictionMarkdownView') {
        if(modal.find('input[name="useRawFormat"]').prop('checked')) {
          converter.setOption('rawHeaderId', true);
          converter.setOption('rawPrefixHeaderId', true);
          target.attr('data-userawformat', 'true');
        } else {
          converter.setOption('rawHeaderId', false);
          converter.setOption('rawPrefixHeaderId', false);
          target.removeAttr('data-userawformat');
        }
        if(modal.find('input[name="useSpacing"]').prop('checked')) {
          target.attr('data-usespacing', 'true');
          target.attr('style', 'padding:10px 0');
        } else {
          target.removeAttr('data-usespacing');
          target.removeAttr('style');
        }
        target.children().first().html(converter.makeHtml((modal.find('textarea').val() ? modal.find('textarea').val() : 'No markdown')));
        modal.removeClass('SileoDepiction-visible');
        updateStackView(modal.prev().find('.SileoDepiction-tabSwitch.SileoDepiction-active'));
      } else if(type == 'SileoDepiction-DepictionScreenshotsView') {
        var style = '';
        var height = modal.find('input[name="height"]').val();
        var ul = target.find('ul');
        if(!height || parseFloat(height) <= 0) {
          height = 0;
        } else {
          style += 'height:' + (height * 0.75) + 'px;';
        }
        var width = modal.find('input[name="width"]').val();
        if(!width || parseFloat(width) <= 0) {
          width = 0;
        } else {
          style += 'width:' + (width * 0.75) + 'px;';
        }
        var cornerRadius = modal.find('input[name="itemCornerRadius"]').val();
        if(!cornerRadius || parseFloat(cornerRadius) <= 0) {
          target.attr('data-itemcornerradius', '0');
        } else {
          target.attr('data-itemcornerradius', cornerRadius);
          style += 'border-radius:' + cornerRadius + 'px;';
        }
        target.attr('data-itemsize', '{' + width + ',' + height + '}');
        ul.html('');
        ul.attr('style', 'height:' + (height * 0.75) + 'px');
        $.each(modal.find('input[name="URL[]"]'), function() {
          var li = $('<li>').appendTo(ul);
          li.attr('style', style);
          var img = $('<img />');
          img.attr('src', $(this).val());
          img.attr('style', style);
          img.attr('height', height);
          img.attr('width', width);
          if($(this).parent().next().next().find('input').val()) {
            img.attr('alt', $(this).parent().next().next().find('input').val());
          } else {
            img.attr('alt', 'Screenshot');
          }
          li.html(img);
        });
        modal.removeClass('SileoDepiction-visible');
        updateStackView(modal.prev().find('.SileoDepiction-tabSwitch.SileoDepiction-active'));
      } else if(type == 'SileoDepiction-DepictionSpacerView') {
        var spacing = modal.find('input[name="spacing"]').val();
        if(spacing) {
          target.attr('style', 'height:' + (spacing * 0.5) + 'px');
          target.attr('data-spacing', spacing);
        } else {
          target.attr('data-spacing', '0');
          target.removeAttr('style');
        }
        modal.removeClass('SileoDepiction-visible');
        updateStackView(modal.prev().find('.SileoDepiction-tabSwitch.SileoDepiction-active'));
      } else if(type == 'SileoDepiction-DepictionSubheaderView') {
        target.children().first().text(modal.find('input[name="title"]').val());
        if(modal.find('input[name="useBoldText"]').prop('checked')) {
          target.children().first().addClass('SileoDepiction-useBoldText');
        } else {
          target.children().first().removeClass('SileoDepiction-useBoldText');
        }
        if(modal.find('input[name="useBottomMargin"]').prop('checked')) {
          target.children().first().addClass('SileoDepiction-useBottomMargin');
        } else {
          target.children().first().removeClass('SileoDepiction-useBottomMargin');
        }
        modal.removeClass('SileoDepiction-visible');
        updateStackView(modal.prev().find('.SileoDepiction-tabSwitch.SileoDepiction-active'));
      } else {
        alert(type + ' is not yet supported.');
      }
    } else {
      alert(modal.attr('data-view') + ' is not a view.');
    }
  });
  $(document).on('click', '.SileoDepiction-closeModal', function(e) {
    e.preventDefault();
    $(this).parent().parent().parent().removeClass('SileoDepiction-visible');
  });
  $(document).on('click', '.SileoDepiction-DepictionTabContentView .SileoDepiction-removeView', function(e) {
    e.preventDefault();
    e.stopPropagation();
    var parent = $(this).parent();
    var ul = parent.parent().parent().prev();
    parent.addClass('SileoDepiction-blink');
    if(window.confirm('Are you sure you want to delete this view : ' + parent.attr('data-name') + ' ?')) {
      parent.fadeOut('fast', function() {
        $(this).remove();
        updateStackView(ul.find('.SileoDepiction-tabSwitch.SileoDepiction-active'));
      });
    } else {
      parent.removeClass('SileoDepiction-blink');
    }
  });
  $(document).on('click', '.SileoDepiction-removeScreenshot', function(e) {
    e.preventDefault();
    var parent = $(this).parent().parent();
    var modal = parent.parent();
    var n = parent.attr('data-screen');
    if(n) {
      parent.removeAttr('data-screen');
      var length = modal.find('input[name="URL[]"]').length;
      parent.fadeOut('fast', function() {
        $(this).remove();
      });
      for(var i = n; n < length; n++) {
        var urlInput = modal.find('label[for="URL[' + (parseInt(n) + 1) + ']"]');
        urlInput.parent().prev().html('Screenshot ' + n + '<span class="SileoDepiction-removeScreenshot">&times;</span>');
        urlInput.parent().next().find('input').attr('id', 'URL[' + n + ']');
        urlInput.parent().next().next().attr('for', 'accessibilityText[' + n + ']');
        urlInput.parent().next().next().next().find('input').attr('id', 'accessibilityText[' + n + ']');
        urlInput.parent().parent().attr('data-screen', n);
        urlInput.attr('for', 'URL[' + n + ']');
      }
    }
  });
}(window));
