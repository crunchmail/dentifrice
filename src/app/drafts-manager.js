// Copyright (c) 2015 Oasiswork.
// All Rights Reserved.
//
// This Source Code Form is subject to the
// terms of the Mozilla Public License, v. 2.0.
// If a copy of the MPL was not distributed with this file,
// You can obtain one at
// http://mozilla.org/MPL/2.0/.

var dtfDraftsManager = (function( $ ) {
  'use strict';

  var versionTpl = 1;
  var containerListDraft = document.getElementById('containerListDraft');

  var saveDraft = function() {
    spinner('show');
    var resultPrompt = prompt($.t('drafts.name_prompt'), $.t('drafts.default_name'));

    if ( resultPrompt !== "" && resultPrompt !== null ) {
      var save = true;

      if ( draftStore.draftExists(resultPrompt) ) {
        info('Draft name already exist: ' + resultPrompt);
        save = confirm($.t('drafts.overwrite_confirm'));
        if (save === true) info('Overwriting draft named ' + resultPrompt);
      }

      if ( save === true ) {
        var date = new Date();
        date = date.toLocaleDateString() + " " + date.toLocaleTimeString();

        var html = dtfEditor.getContent();
        var styles = dtfEditor.getUserStyles();

        if ( draftStore.saveDraft( resultPrompt, html, styles, blocks_config, date ) ) {
          dtfEditor.setMessage($.t('drafts.save_ok'), 'valid');
        } else {
          dtfEditor.setMessage($.t('drafts.save_error'), 'error');
        }
      }
    } else if ( resultPrompt === "" ) {
      dtfEditor.setMessage($.t('drafts.name_empty'), 'error');
    }
    spinner('hide');
  };

  var hideMenu = function() {
    $('#containerListDraft').removeClass('isActive');
  };

  var listDrafts = function() {
    var draftsListUl = $('#listDraft');
    draftsListUl.empty();

    var list = draftStore.listDrafts();

    list.forEach( function(draft) {

      var draftLi = $("<li/>");
      draftLi.attr('data-objId', draft.id);

      var spanDate = $('<span class="draftDate">'+draft.date+'</span>');

      var spanName = $('<span class="draftName">'+draft.name+'</span>');

      var spanDelete = $('<span class="spanDelete fa fa-minus-circle"/>');


      draftLi.append(spanDate);
      draftLi.append(spanName);
      draftLi.append(spanDelete);

      draftLi.on('click', function(e) {
        if ( confirm($.t('drafts.restore_confirm')) ) {
          try {
            draftStore.loadDraft(draft.id);
          } catch(err) {
            dtfEditor.setMessage($.t('drafts.restore_error'), 'error');
          }
        }
      });

      spanDelete.on('click', function(e) {
        if(confirm($.t('drafts.delete_confirm'))) {
          //var id = this.parentNode.getAttribute('data-objId');
          if ( draftStore.deleteDraft(draft.id) ) {
            draftLi.remove();
            dtfEditor.setMessage($.t('drafts.delete_ok'), 'valid');
          } else {
            dtfEditor.setMessage($.t('drafts.delete_error'), 'error');
          }
        }
        e.stopPropagation();
      });

      draftsListUl.append(draftLi);
    });
  };

  var deleteAllDrafts = function() {
    var list = draftStore.listDrafts();
    var draftsListUl = document.getElementById('listDraft');

    for ( var v in list ) {
      var id = this.parentNode.getAttribute('data-objId');
      if ( draftStore.deleteDraft(id) ) {
        draftsListUl.removeChild(draftLi);
      }
    }
  };

  return {
    saveDraft       : saveDraft,
    listDrafts      : listDrafts,
    hideMenu        : hideMenu,
    deleteAllDrafts : deleteAllDrafts
  };

})( jQuery );
