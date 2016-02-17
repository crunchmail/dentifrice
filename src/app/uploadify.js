// Copyright (c) 2016 Oasiswork.
// All Rights Reserved.
//
// This Source Code Form is subject to the
// terms of the Mozilla Public License, v. 2.0.
// If a copy of the MPL was not distributed with this file,
// You can obtain one at
// http://mozilla.org/MPL/2.0/.

(function ( $ ) {
    'use strict';

    var instances;

    $.fn.makeResizable = function () {
        $.each(this, function(idx, el) {
            var img = $(el);

            var ratioResizable = Math.round(img[0].naturalHeight / img[0].naturalWidth);
            var maxWidthResizable = img.closest('td').width();
            var configResizable = {
                maxWidth: maxWidthResizable,
                minWidth: 50,
                aspectRatio: true,
                handles:"e, s, se"
            };
            if(img.data('resizable') === 'left') {
                configResizable.handles = "sw, w, s";
            }
            img.resizable(configResizable);
        });
        return this;
    };

    $.fn.uploadify = function () {
        $.each(this, function(idx, el) {
            var uploadForm = $(window.templates.imageUploadForm);
            var img = $(el);
            var showFormButton = $(window.templates.imageUploadButton);
            var attrHref;
            var imgWidth = img.width();

            uploadForm.i18n();

            if(img.closest('a').length > 0) {
                attrHref = img.parent('a').attr('href');
                img.parent('a')
                .removeAttr('href')
                .attr('data-href', attrHref);
            }

            img.wrap('<div class="dtf-image-wrap">');
            img.parent().append(showFormButton);
            img.parent().append(uploadForm.hide());
            var waiter = uploadForm.find('.dtf-waiter');
            var fileInput = uploadForm.find('input');
            var browseBtn = uploadForm.find('.upload-button');
            var closeLink = uploadForm.find('.button-cancel');

            function showUploadForm() {
                showFormButton.hide();
                fileInput.show();
                browseBtn.show();
                waiter.hide();
                uploadForm.show();
            }

            function hideUploadForm() {
                uploadForm.hide();
                showFormButton.show();
                return false;
            }

            function startWaiting() {
                fileInput.hide();
                browseBtn.hide();
                waiter.show();
            }

            showFormButton.click(showUploadForm);
            closeLink.click(hideUploadForm);

            fileInput.change(function() {
                var fd = new FormData();
                var file = uploadForm.find("#file")[0].files[0];
                fd.append("file", file);
                fd.append("width", imgWidth);

                var url = uploadStore.doUpload(fd);

                if ( null !== url ) {
                    var dataResizable = (img.data('resizable') === undefined ? 'right' : img.data('resizable'));

                    if ( img.hasClass('dtf-resizable') ) {
                        img.resizable("destroy");
                    }

                    var parent = img.parent();
                    var newImg = $('<img data-resizable="' + dataResizable + '" class="dtf-resizable dtf-imageUploadable" src="' + url + '" width="' + img.width() + 'px" />');
                    parent.replaceWith(newImg);

                    setTimeout(function(){
                        newImg.uploadify();
                        newImg.makeResizable();
                    }, 1000);
                } else {
                    dtfEditor.setMessage($.t('upload.error'), 'error');
                }

                hideUploadForm();
                startWaiting();
                return false;
            });
        });
        return this;
    };

}( jQuery ));
