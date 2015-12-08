// Copyright (c) 2015 Oasiswork.
// All Rights Reserved.
//
// This Source Code Form is subject to the
// terms of the Mozilla Public License, v. 2.0.
// If a copy of the MPL was not distributed with this file,
// You can obtain one at
// http://mozilla.org/MPL/2.0/.

var dtfContentMode = (function( $ ) {
  'use strict';

  var attrHref;

  var enter = function() {
    info('Entering ContentMode');

    $.each(dtfEditor.blocksCatalog.configs, function(name, config) {
      // Add CKEditor instances
      if(!$(config.selector).data("default")) {
          $(config.selector).remove();
      }
      $(config.selector).addClass('dtf-block');
      if(config.urlckEditor !== undefined) {
        //get localStorage json file
        var confCkeditor = JSON.parse(localStorage.getItem(config.selector));
        $(config.selector).find('.dtf-contentEditable')
          .attr('contentEditable',true)
          .ckeditor(confCkeditor);
      }
      else {
        $(config.selector).find('.dtf-contentEditable')
          .attr('contentEditable',true)
          .ckeditor();
      }

      // Add controls around uploadable images
      $(config.selector).find('*').addBack()
        .filter('.dtf-imageUploadable')
        .uploadify();

      if($(config.selector).find('.dtf-imageUploadable').closest('a').length > 0) {

        attrHref = $(config.selector).find('.dtf-imageUploadable').parent('a').attr('href');
        $(config.selector)
          .find('.dtf-imageUploadable').parent('a')
          .removeAttr('href')
          .attr('data-href', attrHref);
      }

      // Add controls for resizable images
      $(config.selector).find('*').addBack()
        .filter('.dtf-resizable')
        .makeResizable();

      if($('.ui-resizable-handle').is(':hidden')) {
        $('.ui-resizable-handle').show();
      }

      // Disable click on all links outside content editables
      var contentLinks = $('#dtf-content a:not(.cke_editable a)');
      contentLinks.each(function () {
        debug('Disabling clicks on link: ' + this.href);
      });
      contentLinks.on('click', function(event) {
        event.preventDefault();
      });
    });
  };

  var leave = function() {
    info('Leaving ContentMode');
    // Remove content-editables
    $.each(CKEDITOR.instances, function (_, instance) {
      instance.destroy();
    });
    $('.dtf-contentEditable').attr('contentEditable', false);
    $('.sortable-element').removeClass('sortable-element');

    // Remove controls for resizable images
    $('.dtf-resizable').resizable("destroy");
    // Remove controls uploadable image
    $('.dtf-image-wrap').find(':not(.dtf-imageUploadable)').remove();
    $('img.dtf-imageUploadable').unwrap();

    if($('.dtf-imageUploadable').closest('a').length > 0) {
      attrHref = $('.dtf-imageUploadable').parent('a').data('href');

      $('.dtf-imageUploadable').parent('a')
        .removeAttr('data-href')
        .attr('href', attrHref);
    }
  };

  return {
    enter : enter,
    leave : leave,
  };

})( jQuery );
