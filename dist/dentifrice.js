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
* Listener Post Message Module
*/

var dentifrice_postMessage = (function() {

    /**
     * Attach postMessage listener
     */
    var setupMessageListener = function () {
      var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
      var eventer = window[eventMethod];
      var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
      eventer(messageEvent, messageListener, false);
    };

    /*
    * Type post Message response, extend it if you want
    */
    var type = {
        "final_html": function(data) {
            return data.content;
        }
    };
    var post = function(objMessage) {
        var messageToSend =  JSON.stringify(objMessage);
        /*
        * prevent multiple Iframe into page
        */
        for(var f=0; f<frames.length; f++) {
            if(frames[f].hasOwnProperty("msgPrefix")) {
                frames[f].postMessage(msgPrefix + messageToSend, "*");
            }
        }

    };
    /*
    * Callback listener for postMessages
    */
    var messageListener = function (event) {

      function isMessageForUs () {
        return msgPrefix === (('' + msg).substr(0,msgPrefixLen));
      }

      var msg = event.data;
      if(msg.length > msgPrefixLen && typeof msg === 'string' && isMessageForUs()) {
        logger._debug('Received postmessage :' + msg);
        /*
        * Message Json
        */
        var messageJson = JSON.parse(msg.substr(msgPrefixLen));
        /*
        * Check if type is defined
        */
        if(type.hasOwnProperty(messageJson.type)) {
            target.value = type[messageJson.type](messageJson)
        }else {
            logger._warn('Type undefined');
        }



      }else {
        logger._debug('Received postmessage, but not for us :' + msg);
      }

    };




    return {
        setupMessageListener: setupMessageListener,
        type            : type,
        post            : post,
        messageListener : messageListener
    }

})();

// var dentifrice_postMessage_method = (function() {
//
//     return {
//         type            : type,
//         post            : post,
//         messageListener : messageListener
//     }
//
// })();

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
    dentifrice_postMessage.setupMessageListener();
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
    getSettings : function() {
        return settings;
    },
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
  var dentifrice_settings = dentifrice.getSettings();
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
        _output('info', msg, dentifrice_settings.log);
    },

    /**
     * Log debug messages to console.
     * Only displayed if 'debug' setting is true.
     */
    _debug : function (msg) {
        _output('log', msg, dentifrice_settings.debug);
    }
  }

})(dentifrice || {});

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
    dentifrice_settings = dentifrice.getSettings();
    // Hide the target and prepare iframe
    if (dentifrice_settings.hideTarget) {
      target.style.display = 'none';
    }

    var assetsUrlBase = dentifrice_settings.templateUrl.replace(/\/[^\/]*$/, '/');
    var absTest = /^https?:\/\/|^\/\//i;

    // Prepare template URL
    var templateUrlEncoded = encodeURIComponent(dentifrice_settings.templateUrl);

    // Prepare CSS URL
    var stylesUrlEncoded = encodeURIComponent(assetsUrlBase + dentifrice_settings.stylesUrl);
    // If an absolute stylesUrl was provided, use it instead
    if ( absTest.test(dentifrice_settings.stylesUrl) ) {
        stylesUrlEncoded = encodeURIComponent(dentifrice_settings.stylesUrl);
    }

    // Prepare config URL
    var configUrlEncoded = encodeURIComponent(assetsUrlBase + dentifrice_settings.configUrl);
    // f an absolute configUrl was provided, use it instead
    if ( absTest.test(dentifrice_settings.configUrl) ) {
        configUrlEncoded = encodeURIComponent(dentifrice_settings.configUrl);
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

    var editorUrl = bootstrapRoot + 'editor.html?template=' + templateUrlEncoded + '&styles=' + stylesUrlEncoded + '&config=' + configUrlEncoded + '&lang=' + lang + '&title=' + dentifrice_settings.title;

    var iframe = document.createElement('iframe');

    iframe.id = iframeID;
    iframe.setAttribute('src', editorUrl);
    iframe.style.border = '0';
    iframe.style.width = dentifrice_settings.width + 'px';
    iframe.style.height = dentifrice_settings.height + 'px';

    if (dentifrice_settings.anchorId) {
      var anchor = document.getElementById(dentifrice_settings.anchorId);
      if (0 === anchor.length) {
        logger._warn('Could not find anchor element with ID: ' + dentifrice_settings.anchorId);
      } else {
        logger._debug('Found anchor element with ID: ' + dentifrice_settings.anchorId);
        if (dentifrice_settings.replaceAnchor) {
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
