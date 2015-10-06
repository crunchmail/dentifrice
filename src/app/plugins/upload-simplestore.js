// Copyright (c) 2015 Oasiswork.
// All Rights Reserved.
//
// This Source Code Form is subject to the
// terms of the Mozilla Public License, v. 2.0.
// If a copy of the MPL was not distributed with this file,
// You can obtain one at
// http://mozilla.org/MPL/2.0/.

var uploadStore = (function ( $ ) {
  'use strict';

  var doUpload = function (data) {
    var ret = null;

    $.ajax({
      url: settings.uploadURL,
      method: 'POST',
      data: data,
      async: false,

      // With files, its better if jquery does not try
      // to manage form content
      cache: false,
      contentType: false,
      processData: false
    })
    .done( function (url) {

      info('file uploaded. Response: ' + url);
      ret = url;

    })
    .fail( function (jqXHR, textStatus) {

      warn('Failed uploading file: '+ textStatus);

    });

    return ret;
  };

  return {
    doUpload : doUpload
  };

})( jQuery );
