// Copyright (c) 2016 Oasiswork.
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
            var contentLinks = $(config.selector).find('a:not(.cke_editable a)');
            contentLinks.each(function () {
                debug('Disabling clicks on link: ' + this.href);
            });
            contentLinks.on('click', function(event) {
                event.preventDefault();
            });
        });

        // Broadcast change mode event
        debug('Broadcast dtfContentModeEnter');
        $('#dtf-content').trigger('dtfContentModeEnter');
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

        // Broadcast change mode event
        debug('Broadcast dtfContentModeLeave');
        $('#dtf-content').trigger('dtfContentModeLeave');
    };

    return {
        enter : enter,
        leave : leave,
    };

})( jQuery );

// Copyright (c) 2016 Oasiswork.
// All Rights Reserved.
//
// This Source Code Form is subject to the
// terms of the Mozilla Public License, v. 2.0.
// If a copy of the MPL was not distributed with this file,
// You can obtain one at
// http://mozilla.org/MPL/2.0/.

var dtfLayoutMode = (function( $ ) {
    'use strict';

    var _draggable = function(block) {
        var parent_div = block.closest('div'),
        c = {};

        parent_div.addClass('sortable-element');

        $('#templateContainer').sortable({
            items: '.sortable-element',
            placeholder: "ui-state-highlight",
            revert: true,
            scrollSpeed: 40,
            sort: function(event, ui) {
                var containerHeight = $('#templateContainer').height()/2;
                var centerElement = (ui.item.height()/2)/2;
                var topElement = ui.item.offset().top/2;
                var windowPos = parseFloat(topElement) + parseFloat(centerElement);
                $(window).scrollTop(windowPos);
            },
            start: function(event, ui) {
                ui.placeholder.height(ui.item.height());
                $('.dtf-tr-element').remove();
                $('#templateContainer > tbody > tr:not(.sortable-element)').css('opacity', 0.5);
                var centerElement = (ui.item.height()/2);
                var topElement = ui.item.offset().top;
                var windowPos = parseFloat(topElement) + parseFloat(centerElement) - 100;
                window.scrollTo(0, windowPos);
            },
            stop: function(event, ui) {
                $('.button-del').remove();
                $('.dtf-block').each(function() {
                    if($(this).hasClass('dtf-changeable')) {
                        changeClass($(this));
                    }else {
                        equipBlock($(this));
                    }
                });
                $('#templateContainer > tbody > tr:not(.sortable-element)').css('opacity', 1);
            }
        });
    };

    var _addDelBtn = function(block) {
        if (block.prev('.pure-button-del').length <= 0 && !block.hasClass('isUnique')) {
            $(window.templates.blockDelButton)
            .insertBefore(block)
            .on('click', function(){
                var element = $(this).next();
                var row = element.closest('tr');
                var before_row = row.prev();
                var row_parent = row.parent();
                var next_draft = row.next('tr');
                var removed = deleteBlock(element).hide();
                dtfEditor.pushToStack(function(){
                    // Record previous element or parent if first
                    if (before_row.length > 0) {
                        before_row.after(removed);
                    } else {
                        row_parent.prepend(removed);
                    }
                    removed.show(200);
                });
            });
        }
    };

    var _hide_catalog = function() {
        $('.dtf-catalog').hide(100);
        $('.dtf-add-bar .button-add:hidden').show(100);
    };

    var _show_catalog = function() {
        _hide_catalog();
        $(this).hide(100);

        // show my catalog
        $(this).closest('div').find('.dtf-catalog')
        .html(dtfEditor.blocksCatalog.get_gallery())
        .show(100);
    };

    var enter = function() {
        info('Entering LayoutMode');

        var numberOfElement = $('.dtf-block').length;
        $('.dtf-block').each(function(i) {
            //addClass lastClass to last element
            if(i === numberOfElement - 1 ) $(this).addClass('lastChild');
            if(!$(this).hasClass('dtf-changeable')) {
                equipBlock($(this));
                _draggable($('.dtf-draggable'));
            }else {
                changeClass($(this));
            }
        });

        // Block adding
        $('.first-hidden').show(100);
        $(this).hide(100);

        // Broadcast change mode event
        debug('Broadcast dtfLayoutModeEnter');
        $('#dtf-content').trigger('dtfLayoutModeEnter');
    };

    var leave = function() {
        info('Leaving LayoutMode');

        $('.dtf-draft-block').closest('div').remove();
        $('.button-del').remove();
        $('.first-hidden').hide(100);
        $('#dtf-layout-mode').show(100);
        $('.dtf-deletion-border').removeClass('dtf-deletion-border');
        $( "#templateContainer" ).sortable( "destroy" );

        // Broadcast change mode event
        debug('Broadcast dtfLayoutModeLeave');
        $('#dtf-content').trigger('dtfLayoutModeLeave');
    };

    /**
    * Equips a block with a border and block inserting tool under it.
    */
    var equipBlock = function(block) {
        var parent_div = block.closest('div');

        block.addClass('dtf-deletion-border');
        if (parent_div.next('div').find('.dtf-draft-block').length <= 0) {
            var draft_row = $(window.templates.blockAddBar);
            draft_row.find('button').on('click', _show_catalog);
            _hide_catalog();

            parent_div.after(draft_row.fadeIn());
        }

        //Add button delete block if not Unique
        _addDelBtn(block);

    };

    //Change Class of element with listChangeable in configuration.json
    var changeClass = function(block, blockClass) {
        var parent_div = block.closest('div');
        //console.log(parent_div.find('.dtf-block'));

        block.addClass('dtf-deletion-border');
        if (parent_div.next('div').find('.dtf-draft-block').length <= 0) {
            if(!block.hasClass('lastChild')) {
                var draft_rowAdd = $(window.templates.blockAddBar);

                draft_rowAdd.find('button').on('click', _show_catalog);
                _hide_catalog();

                parent_div.after(draft_rowAdd.fadeIn());
            }

            var draft_row = $(window.templates.blockChange);
            var classesElement = parent_div.find('.dtf-block').data('change-class');
            var removeOldClasse = classesElement.split(',').join(' ');
            var arrClass = classesElement.split(',');

            parent_div.after(draft_row);

            $.each(arrClass, function() {
                if(block.closest('div').find('.dtf-block').hasClass(this)) {
                    draft_row.find('.dtf-change-element').append('<div data-background="'+this+'" class="active dtf-background '+this+'"></div>');

                }else {
                    draft_row.find('.dtf-change-element').append('<div data-background="'+this+'" class="dtf-background '+this+'"></div>');
                }

            });

            block.closest('div').next().on('click', '.dtf-background', function() {
                $('.dtf-background').removeClass('active');
                $(this).addClass('active');
                draft_row.prev().find('.dtf-block').removeClass(removeOldClasse);
                var nameClass = $(this).data('background');
                draft_row.prev().find('.dtf-block').addClass(nameClass);

            });
        }

        //Add button delete block if not Unique
        _addDelBtn(block);
    };

    var deleteBlock = function (block) {
        /* the setattr is a woraround to avoid getting a hidden forever
        * cloned element
        */
        var parent_div = block.closest('div');
        var deleted;
        //console.log(parent_div.next('div'));
        if(block.hasClass("dtf-changeable")) {
            deleted = $().add(parent_div).add(parent_div.next('div')).add(parent_div.next('div').next('div'));
        }else {
            deleted = $().add(parent_div).add(parent_div.next('div'));
        }

        var clone = deleted.clone(true, true);
        deleted.hide(200, function() {
            $(this).remove();
        });
        return clone;
    };

    return {
        enter       : enter,
        leave       : leave,
        changeClass : changeClass,
        equipBlock  : equipBlock,
        deleteBlock : deleteBlock
    };

})( jQuery );

// Copyright (c) 2016 Oasiswork.
// All Rights Reserved.
//
// This Source Code Form is subject to the
// terms of the Mozilla Public License, v. 2.0.
// If a copy of the MPL was not distributed with this file,
// You can obtain one at
// http://mozilla.org/MPL/2.0/.

var dtfDraftsManager = (function( $ ) {
    'use strict';

    var versionTpl = 1;
    var containerListDraft = $('containerListDraft');

    var saveDraft = function() {
        spinner('show');
        var resultPrompt = prompt($.t('drafts.name_prompt'), $.t('drafts.default_name'));

        function checkingSave(val) {
            if(val === true) {
                dtfEditor.setMessage($.t('drafts.save_ok'), 'valid');
            }
            else {
                dtfEditor.setMessage($.t('drafts.save_error'), 'error');
            }
        }

        if ( resultPrompt !== "" && resultPrompt !== null ) {
            var save = true;
            var exist;

            if ( draftStore.draftExists(resultPrompt) ) {
                info('Draft name already exist: ' + resultPrompt);
                save = confirm($.t('drafts.overwrite_confirm'));
                if (save === true) {
                    info('Overwriting draft named ' + resultPrompt);
                    exist = true;
                }
            }

            if ( save === true ) {
                var date = new Date();
                date = date.toLocaleDateString() + " " + date.toLocaleTimeString();

                var html = dtfEditor.getContent();
                var styles = dtfEditor.getUserStyles();

                draftStore.saveDraft( resultPrompt, html, styles, blocks_config, date, checkingSave, exist);

            }
        } else if ( resultPrompt === "" ) {
            dtfEditor.setMessage($.t('drafts.name_empty'), 'error');
        }
        spinner('hide');
    };

    var hideMenu = function() {
        $('#containerListDraft').removeClass('isActive');
    };

    var listDrafts = function() {
        var draftsListUl = $('#listDraft');
        draftsListUl.empty();

        var list = draftStore.listDrafts();

        function checkingDelete(val) {
            if(val === true) {
                dtfEditor.setMessage($.t('drafts.delete_ok'), 'valid');
            }
            else {
                dtfEditor.setMessage($.t('drafts.delete_error'), 'error');
            }
        }

        list.forEach( function(draft) {

            var draftLi = $("<li/>");
            draftLi.attr('data-objId', draft.id);
            
            var spanDate = $('<span class="draftDate">'+draft.date+'</span>');

            var spanName = $('<span class="draftName">'+draft.name+'</span>');

            var spanDelete = $('<span class="spanDelete fa fa-minus-circle"/>');


            draftLi.append(spanDate);
            draftLi.append(spanName);
            draftLi.append(spanDelete);

            draftLi.on('click', function(e) {
                if ( confirm($.t('drafts.restore_confirm')) ) {
                    try {
                        draftStore.loadDraft(draft.id);
                    } catch(err) {
                        dtfEditor.setMessage($.t('drafts.restore_error'), 'error');
                    }
                }
            });

            spanDelete.on('click', function(e) {
                if(confirm($.t('drafts.delete_confirm'))) {
                    //var id = this.parentNode.getAttribute('data-objId');

                    draftStore.deleteDraft(draft.id, checkingDelete);

                }
                e.stopPropagation();
            });

            draftsListUl.append(draftLi);
        });
    };

    var deleteAllDrafts = function() {
        var list = draftStore.listDrafts();
        var draftsListUl = document.getElementById('listDraft');

        function checkingDeleteAll(val) {
            if(val === true) {
                draftsListUl.removeChild(draftLi);
            }
        }

        for ( var v = 0; v < list.length; v++) {
            var id = this.parentNode.getAttribute('data-objId');
            draftStore.deleteDraft(draft.id, checkingDeleteAll);
        }
    };

    return {
        saveDraft       : saveDraft,
        listDrafts      : listDrafts,
        hideMenu        : hideMenu,
        deleteAllDrafts : deleteAllDrafts
    };

})( jQuery );

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

// Copyright (c) 2016 Oasiswork.
// All Rights Reserved.
//
// This Source Code Form is subject to the
// terms of the Mozilla Public License, v. 2.0.
// If a copy of the MPL was not distributed with this file,
// You can obtain one at
// http://mozilla.org/MPL/2.0/.

var dtfEditor = (function ( $ ) {
    'use strict';

    // Some scoped global variables
    var undoBtn;

    /*
    * Blocks events
    */
    var blockEvent = {
        last_el_created: null,
        insert: function(el) {
            var dom_block = blocksCatalog.get_dom(el.attr('data-block-name'));
            dom_block.addClass('dtf-draggable dtf-block');

            var new_row = $(window.templates.baseBlock);
            new_row.find('.dtf-block')
            .replaceWith(dom_block);

            var divClass = blocksCatalog.get_divClass(el.attr('data-block-name'));

            new_row.addClass(divClass);

            var draft_row = el.closest('div.dtf-tr-element');
            draft_row.after(new_row.css('display', 'none'));

            if ( dom_block.hasClass('dtf-changeable') ) {
                dtfLayoutMode.changeClass(dom_block);
            } else {
                dtfLayoutMode.equipBlock(dom_block);
            }
            blockEvent.last_el_created = new_row;
            new_row.show(100);

            actionStack.push(function(){
                dtfLayoutMode.deleteBlock(dom_block);
            });
        }
    };

    /**
    * Blocks Catalog
    */
    var blocksCatalog = {
        // DOM catalog
        blocks  : $('<div>'),
        // DOM content of each block, indexed by name as per configuration.json
        doms    : {},
        // blocks configs dictionnary
        configs : {},

        get_gallery: function () {
            return this.blocks.children().clone(true, true);
        },

        get_dom: function ( name ) {
            return this.doms[name].html.clone(true, true);
        },

        get_divClass: function ( name ) {
            return this.doms[name].divClass;
        },

        add: function ( name, block_config, dom ) {
            // To be able to call functions within this object
            var that = this;

            // Check if block is unique
            if ( !block_config.isUnique ) {
                var blockIcon = $('<span class="dtable icon"><span class="dtable-cell"></span></span>');
                var blockCaption = $();

                if (block_config.icon in blocksIcons) {
                    blockIcon.find('.dtable-cell').html(blocksIcons[block_config.icon]);
                    var caption = block_config.icon;
                    if ('caption' in block_config) caption = block_config.caption;
                    blockCaption = $('<span class="dblock">' + caption + '</span>');
                } else {
                    blockIcon = $(block_config.icon);
                }
                var link = $('<a class="dtf-block-choice" href="#">')
                .attr('data-block-name', name)
                .append(blockIcon);
                if (blockCaption.length) {
                    link.append(blockCaption);
                }

                // Test changeable class in configuration.json
                if ( typeof block_config.listChangeable === "undefined" ) {

                    $(block_config.selector).addClass('dtf-draggable');
                    this.blocks.first().append(link);

                } else {

                    $(block_config.selector).attr('data-change-class', block_config.listChangeable);
                    var existBlockDom = {
                        "html": $(block_config.selector).first().clone(true, true),
                        "divClass": $(block_config.selector).closest("div").attr("class")
                    };
                    dom = existBlockDom;
                    $(block_config.selector).addClass('dtf-draggable');
                    this.blocks.first().append(link);

                }

                link.on("click", function(e) {
                    blockEvent.insert($(this));
                    e.preventDefault();
                });

            } else if ( block_config.isUnique && typeof block_config.listChangeable !== "undefined" ){

                $(block_config.selector).attr('data-change-class', block_config.listChangeable);
                $(block_config.selector).addClass('isUnique');

            } else {

                $(block_config.selector).addClass('isUnique');

            }
            this.doms[name] = dom;
            this.configs[name] = block_config;
        }
    };

    /**
    * Gets all the block config and initialize them
    */
    var _fetchBlocksConfig = function () {
        /*
        * Reset blocksCatalog.blocks to prevent duplication
        */
        blocksCatalog.blocks = $('<div>');
        _.forOwn(blocks_config.styles, function (config, name) {
            var cloned_block = $(config.selector).first().clone(true, true);
            cloned_block.attr("data-default", "true");

            var existBlockDom = {
                "html": cloned_block,
                "divClass": $(config.selector).closest("div").attr("class")
            };
            blocksCatalog.add(name, config, existBlockDom);

            if ( config.urlckEditor !== undefined ) {
                // Get CKEditor config URL from config
                var ckEditorUrl = getAbsoluteUrl(config.urlckEditor);

                // Fetch CKEditor config
                $.getJSON(ckEditorUrl, function(data) {
                    // Set CKEditor language to global lang
                    data.ckEditor.language = settings.lang;

                    // Initialize the content editables in the block
                    $(config.selector).find('.dtf-contentEditable')
                    .attr('contentEditable',true)
                    .ckeditor(data.ckEditor);
                    // Save the block config for future use
                    localStorage.setItem(config.selector,JSON.stringify(data.ckEditor));
                });

            } else {

                // Initialize the content editables in the block with default config
                $(config.selector).find('.dtf-contentEditable')
                .attr('contentEditable', true)
                .ckeditor({language: settings.lang});

            }
        });

        dtfContentMode.enter();

    };

    /* Remove data attributes
    */
    var _removeDataAttributes = function ($target) {
        if ( 0 !== $target.length ) {
            var i,
            attrName,
            dataAttrsToDelete = [],
            dataAttrs = $target.get(0).attributes,
            dataAttrsLen = dataAttrs.length;

            // Loop through attributes and make a list of those
            // that begin with 'data-'
            for (i=0; i<dataAttrsLen; i++) {
                if ( 'data-' === dataAttrs[i].name.substring(0,5) ) {
                    // Why don't we just delete the attributes here?
                    // Deleting an attribute changes the indices of the
                    // others wreaking havoc on the loop we are inside
                    // b/c dataAttrs is a NamedNodeMap (not an array or obj)
                    dataAttrsToDelete.push(dataAttrs[i].name);
                }
            }
            // Delete each of the attributes we found above
            // i.e. those that start with "data-"
            $.each( dataAttrsToDelete, function( index, attrName ) {
                $target.removeAttr( attrName );
            });
        }
    };

    var generateFinal = function ( $content ) {
        if ( undefined === $content || null === $content) {
            error('No HTML content provided, cannot generate final document');
            setMessage($.t('editor.valid_error'), 'error');
        } else {

            spinner('show');
            var html = _contentCleanup($content);
            // Get the custom styles
            var styles = getUserStyles();

            // Load the boilerplate from the server
            var boilerplateURL = settings.appRootUrl + 'final-boilerplate.html';
            $.get(boilerplateURL, function (boilerplate) {
                // Insert user bits
                boilerplate = boilerplate.replace('[[USER_TITLE]]', settings.title);
                boilerplate = boilerplate.replace('[[USER_STYLES]]', styles);
                boilerplate = boilerplate.replace('[[USER_CONTENT]]', html);
                boilerplate = boilerplate.replace('[[USER_NOINLINE_ATTR]]', settings.noinlineAttr);

                // Remove CSS comments
                boilerplate = boilerplate.replace(/\/\*(.|[\r\n])*?\*\//g, "");
                // Remove blank lines for good measure
                boilerplate = boilerplate.replace(/^\s*[\r\n]/gm, "");

                postMessage.post("final_html", boilerplate);

                spinner('hide');
                setMessage($.t('editor.valid_ok'), 'valid', false);
                // Lock the editor
                _lockEdition(true);
            })
            .fail(function () {
                warn('Could not get boilerplate from server, aborting content export');
                spinner('hide');
                setMessage($.t('editor.valid_error'), 'error');
            });
        }
    };

    var getUserStyles = function () {
        // Get the styles
        // we actually fetch all the content of <head> and remove unwanted bits
        // to be able to keep parts wrapped in comments like <!--[if gte mso 9]>
        var $head = $('head').clone();
        $head.find('title,meta,link, script, style:not([data-userstyle])').remove();
        _removeDataAttributes($head.find('style'));

        return unescape($head.html());

    };

    String.prototype.htmlEncode = function() {
        var charsToReplace = {
            '“': '&ldquo;',
            '”': '&rdquo;'
        };
        return this.replace(/[“”]/g, function(char) {
            return charsToReplace[char] || char;
        });
    };

    var getContent = function ( asObject ) {
        if ( undefined === asObject) asObject = false;

        try {
            // Disable the editor, removes the content editables and other stuff
            dtfContentMode.leave();
            // Clone the content div
            var $content = $('#dtf-content').clone();

            // Re-enable the editor
            dtfContentMode.enter();

            if (asObject) {
                return $content;
            } else {
                return htmlFromContent($content);
            }

        } catch(err) {
            error('Error getting content !');
            return null;
        }
    };

    var htmlFromContent = function( $content ) {
        // Remove internal classes
        _.each(['dtf-block', 'dtf-draggable', 'isUnique'], function(dtfClass) {
            $content.find('.'+dtfClass).removeClass(dtfClass);
        });

        // Dump the raw html
        var html = $content.html();

        // HTML-encode some characters in the tags that might contain text,
        // in order to avoid mangling further down the chain
        // especially with UTF-8 encoding on POST (smart quotes for example)
        html = html.htmlEncode();

        // Remove tbody tags
        html = html.replace(/<\/?tbody>/g, '');

        // Remove no IE comments
        html = html.replace(/<!--(?!\[if).*?-->/g, "");

        return html;
    };

    var _contentCleanup = function($content) {
        // First get all the uploadable images sizes
        // and set their attributes accordingly
        $content.find('.dtf-imageUploadable').each(function() {
            var width = $(this)[0].naturalWidth;
            var height = $(this)[0].naturalHeight;
            if ( $(this).width() !== 0 ) {
                // Not a stock image, so get real size (possibly resized)
                width = $(this).width();
                height = $(this).height();
            }
            $(this).attr('width', width);
            $(this).attr('height', height);
            $(this).removeAttr('class style');
        });


        $content.find('.dtf-upload').remove();
        _removeDataAttributes($content.find('.dtf-changeable'));
        $content.find('.dtf-contentEditable').removeAttr('contenteditable style');
        //Remove dentifrice Classes
        $content.find('*[class*="dtf"]').removeClass (function (index, css) {
            return (css.match(/dtf-[^"'\s]+(\s)*/g) || []).join(' ');
        });
        $content.find('.isUnique').removeClass("isUnique");

        //Add table conditional IE
        $content.find('#templateContainer td:first > div').each(function() {
            $(this).before('<!--[if (gte mso 9)|(IE)]><table cellpadding="0" cellspacing="0" width="600" align="center"><tr><td><![endif]-->');
            $(this).after('<!--[if (gte mso 9)|(IE)]></td></tr></table><![endif]-->');
        });

        return htmlFromContent($content);
    };

    /**
    * An action stack to allow undo-ing actions
    */
    var actionStack = {
        stack : [],
        // Push an undo function to the stack
        push: function (func) {
            this.stack.push(func);
        },
        // Calls the latest pushed function
        undo: function() {
            var last_el = this.stack.pop();
            if (last_el) {
                last_el();
            } else {
                info('nothing to undo');
            }
        },
    };

    /**
    * A controller for an undo button based on an action stack
    */
    var UndoButton = function(el, stack) {
        this.el = $(el);
        this.stack = stack;

        this.el.on('click', function(){
            stack.undo();
        });
    };

    UndoButton.prototype.flash = function(){
        var btn = this.el;
        var flash_color = 'rgb(202, 60, 60)';
        var orig_color = btn.css('background-color');

        btn.animate(
            {backgroundColor: flash_color}, 100,
            function() {
                btn.animate({backgroundColor: orig_color}, 100);
            }
        );
    };

    var _lockEdition = function (lock) {
        if (lock) {
            $('.overlay').show();
            $('#getList').hide();
            $('#dtf-layout-mode').hide();
            $('#dtf-drop-down-btn').hide();
            $('#validateBtn').hide();
            $('#resumeBtn').show();
        } else {
            $('#resumeBtn').hide();
            $('#getList').show();
            $('#dtf-layout-mode').show();
            $('#dtf-drop-down-btn').show();
            $('#validateBtn').show();
            $('#messages').fadeOut(100);
            $('.overlay').fadeOut(100);
        }
    };
    /*
    * add a item to dropdown
    */
    var addItemDropDown = function(btn, event) {
        var li = $("<li/>");
        li.append(btn);
        btn.on("click", event);
        $('#dtf-drop-down').append(li);
    };

    var _loadToolbar = function () {
        if ( !$('#dtf-toolbar').length ) {
            var toolbar = $(window.templates.layoutToolbar);
            undoBtn = new UndoButton(toolbar.find('#undoBtn'), actionStack);

            var layoutModeBtn = toolbar.find('#dtf-layout-mode');
            layoutModeBtn.on('click', function() {
                $('#dtf-drop-down-btn').hide();
                $('#validateBtn').hide();
                $.proxy(dtfContentMode.leave,this)();
                $.proxy(dtfLayoutMode.enter,this)();
            });

            var contentModeBtn  = toolbar.find('#dtf-content-mode');
            contentModeBtn.on('click', function() {
                $('#dtf-drop-down-btn').show();
                $('#validateBtn').show();
                $.proxy(dtfLayoutMode.leave,this)();
                // use setTimeout to let animation finish before we do heavy work
                // otherwise, animation gets glitched.
                window.setTimeout(
                    $.proxy(dtfContentMode.enter,this),
                    100
                );
            });

            var validateBtn = toolbar.find('#validateBtn');
            validateBtn.on('click', function() {
                // Generate final content and post to parent
                generateFinal(getContent(true));
            });

            var resumeBtn = toolbar.find('#resumeBtn');
            resumeBtn.on('click', function() {
                // We post an empty content to empty the parent textarea
                // and force a new validation of the content
                postMessage.post("final_html", "");
                // Unlock the editor
                _lockEdition(false);
            });

            var containerListDraft = toolbar.find('#containerListDraft');

            var saveDraftBtn = toolbar.find('#saveDraft');
            saveDraftBtn.on('click', function() {
                dtfDraftsManager.saveDraft();
            });

            var draftsListBtn = toolbar.find('#getList');
            draftsListBtn.on('click', function() {
                dtfDraftsManager.listDrafts();
                containerListDraft.addClass('isActive');
                $('body').addClass('sidebarMenuOpen');
            });

            var closeDraftsListBtn = toolbar.find('#closeListDraft');
            closeDraftsListBtn.on('click', function() {
                containerListDraft.removeClass('isActive');
                $('body').removeClass('sidebarMenuOpen');
            });

            $('body').append(toolbar);

            // Resume button needs to be hidden first
            $('#resumeBtn').hide();

            toolbar.i18n();

            $('body').addClass('toolbarVisible');
        }
    };

    /**
    * Displays a notification on top of the editor
    */
    var setMessage = function ( text, status, temp ) {
        if (undefined === temp) temp = true;

        if ( !$('#messages').length ) {
            $('body').append($(window.templates.layoutMessages));
        }

        $("#messages").attr('class', '');
        $('#messages')
        .text(text)
        .addClass(status)
        .fadeIn(300);
        if (temp) {
            $('#messages')
            .delay(2500)
            .fadeOut(100);
        }
    };

    var pushToStack = function ( fn ) {
        actionStack.push(fn);
    };

    /**
    * Load the editor
    */
    var load = function (callback) {
        _fetchBlocksConfig();
        _loadToolbar();
        if (callback) {
            debug('calling after-load callback');
            callback();
        }
    };



    // Return public methods
    return {
        blocksCatalog   : blocksCatalog,
        blockEvent      : blockEvent,
        setMessage      : setMessage,
        addItemDropDown : addItemDropDown,
        pushToStack     : pushToStack,
        getContent      : getContent,
        getUserStyles   : getUserStyles,
        htmlFromContent : htmlFromContent,
        generateFinal   : generateFinal,
        load            : load
    };

}( jQuery ));
