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

  var listDrafts = function() {
    var draftsListUl = document.getElementById('listDraft');
    draftsListUl.innerHTML = '';

    var list = draftStore.listDrafts();

    list.forEach( function(draft) {

      var draftLi = document.createElement('li');
      draftLi.setAttribute('data-objId', draft.id);

      var spanDate = document.createElement('span');
      spanDate.textContent = draft.date;
      spanDate.className = 'draftDate';

      var spanName = document.createElement('span');
      spanName.textContent = draft.name;
      spanName.className = 'draftName';

      var spanDelete = document.createElement('span');
      spanDelete.className = 'spanDelete fa fa-minus-circle';

      draftLi.appendChild(spanDate);
      draftLi.appendChild(spanName);
      draftLi.appendChild(spanDelete);

      draftLi.addEventListener('click', function(e) {
        if ( confirm($.t('drafts.restore_confirm')) ) {
          try {
            // Replace blocks configuration
            blocks_config = draft.config;
            // Empty content div
            $('#dtf-content').empty();
            // Replace current userStyles
            $('head').find('style[data-userstyle]').remove();
            var $tmp = $('<tmp/>').html(draft.styles);
            $tmp.find('style').attr('data-userstyle', true);
            $tmp.contents().appendTo('head');
            // Insert HTML content from the draft
            $('#dtf-content').html(draft.html);
            // Re-load the editor
            dtfEditor.load();
            dtfEditor.setMessage($.t('drafts.restore_ok'), 'valid');
            // Hide the drafts list
            $('#dtf-modes-toolbar').find('#containerListDraft').removeClass('isActive');
          } catch(err) {
            dtfEditor.setMessage($.t('drafts.restore_error'), 'error');
          }
        }
      }, false);

      spanDelete.addEventListener('click', function(e) {
        if(confirm($.t('drafts.delete_confirm'))) {
          //var id = this.parentNode.getAttribute('data-objId');
          if ( draftStore.deleteDraft(draft.id) ) {
            draftsListUl.removeChild(draftLi);
            dtfEditor.setMessage($.t('drafts.delete_ok'), 'valid');
          } else {
            dtfEditor.setMessage($.t('drafts.delete_error'), 'error');
          }
        }
        e.stopPropagation();
      }, false);

      draftsListUl.appendChild(draftLi);
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
    deleteAllDrafts : deleteAllDrafts
  };

})( jQuery );
