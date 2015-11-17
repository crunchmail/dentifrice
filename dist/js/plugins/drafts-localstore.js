// Copyright (c) 2015 Oasiswork.
// All Rights Reserved.
//
// This Source Code Form is subject to the
// terms of the Mozilla Public License, v. 2.0.
// If a copy of the MPL was not distributed with this file,
// You can obtain one at
// http://mozilla.org/MPL/2.0/.

var draftStore = (function () {
  'use strict';

  var _getLastId = function () {
    var id = 0;
    if(localStorage.getItem('draftLastId') !== undefined) {
      id = localStorage.getItem('draftLastId');
    }
    return id;
  };

  var _setLastId = function ( id ) {
    localStorage.setItem('draftLastId', id);
  };

  var saveDraft = function ( name, html, styles, config, date ) {
    try {
      // Create draft object
      var draftObj = {
        name    : name,
        date    : date,
        html    : html,
        styles  : styles,
        config  : config,
      };

      // Stringify object to pass to localStorage
      draftObj = JSON.stringify(draftObj);

      // Save to localStorage
      var id = _getLastId();
      var exist = draftExists(name);
      if (exist) {
        id = exist.id;
      } else {
        id++;
      }
      localStorage.setItem('dtfDraft' + id, draftObj);
      _setLastId(id);

      return true;

    } catch(err) {

      error('Failed saving draft: ' + err.message);
      return false;

    }
  };

  var listDrafts = function () {
    var lastId = _getLastId();

    var list = [];

    try {

      for ( var i = 1; i <= lastId; i++ ) {
        var draftObj = localStorage.getItem('dtfDraft' + i);

        if(draftObj !== null) {
          draftObj = JSON.parse(draftObj);
          list.push({
            id      : i,
            name    : draftObj.name,
            date    : draftObj.date,
            html    : draftObj.html,
            styles  : draftObj.styles,
            config  : draftObj.config
          });
        }
      }

      return list;

    } catch(err) {

      error('Failed retrieving drafts list: ' + err.message);
      return [];

    }
  };

  var draftExists = function ( name ) {
    var list = listDrafts();
    var exists = false;
    list.forEach( function(draft) {
      if ( name == draft.name ) {
        exists = draft;
      }
    });
    return exists;
  };

  var deleteDraft = function ( id ) {
    try {

      localStorage.removeItem('dtfDraft' + id);
      return true;

    } catch(err) {

      error('Failed deleting draft version' + version + ': ' + err.message);
      return false;

    }
  };

  var loadDraft = function ( id ) {
    var draft = JSON.parse(localStorage.getItem('dtfDraft' + id));

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
    dtfDraftsManager.hideMenu();
  };

  return {
    saveDraft   : saveDraft,
    loadDraft   : loadDraft,
    listDrafts  : listDrafts,
    draftExists : draftExists,
    deleteDraft : deleteDraft
  };

})();
