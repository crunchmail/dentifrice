// Copyright (c) 2015 Oasiswork.
// All Rights Reserved.
//
// This Source Code Form is subject to the
// terms of the Mozilla Public License, v. 2.0.
// If a copy of the MPL was not distributed with this file,
// You can obtain one at
// http://mozilla.org/MPL/2.0/.

var dtfLayoutMode = (function( $ ) {
  'use strict';

  var _draggable = function(block) {
    var parent_div = block.closest('div'),
      c = {};

    parent_div.addClass('sortable-element');

    $('#templateContainer').sortable({
      items: '.sortable-element',
      placeholder: "ui-state-highlight",
      revert: true,
      scrollSpeed: 40,
      sort: function(event, ui) {
        var containerHeight = $('#templateContainer').height()/2;
        var centerElement = (ui.item.height()/2)/2;
        var topElement = ui.item.offset().top/2;
        var windowPos = parseFloat(topElement) + parseFloat(centerElement);
        $(window).scrollTop(windowPos);
      },
      start: function(event, ui) {
        ui.placeholder.height(ui.item.height());
        $('.dtf-tr-element').remove();
        $('#templateContainer > tbody > tr:not(.sortable-element)').css('opacity', 0.5);
        var centerElement = (ui.item.height()/2);
        var topElement = ui.item.offset().top;
        var windowPos = parseFloat(topElement) + parseFloat(centerElement) - 100;
        window.scrollTo(0, windowPos);
      },
      stop: function(event, ui) {
        $('.button-del').remove();
        $('.dtf-block').each(function() {
          if($(this).hasClass('dtf-changeable')) {
            changeClass($(this));
          }else {
            equipBlock($(this));
          }
        });
        $('#templateContainer > tbody > tr:not(.sortable-element)').css('opacity', 1);
      }
    });
  };

  var _addDelBtn = function(block) {
    if (block.prev('.pure-button-del').length <= 0 && !block.hasClass('isUnique')) {
      $(window.templates.blockDelButton)
        .insertBefore(block)
        .on('click', function(){
          var element = $(this).next();
          var row = element.closest('tr');
          var before_row = row.prev();
          var row_parent = row.parent();
          var next_draft = row.next('tr');
          var removed = deleteBlock(element).hide();
          dtfEditor.pushToStack(function(){
            // Record previous element or parent if first
            if (before_row.length > 0) {
              before_row.after(removed);
            } else {
              row_parent.prepend(removed);
            }
            removed.show(200);
          });
          dtfEditor.flashUndo();
        });
    }
  };

  var _hide_catalog = function() {
    $('.dtf-catalog').hide(100);
    $('.dtf-add-bar .button-add:hidden').show(100);
  };

  var _show_catalog = function() {
    _hide_catalog();
    $(this).hide(100);

    // show my catalog
    $(this).closest('div').find('.dtf-catalog')
      .html(dtfEditor.blocksCatalog.get_gallery())
      .show(100);
  };

  var enter = function() {
    info('Entering LayoutMode');

    var numberOfElement = $('.dtf-block').length;
    $('.dtf-block').each(function(i) {
      //addClass lastClass to last element
      if(i === numberOfElement - 1 ) $(this).addClass('lastChild');
      if(!$(this).hasClass('dtf-changeable')) {
        equipBlock($(this));
        _draggable($('.dtf-draggable'));
      }else {
        changeClass($(this));
      }
    });

    // Block adding
    $('.first-hidden').show(100);
    $(this).hide(100);
  };

  var leave = function() {
    info('Leaving LayoutMode');

    $('.dtf-draft-block').closest('div').remove();
    $('.button-del').remove();
    $('.first-hidden').hide(100);
    $('#dtf-layout-mode').show(100);
    $('.dtf-deletion-border').removeClass('dtf-deletion-border');
    $( "#templateContainer" ).sortable( "destroy" );
  };

  /**
   * Equips a block with a border and block inserting tool under it.
   */
  var equipBlock = function(block) {
    var parent_div = block.closest('div');

    block.addClass('dtf-deletion-border');
    if (parent_div.next('div').find('.dtf-draft-block').length <= 0) {
      var draft_row = $(window.templates.blockAddBar);
      draft_row.find('button').on('click', _show_catalog);
      _hide_catalog();

      parent_div.after(draft_row.fadeIn());
    }

    //Add button delete block if not Unique
    _addDelBtn(block);

  };

  //Change Class of element with listChangeable in configuration.json
  var changeClass = function(block, blockClass) {
    var parent_div = block.closest('div');

    block.addClass('dtf-deletion-border');
    if (parent_div.next('div').find('.dtf-draft-block').length <= 0) {

      if(!block.hasClass('lastChild')) {
        var draft_rowAdd = $(window.templates.blockAddBar);

        draft_rowAdd.find('button').on('click', _show_catalog);
        _hide_catalog();

        parent_div.after(draft_rowAdd.fadeIn());
      }

      var draft_row = $(window.templates.blockChange);
      var classesElement = parent_div.find('.dtf-block').data('change-class');
      var removeOldClasse = classesElement.split(',').join(' ');
      var arrClass = classesElement.split(',');

      parent_div.after(draft_row);

      $.each(arrClass, function() {
        if(block.closest('div').find('.dtf-block').hasClass(this)) {
          draft_row.find('.dtf-change-element').append('<div data-background="'+this+'" class="active dtf-background '+this+'"></div>');

        }else {
          draft_row.find('.dtf-change-element').append('<div data-background="'+this+'" class="dtf-background '+this+'"></div>');
        }

      });

      block.closest('div').next().on('click', '.dtf-background', function() {
        $('.dtf-background').removeClass('active');
        $(this).addClass('active');
        draft_row.prev().find('.dtf-block').removeClass(removeOldClasse);
        var nameClass = $(this).data('background');
        draft_row.prev().find('.dtf-block').addClass(nameClass);

      });
    }

    //Add button delete block if not Unique
    _addDelBtn(block);
  };

  var deleteBlock = function (block) {
    /* the setattr is a woraround to avoid getting a hidden forever
     * cloned element
     */
    var parent_div = block.closest('div');
    var deleted = $().add(parent_div).add(parent_div.next('div'));
    var clone = deleted.clone(true, true);
    deleted.hide(200, function() {
      $(this).remove();
    });
    return clone;
  };

  return {
    enter       : enter,
    leave       : leave,
    changeClass : changeClass,
    equipBlock  : equipBlock,
    deleteBlock : deleteBlock
  };

})( jQuery );
