// Copyright (c) 2015 Oasiswork.
// All Rights Reserved.
//
// This Source Code Form is subject to the
// terms of the Mozilla Public License, v. 2.0.
// If a copy of the MPL was not distributed with this file,
// You can obtain one at
// http://mozilla.org/MPL/2.0/.

var dtfEditor = (function ( $ ) {
  'use strict';

  /**
   * Blocks Catalog
   */
  var blocksCatalog = {
    // DOM catalog
    blocks  : $('<div>'),
    // DOM content of each block, indexed by name as per configuration.json
    doms    : {},
    // blocks configs dictionnary
    configs : {},

    // Block icons library
    icons   : {
      'title'              : '<i class="icon-text">T</i>',
      'paragraph'          : '<i class="fa fa-2x fa-align-justify"></i>',
      'image'              : '<i class="fa fa-2x fa-picture-o"></i>',
      '2cols_image_top'    : '<i class="fa fa-2x fa-picture-o"></i><i class="fa fa-2x fa-picture-o"></i><br /><i class="fa fa-2x fa fa-align-justify"></i><i class="fa fa-2x fa fa-align-justify"></i>',
      '2cols_image_bottom' : '<i class="fa fa-2x fa fa-align-justify"></i><i class="fa fa-2x fa fa-align-justify"></i><br /><i class="fa fa-2x fa-picture-o"></i><i class="fa fa-2x fa-picture-o"></i>',
      'quote'              : '<i class="icon-text icon-quote">&rdquo;</i>',
      'mixed_image_left'   : '<i class="fa fa-2x fa-picture-o"></i><i class="fa fa-2x fa-align-justify"></i>',
      'mixed_image_right'  : '<i class="fa fa-2x fa-align-justify"></i><i class="fa fa-2x fa-picture-o"></i>',
      'mixed_image_top'    : '<i class="fa fa-2x fa-picture-o"></i><br /><i class="fa fa-2x fa-align-justify"></i>',
      'mixed_image_bottom' : '<i class="fa fa-2x fa-align-justify"></i><br /><i class="fa fa-2x fa-picture-o"></i>'
    },

    get_gallery: function () {
      return this.blocks.children().clone(true, true);
    },

    get_dom: function ( name ) {
      return this.doms[name].html.clone(true, true);
    },

    get_divClass: function ( name ) {
      return this.doms[name].divClass;
    },

    add: function ( name, block_config, dom ) {
      // To be able to call functions within this object
      var that = this;

      // Check if block is unique
      if ( !block_config.isUnique ) {
        var blockIcon = $('<span class="dtable icon"><span class="dtable-cell"></span></span>');
        var blockCaption = $();

        if (block_config.icon in this.icons) {
          blockIcon.find('.dtable-cell').html(this.icons[block_config.icon]);
          var caption = block_config.icon;
          if ('caption' in block_config) caption = block_config.caption;
          blockCaption = $('<span class="dblock">' + caption + '</span>');
        } else {
          blockIcon = $(block_config.icon);
        }
        var link = $('<a class="dtf-block-choice" href="#">')
              .attr('data-block-name', name)
              .append(blockIcon);
        if (blockCaption.length) {
          link.append(blockCaption);
        }

        // Test changeable class in configuration.json
        if ( typeof block_config.listChangeable === "undefined" ) {

          $(block_config.selector).addClass('dtf-draggable');
          this.blocks.first().append(link);

        } else {

          $(block_config.selector).attr('data-change-class', block_config.listChangeable);
          var existBlockDom = {
            "html": $(block_config.selector).first().clone(true, true),
            "divClass": $(block_config.selector).closest("div").attr("class")
          };
          dom = existBlockDom;
          $(block_config.selector).addClass('dtf-draggable');
          this.blocks.first().append(link);

        }

        //Duplicate exist DOM element and add to layout
        link.on('click', function() {
          var dom_block = that.get_dom($(this).attr('data-block-name'));
          dom_block.addClass('dtf-draggable dtf-block');

          var new_row = $(window.templates.baseBlock);
          new_row.find('.dtf-block')
            .replaceWith(dom_block);

          var divClass = that.get_divClass($(this).attr('data-block-name'));

          new_row.addClass(divClass);

          var draft_row = $(this).closest('div.dtf-tr-element');
          draft_row.after(new_row.css('display', 'none'));

          if ( dom_block.hasClass('dtf-changeable') ) {
            dtfLayoutMode.changeClass(dom_block);
          } else {
            dtfLayoutMode.equipBlock(dom_block);
          }
          new_row.show(100);

          undoBtn.flash();

          actionStack.push(function(){
            dtfLayoutMode.deleteBlock(dom_block);
          });

          return false;
        });

      } else if ( block_config.isUnique && typeof block_config.listChangeable !== "undefined" ){

        $(block_config.selector).attr('data-change-class', block_config.listChangeable);
        $(block_config.selector).addClass('isUnique');

      } else {

        $(block_config.selector).addClass('isUnique');

      }
      this.doms[name] = dom;
      this.configs[name] = block_config;
    }
  };

  /**
   * Gets all the block config and initialize them
   */
  var _fetchBlocksConfig = function () {
    _.forOwn(blocks_config.styles, function (config, name) {
      var existBlockDom = {
        "html": $(config.selector).first().clone(true, true),
        "divClass": $(config.selector).closest("div").attr("class")
      };
      blocksCatalog.add(name, config, existBlockDom);

      if ( config.urlckEditor !== undefined ) {
        // Get CKEditor config URL from config
        var ckEditorUrl = getAbsoluteUrl(config.urlckEditor);

        // Fetch CKEditor config
        $.getJSON(ckEditorUrl, function(data) {
          // Set CKEditor language to global lang
          data.ckEditor.language = settings.lang;

          // Initialize the content editables in the block
          $(config.selector).find('.dtf-contentEditable')
          .attr('contentEditable',true)
          .ckeditor(data.ckEditor);
          // Save the block config for future use
          localStorage.setItem(config.selector,JSON.stringify(data.ckEditor));
        });

      } else {

        // Initialize the content editables in the block with default config
        $(config.selector).find('.dtf-contentEditable')
        .attr('contentEditable', true)
        .ckeditor({language: settings.lang});

      }
    });

    dtfContentMode.enter();

  };

  /* Remove data attributes
   */
  var _removeDataAttributes = function ($target) {
    if ( 0 !== $target.length ) {
      var i,
          attrName,
          dataAttrsToDelete = [],
          dataAttrs = $target.get(0).attributes,
          dataAttrsLen = dataAttrs.length;

      // Loop through attributes and make a list of those
      // that begin with 'data-'
      for (i=0; i<dataAttrsLen; i++) {
          if ( 'data-' === dataAttrs[i].name.substring(0,5) ) {
              // Why don't we just delete the attributes here?
              // Deleting an attribute changes the indices of the
              // others wreaking havoc on the loop we are inside
              // b/c dataAttrs is a NamedNodeMap (not an array or obj)
              dataAttrsToDelete.push(dataAttrs[i].name);
          }
      }
      // Delete each of the attributes we found above
      // i.e. those that start with "data-"
      $.each( dataAttrsToDelete, function( index, attrName ) {
          $target.removeAttr( attrName );
      });
    }
  };

  var _generateFinal = function ( html ) {
    if ( undefined === html || null === html) {
      error('No HTML provided, cannot generate final document');
      setMessage($.t('editor.valid_error'), 'error');
    } else {

      spinner('show');
      // Get the custom styles
      var styles = getUserStyles();

      // Load the boilerplate from the server
      var boilerplateURL = settings.appRootUrl + 'final-boilerplate.html';
      $.get(boilerplateURL, function (boilerplate) {
        // Insert user bits
        boilerplate = boilerplate.replace('[[USER_TITLE]]', settings.title);
        boilerplate = boilerplate.replace('[[USER_STYLES]]', styles);
        boilerplate = boilerplate.replace('[[USER_CONTENT]]', html);
        boilerplate = boilerplate.replace('[[USER_NOINLINE_ATTR]]', settings.noinlineAttr);

        // Remove CSS comments
        boilerplate = boilerplate.replace(/\/\*(.|[\r\n])*?\*\//g, "");
        // Remove blank lines for good measure
        boilerplate = boilerplate.replace(/^\s*[\r\n]/gm, "");

        parent.postMessage(msgPrefix + boilerplate, "*");

        spinner('hide');
        setMessage($.t('editor.valid_ok'), 'valid', false);
        // Lock the editor
        _lockEdition(true);
      })
      .fail(function () {
        warn('Could not get boilerplate from server, aborting content export');
        spinner('hide');
        setMessage($.t('editor.valid_error'), 'error');
      });
    }
  };

  var getUserStyles = function () {
    // Get the styles
    // we actually fetch all the content of <head> and remove unwanted bits
    // to be able to keep parts wrapped in comments like <!--[if gte mso 9]>
    var $head = $('head').clone();
    $head.find('title,meta,link, script, style:not([data-userstyle])').remove();
    _removeDataAttributes($head.find('style'));

    return unescape($head.html());

  };

  String.prototype.htmlEncode = function() {
    var charsToReplace = {
      '“': '&ldquo;',
      '”': '&rdquo;'
    };
    return this.replace(/[“”]/g, function(char) {
        return charsToReplace[char] || char;
    });
  };

  var getContent = function ( cleanup ) {
    if ( undefined === cleanup) cleanup = false;

    try {
      // Disable the editor, removes the content editables and other stuff
      dtfContentMode.leave();
      // Clone the content div
      var $content = $('#dtf-content').clone();

      // Re-enable the editor
      dtfContentMode.enter();

      if (cleanup) {
        // Do some more cleanup

        // First get all the uploadable images sizes
        // and set their attributes accordingly
        $content.find('.dtf-imageUploadable').each(function() {
          var width = $(this)[0].naturalWidth;
          var height = $(this)[0].naturalHeight;
          if ( $(this).width() !== 0 ) {
            // Not a stock image, so get real size (possibly resized)
            width = $(this).width();
            height = $(this).height();
          }
          $(this).attr('width', width);
          $(this).attr('height', height);
          $(this).removeAttr('class style');
        });


        $content.find('.dtf-upload').remove();
        _removeDataAttributes($content.find('.dtf-changeable'));
        $content.find('.dtf-contentEditable').removeAttr('contenteditable style');
        //Remove dentifrice Classes
        $content.find('*[class*="dtf"]').removeClass (function (index, css) {
          return (css.match (/(^|\s)dtf-\S+/g) || []).join(' ');
        });
        $content.find('.isUnique').removeClass("isUnique");

        //Add table conditional IE
        $content.find('#templateContainer td:first > div').each(function() {
          $(this).before('<!--[if (gte mso 9)|(IE)]><table cellpadding="0" cellspacing="0" width="600" align="center"><tr><td><![endif]-->');
          $(this).after('<!--[if (gte mso 9)|(IE)]></td></tr></table><![endif]-->');
        })
      }

      // Dump the raw html
      var html = $content.html();


      // HTML-encode some characters in the tags that might contain text,
      // in order to avoid mangling further down the chain
      // especially with UTF-8 encoding on POST (smart quotes for example)
      html = html.htmlEncode();

      //Remove dtf Classes
      html = html.replace(/dtf.* /g, "");

      // Remove no IE comments
      html = html.replace(/<!--(?!\[if).*?-->/g, "");

      return html;

    } catch(err) {
      return null;
    }
  };

  /**
   * An action stack to allow undo-ing actions
   */
  var actionStack = {
    stack : [],
    // Push an undo function to the stack
    push: function (func) {
      this.stack.push(func);
    },
    // Calls the latest pushed function
    undo: function() {
      var last_el = this.stack.pop();
      if (last_el) {
        last_el();
      } else {
        info('nothing to undo');
      }
    },
  };

  /**
   * A controller for an undo button based on an action stack
   */
  var UndoButton = function(el, stack) {
    this.el = $(el);
    this.stack = stack;

    this.el.on('click', function(){
      stack.undo();
    });
  };

  UndoButton.prototype.flash = function(){
    var btn = this.el;
    var flash_color = 'rgb(202, 60, 60)';
    var orig_color = btn.css('background-color');

    btn.animate(
      {backgroundColor: flash_color}, 100,
      function() {
        btn.animate({backgroundColor: orig_color}, 100);
      }
    );
  };

  var _lockEdition = function (lock) {
    if (lock) {
      $('.overlay').show();
      $('#getList').hide();
      $('#dtf-layout-mode').hide();
      $('#saveDraft').hide();
      $('#validateBtn').hide();
      $('#resumeBtn').show();
    } else {
      $('#resumeBtn').hide();
      $('#getList').show();
      $('#dtf-layout-mode').show();
      $('#saveDraft').show();
      $('#validateBtn').show();
      $('#messages').fadeOut(100);
      $('.overlay').fadeOut(100);
    }
  };

  var _loadToolbar = function () {
    if ( !$('#dtf-toolbar').length ) {
      var toolbar = $(window.templates.layoutToolbar);
      undoBtn = new UndoButton(toolbar.find('#undoBtn'), actionStack);

      var layoutModeBtn = toolbar.find('#dtf-layout-mode');
    	layoutModeBtn.on('click', function() {
    		$('#saveDraft').hide();
        $('#validateBtn').hide();
    		$.proxy(dtfContentMode.leave,this)();
    		$.proxy(dtfLayoutMode.enter,this)();
    	});

      var contentModeBtn  = toolbar.find('#dtf-content-mode');
    	contentModeBtn.on('click', function() {
    		$('#saveDraft').show();
        $('#validateBtn').show();
    		$.proxy(dtfLayoutMode.leave,this)();
    		// use setTimeout to let animation finish before we do heavy work
    		// otherwise, animation gets glitched.
    		window.setTimeout(
    			$.proxy(dtfContentMode.enter,this),
    			100
    		);
    	});

      var validateBtn = toolbar.find('#validateBtn');
      validateBtn.on('click', function() {
        // Generate final content and post to parent
        _generateFinal(getContent(true));
    	});

      var resumeBtn = toolbar.find('#resumeBtn');
      resumeBtn.on('click', function() {
        // We post an empty content to empty the parent textarea
        // and force a new validation of the content
        parent.postMessage(msgPrefix, "*");
        // Unlock the editor
        _lockEdition(false);
    	});

      var containerListDraft = toolbar.find('#containerListDraft');

      var saveDraftBtn = toolbar.find('#saveDraft');
      saveDraftBtn.on('click', function() {
    		dtfDraftsManager.saveDraft();
    	});

      var draftsListBtn = toolbar.find('#getList');
    	draftsListBtn.on('click', function() {
    		dtfDraftsManager.listDrafts();
        containerListDraft.addClass('isActive');
    	});

      var closeDraftsListBtn = toolbar.find('#closeListDraft');
    	closeDraftsListBtn.on('click', function() {
    		containerListDraft.removeClass('isActive');
    	});

      $('body').append(toolbar);

      // Resume button needs to be hidden first
      $('#resumeBtn').hide();

      toolbar.i18n();

      $('body').addClass('toolbarVisible');
    }
  };

  /**
   * Displays a notification on top of the editor
   */
  var setMessage = function ( text, status, temp ) {
    if (undefined === temp) temp = true;

    if ( !$('#messages').length ) {
      $('body').append($(window.templates.layoutMessages));
    }

    $("#messages").attr('class', '');
    $('#messages')
      .text(text)
      .addClass(status)
      .fadeIn(300);
    if (temp) {
      $('#messages')
        .delay(2500)
        .fadeOut(100);
    }
  };

  var flashUndo = function () {
    undoBtn.flash();
  };

  var pushToStack = function ( fn ) {
    actionStack.push(fn);
  };

  /**
   * Load the editor
   */
  var load = function () {
    _fetchBlocksConfig();
    _loadToolbar();
    _loadToolbar();
  };

  // Some scoped global variables
  var undoBtn;

  // Return public methods
  return {
    blocksCatalog : blocksCatalog,
    setMessage    : setMessage,
    flashUndo     : flashUndo,
    pushToStack   : pushToStack,
    getContent   : getContent,
    getUserStyles : getUserStyles,
    load          : load
  };

}( jQuery ));
