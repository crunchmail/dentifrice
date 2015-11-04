// Copyright (c) 2015 Oasiswork.
// All Rights Reserved.
//
// This Source Code Form is subject to the
// terms of the Mozilla Public License, v. 2.0.
// If a copy of the MPL was not distributed with this file,
// You can obtain one at
// http://mozilla.org/MPL/2.0/.

/**
 * Initialize the editor
 */
var _initEditor = (function (dentifrice) {
  var init = function() {
    // Hide the target and prepare iframe
    if (dentifrice.settings.hideTarget) {
      target.style.display = 'none';
    }

    var assetsUrlBase = dentifrice.settings.templateUrl.replace(/\/[^\/]*$/, '/');
    var absTest = /^https?:\/\/|^\/\//i;

    // Prepare template URL
    var templateUrlEncoded = encodeURIComponent(dentifrice.settings.templateUrl);

    // Prepare CSS URL
    var stylesUrlEncoded = encodeURIComponent(assetsUrlBase + dentifrice.settings.stylesUrl);
    // If an absolute stylesUrl was provided, use it instead
    if ( absTest.test(dentifrice.settings.stylesUrl) ) {
        stylesUrlEncoded = encodeURIComponent(dentifrice.settings.stylesUrl);
    }

    // Prepare config URL
    var configUrlEncoded = encodeURIComponent(assetsUrlBase + dentifrice.settings.configUrl);
    // f an absolute configUrl was provided, use it instead
    if ( absTest.test(dentifrice.settings.configUrl) ) {
        configUrlEncoded = encodeURIComponent(dentifrice.settings.configUrl);
    }

    // Get our own URL to use as base for the iFrame src
    var bootstrapRoot = '';
    var allScripts = document.getElementsByTagName('script');
    var re = /^(.*)dentifrice\.(min\.)*js$/;
    [].forEach.call(allScripts, function (tag) {
      var src = tag.getAttribute('src');
      var match = re.exec(src);
      if (match) {
        // Found a base url to use
        bootstrapRoot = match[1];
      }
    });

    var editorUrl = bootstrapRoot + 'editor.html?template=' + templateUrlEncoded + '&styles=' + stylesUrlEncoded + '&config=' + configUrlEncoded + '&lang=' + lang + '&title=' + dentifrice.settings.title;

    var iframe = document.createElement('iframe');

    iframe.id = iframeID;
    iframe.setAttribute('src', editorUrl);
    iframe.style.border = '0';
    iframe.style.width = dentifrice.settings.width + 'px';
    iframe.style.height = dentifrice.settings.height + 'px';

    if (dentifrice.settings.anchorId) {
      var anchor = document.getElementById(dentifrice.settings.anchorId);
      if (0 === anchor.length) {
        logger._warn('Could not find anchor element with ID: ' + dentifrice.settings.anchorId);
      } else {
        logger._debug('Found anchor element with ID: ' + dentifrice.settings.anchorId);
        if (dentifrice.settings.replaceAnchor) {
          logger._debug('Replacing anchor element with editor');
          anchor.parentNode.replaceChild(iframe, anchor);
        } else {
          logger._debug('Inserting editor inside anchor element');
          anchor.appendChild(iframe);
        }
      }
    } else {
      target.parentNode.insertBefore(iframe, target.nextSibling);
    }
  }

  /*
  * Return init function
  */
  return {
    init: init
  }
})(dentifrice || {});
