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
