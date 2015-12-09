// Copyright (c) 2015 Oasiswork.
// All Rights Reserved.
//
// This Source Code Form is subject to the
// terms of the Mozilla Public License, v. 2.0.
// If a copy of the MPL was not distributed with this file,
// You can obtain one at
// http://mozilla.org/MPL/2.0/.

// Copyright (c) 2015 Oasiswork.
// All Rights Reserved.
//
// This Source Code Form is subject to the
// terms of the Mozilla Public License, v. 2.0.
// If a copy of the MPL was not distributed with this file,
// You can obtain one at
// http://mozilla.org/MPL/2.0/.

/**
 * Post Message settings
 */
var
  msgPrefix    = "[Dentifrice]",
  msgPrefixLen = msgPrefix.length,
  title,
  lang,
  appRootUrl;

/**
 * Log error messages to console.
 * Always logged regardless of the 'log' setting.
 */
function error (msg) {
  output('error', msg, true);
}

/**
 * Log warning messages to console.
 * Always logged regardless of the 'log' setting.
 */
function warn (msg) {
  output('warn', msg, true);
}

/**
 * Log information messages to console.
 * Only displayed if 'log' setting is true.
 */
function info (msg) {
  output('info', msg, settings.log);
}

/**
 * Log debug messages to console.
 * Only displayed if 'debug' setting is true.
 */
function debug (msg) {
    output('log', msg, settings.debug);
}

/**
 * Print messages to the console using provided level.
 */
function output (type, msg, enabled) {
  if (true === enabled && 'object' === typeof window.console) {
    console[type]('DentifriceEditor: ' + msg);
  }
}

/*
* PostMessage Module
*/

var postMessage_module = (function() {
    /*
    * Model message to send
    */

    var messageObj = {
        "type": "",
        "content": ""
    }
    var get = function(event) {
        var message = event.data;
    };
    var createMessageToSend = function(type, content) {
        var messageToSend;
        messageObj.type = type;
        messageObj.content = content;

        messageToSend = JSON.stringify(messageObj);
        post(messageToSend)
    };

    var post = function(messageToSend) {
        parent.postMessage(msgPrefix + messageToSend, "*");
    };

    /*
    * Listener postMessage
    */
    var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
    var eventer = window[eventMethod];
    var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
    eventer(messageEvent, get, false);

    return {
        createMessageToSend : createMessageToSend,
        messageObj          : messageObj,
        get                 : get,
        post                : post
    }
})();

/*
* icons, see editor.js dtfEditor
*/

var blocksIcons = {
    'title'              : '<i class="icon-text">T</i>',
    'paragraph'          : '<i class="fa fa-2x fa-align-justify"></i>',
    'image'              : '<i class="fa fa-2x fa-picture-o"></i>',
    '1col_image_top'    : '<i class="fa fa-2x fa-picture-o"></i><br /><i class="fa fa-2x fa fa-align-justify"></i>',
    '2cols_image_top'    : '<i class="fa fa-2x fa-picture-o"></i><i class="fa fa-2x fa-picture-o"></i><br /><i class="fa fa-2x fa fa-align-justify"></i><i class="fa fa-2x fa fa-align-justify"></i>',
    '2cols_image_bottom' : '<i class="fa fa-2x fa fa-align-justify"></i><i class="fa fa-2x fa fa-align-justify"></i><br /><i class="fa fa-2x fa-picture-o"></i><i class="fa fa-2x fa-picture-o"></i>',
    'quote'              : '<i class="icon-text icon-quote">&rdquo;</i>',
    'mixed_image_left'   : '<i class="fa fa-2x fa-picture-o"></i><i class="fa fa-2x fa-align-justify"></i>',
    'mixed_image_right'  : '<i class="fa fa-2x fa-align-justify"></i><i class="fa fa-2x fa-picture-o"></i>',
    'mixed_image_top'    : '<i class="fa fa-2x fa-picture-o"></i><br /><i class="fa fa-2x fa-align-justify"></i>',
    'mixed_image_bottom' : '<i class="fa fa-2x fa-align-justify"></i><br /><i class="fa fa-2x fa-picture-o"></i>'
};

/**
 * Load settings
 * See _local_settings.js and README.md for how to override
 */
var settings = {},
    CKEDITOR_BASEPATH;
function loadSettings (local_settings) {
  var default_settings = {
    log          : true,
    debug        : false,
    showSpinner  : true,
    noinlineAttr : 'inline="false"',
    uploadURL    : 'http://localhost:8080/files',
    plugins      : {
      'draftStore'   : 'drafts-localstore.js',
      'uploadStore'  : 'upload-simplestore.js',
      'beforeEditor' : [],
      'afterEditor'  : []
    }
  };
  // Merge local_settings and defaults
  settings = _.merge(default_settings, local_settings);
  // Force ckeditor BasePath
  CKEDITOR_BASEPATH = settings.appRootUrl + '/ckeditor/';
}

/* Helper function to get a file's absolute URL
 * using discovered appRootUrl
 */
var getAbsoluteUrl = function (url) {
  var r = new RegExp('^(?:[a-z]+:)?//', 'i');
  if ( r.test(url) ) {
   // URL is absolute, return unchanged
   return url;
  } else {
   // URL is relative, concatenate with appRootUrl and return
   return settings.appRootUrl + url.replace(/^\//, '');
  }
};

/* Spinner overlay
 */
var spinner = function (action) {
  var _overlay = $('.overlay');
  var _spinner = $('.spinner');
  var _spinnerLeft = (window.innerWidth/2) - (_spinner.width()/2);
  _spinner.css('left',_spinnerLeft);
  if (settings.showSpinner) {
    switch (action) {
      case 'show':
        debug('Showing spinner');
        //$('body').append(_spinner);
        _overlay.show();
        _spinner.show();
        break;
      case 'hide':
        debug('Hiding spinner');
        //_spinner.remove();
        _spinner.hide();
        _overlay.hide();
        break;
      default:
        warn('Unknown spinner action');
    }
  }
};

function _init (local_settings) {
  // Add a few values to local settings before loading
  local_settings.appRootUrl = appRootUrl;
  local_settings.lang = lang;
  local_settings.title = title;
  // Get the settings
  loadSettings(local_settings);
  // And start initialising
  dtfInit.loadEditor();
}

function _getQueryParameterByName (name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

/* Some global variables that we will need
 * throughout the application
 */
var blocks_config = { styles: {} };


var dtfInit = (function ( $ ) {
  'use strict';

  var loadScripts = function (scripts, index, callback, failCallback) {
    if (typeof scripts === 'string') scripts = [scripts];
    debug('Loading script: ' + scripts[index]);
    $.getScript(scripts[index], function () {
      if(index + 1 <= scripts.length - 1) {
        loadScripts(scripts, index + 1, callback, failCallback);
      } else {
        if(callback) callback();
      }
    })
    .fail(function(jqxhr, settings, exception) {
      warn(scripts[index] + ' loading error: ' + exception);
      if(failCallback) failCallback();
    });
  };

  var loadEditor = function () {
    // Show spinner
    spinner('show');
    // Build list of scripts to load
    var scriptsList = [
      settings.appRootUrl + 'js/plugins/' + settings.plugins.draftStore,
      settings.appRootUrl + 'js/plugins/' + settings.plugins.uploadStore
    ];
    // Add before-editor custom scripts
    if (typeof settings.plugins.beforeEditor === 'string') settings.plugins.beforeEditor = [settings.plugins.beforeEditor];
    var beforeEditor = settings.plugins.beforeEditor.map( function(item) { return getAbsoluteUrl(item); });
    scriptsList = scriptsList.concat(beforeEditor);
    // Add the editor itself
    scriptsList.push(settings.appRootUrl + 'js/editor.js');
    // Add after-editor custom scripts
    if (typeof settings.plugins.afterEditor === 'string') settings.plugins.afterEditor = [settings.plugins.afterEditor];
    var afterEditor = settings.plugins.afterEditor.map( function(item) { return getAbsoluteUrl(item); });
    scriptsList = scriptsList.concat(afterEditor);

    // Dynamically load scripts
    loadScripts(scriptsList, 0, function () {
      // Load translations
      info('Initializing locale');
      $.i18n.init({
        lng             : settings.lang,
        fallbackLng     : 'en',
        lowerCaseLng    : true,
        resGetPath      : settings.appRootUrl + 'locales/__lng__.json',
        useLocalStorage : false,
        debug           : settings.debug
      }, function () {
        // Load editor
        info('Initializing editor');
        dtfEditor.load();
        // Hide spinner
        spinner('hide');
      });
    });
  };

  return {
    loadScripts : loadScripts,
    loadEditor  : loadEditor
  };

})( jQuery );
