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
  msgPrefixLen = msgPrefix.length;

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


// Let's load our settings and initialise the editor !
(function ( $ ) {

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

  // Get our own url base dynamically
  // This is to allow deployments into a subdirectory
  var pageUrl = location.href;
  var appRootUrl = pageUrl.substring(0, pageUrl.lastIndexOf('/')+1);
  var settingsUrl = appRootUrl + '_local_settings.js';

  // Get the URLs of the template, css and configuration to load
  var templateUrl = _getQueryParameterByName('template');
  var stylesUrl = _getQueryParameterByName('styles');
  var configUrl = _getQueryParameterByName('config');
  var lang = _getQueryParameterByName('lang');
  var title = _getQueryParameterByName('title');

  // Start by loading the template content
  $('#dtf-content').load(templateUrl, function ( response, status, xhr ) {
    if ( status == "error" ) {

      error('Could not load template URL ' + templateURL + ': ' + xhr.status + ' ' + xhr.statusText);

    } else {

      debug('Template loaded');

      // Then load the styles
      $.get(stylesUrl, function (styles) {

        // First load the styles into a dummy element so we can work easily with them
        var $tmp = $('<tmp/>').html(styles);
        $tmp.find('style').attr('data-userstyle', true);
        // Then append the dummy element contents (styles) to the head
        $tmp.contents().appendTo('head');

        debug('Styles loaded');

        // Then load the configuration
        $.getJSON(configUrl, function (data) {

          debug('Configuration loaded');

          // Store parsed json for use by other modules
          blocks_config = data;

          // Finally load local_settings and start the editor
          dtfInit.loadScripts(settingsUrl, 0, function () {
            // Success callback - local_settings found
            _init(local_settings);
          }, function () {
            // Fail callback - local_settings not found
            var local_settings = {};
            _init(local_settings);
          });

        })
        .fail(function () {

            error('Could not load configuration URL:' + configURL);

        });

      })
      .fail(function () {

        error('Could not load styles URL:' + stylesURL);

      });

    }
  });

})( jQuery );
