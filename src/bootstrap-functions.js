// Copyright (c) 2015 Oasiswork.
// All Rights Reserved.
//
// This Source Code Form is subject to the
// terms of the Mozilla Public License, v. 2.0.
// If a copy of the MPL was not distributed with this file,
// You can obtain one at
// http://mozilla.org/MPL/2.0/.

/*
* Globals variables
*/
var iframeID     = 'dentifriceIframe',
    msgPrefix    = '[Dentifrice]',
    msgPrefixLen = msgPrefix.length,
    lang         = 'en',
    target;

/*
* Dentifrice Module
*/
var dentifrice = (function () {
  'use strict';

  // Define some global variables and defaults
  var
    settings     = {},

    defaults     = {
      targetId       : 'dentifrice-textarea',
      templateUrl    : null,
      stylesUrl      : 'styles.html',
      configUrl      : 'configuration.json',
      title          : 'Dentifrice Newsletter',
      lang           : null,
      log            : true,
      debug          : false,
      hideTarget     : true,
      anchorId       : null,
      replaceAnchor  : false,
      width          : 850,
      height         : parseInt(window.outerHeight*0.8)
    },

    locales      = {
      'en' : {
        'Please validate' : 'Please validate your edition first !'
      },
      'fr' : {
        'Please validate' : "Veuillez valider l'éditeur !"
      }
    };

  /**
   * Initialize language to, in order of preference :
   *   - language provided in settings
   *   - browser language
   *   - defaults to 'en'
   */
  var _initLang = function () {
    var userLang = navigator.language || navigator.userLanguage;
    if ( settings.lang && (settings.lang in locales) ) {
      lang = settings.lang;
    } else if ( userLang in locales) {
      lang = userLang;
    }
    logger._debug('Setting locale to: ' + lang);
  };

  /**
   * Returns the translated string matching "text" parameter
   */
  var _ = function (text) {
    var locale = locales[lang];
    return ( text in locale ? locale[text] : text );
  };

  /**
   * Initialize settings from provided dictionnary
   */
  var _initSettings = function (options) {
    for (var option in defaults) {
      if (defaults.hasOwnProperty(option)) {
        settings[option] = options.hasOwnProperty(option) ? options[option] : defaults[option];
      }
    }
  };

  /**
   * Find the element where the generated HTML is to be pushed to
   */
  var _findTarget = function () {
    var element = document.getElementById(settings.targetId);
    if ( !element || 0 === element.length) {
      logger._warn('Could not find element with ID: ' + settings.targetId);
      return false;
    } else {
      logger._debug('Found element matching selector: ' + settings.targetId);
      return element;
    }
  };

  /**
   * Callback listener for postMessages
   */
  var _messageListener = function (event) {

    function isMessageForUs () {
      return msgPrefix === (('' + msg).substr(0,msgPrefixLen));
    }

    var msg = event.data;
    if(msg.length > 0 && typeof msg === 'string' && isMessageForUs()) {
      logger._debug('Received postmessage :' + msg);
      target.value = msg.substr(msgPrefixLen);
    }else {
      logger._debug('Received postmessage, but not for us :' + msg);
    }

  };

  /**
   * Attach postMessage listener
   */
  var _setupMessageListener = function () {
    var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
    var eventer = window[eventMethod];
    var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
    eventer(messageEvent, _messageListener, false);
  };

  //Global
  var _showValidationAlert = function () {
    if(document.getElementById('dentifriceValidationAlert') === null) {

      var iframe = document.getElementById(iframeID);

      var divCheck = document.createElement('div');
      divCheck.id = "dentifriceValidationAlert";
      divCheck.textContent = _('Please validate');

      iframe.parentNode.insertBefore(divCheck, iframe);

      var rect = iframe.getBoundingClientRect();
      var iframeTop = rect.top + iframe.parentNode.scrollTop;
      var heightElement = divCheck.offsetHeight;
      var widthElement = divCheck.offsetWidth;
      var posTop = parseFloat(iframeTop) - parseFloat(heightElement) - 4;
      var posLeft = parseFloat(settings.width) - parseFloat(widthElement);

      divCheck.style.cssText = 'position: relative; top: -10px; left: ' + posLeft + 'px; opacity: 1;';

      window.scrollTo(0, posTop -50);
      setTimeout(function(){
        if(divCheck.parentNode !== null) {
          divCheck.parentNode.removeChild(divCheck);
        }
      }, 2000);

    }
  };

  var init_dentifrice = function(options) {
    // initialize settings
    logger._info('Initializing settings');
    _initSettings(options);

    // Initialize language
    logger._info('Initializing locale');
    _initLang();

    // Get the target element
    logger._info('Getting target element');
    target = _findTarget();

    // Listen to messages from the iframe
    logger._info('Setting up postMessages listener');
    _setupMessageListener();
  };

  return {
    checkIfValidated : function() {
      if(target.value === "") {
        _showValidationAlert();
        return false;
      } else {
        return true;
      }
    },
    settings: settings,
    init_dentifrice : init_dentifrice,
    bootstrap : function(options) {
      // initialize
      init_dentifrice(options);

      // First check if template url was provided
      // else, give up straight away
      if ( !settings.templateUrl ) {
        logger._warn('No template URL provided');
        // Return false so we can test on the calling page
        return false;
      }

      if (target) {

        // Load the editor
        logger._info('Initializing editor');
        _initEditor.init();

        return true;

      } else {

        logger._warn('Target element not found, aborting');
        // Return false so we can test on the calling page
        return false;

      }
    }
  };

})();

/*
* Logger Module
*/

var logger = (function (dentifrice) {
  /**
   * Print messages to the console using provided level.
   */
  var _output = function (type, msg, enabled) {
    if (true === enabled && 'object' === typeof window.console) {
      console[type]('Dentifrice: ' + msg);
    }
  };
  return {
    /**
     * Log warning messages to console.
     * Always logged regardless of the 'log' setting.
     */
    _warn : function (msg) {
      _output('warn', msg, true);
    },

    /**
     * Log information messages to console.
     * Only displayed if 'log' setting is true.
     */
    _info : function (msg) {
        _output('info', msg, dentifrice.settings.log);
    },

    /**
     * Log debug messages to console.
     * Only displayed if 'debug' setting is true.
     */
    _debug : function (msg) {
        _output('log', msg, dentifrice.settings.debug);
    }
  }

})(dentifrice || {});
