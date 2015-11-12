// Copyright (c) 2015 Oasiswork.
// All Rights Reserved.
//
// This Source Code Form is subject to the
// terms of the Mozilla Public License, v. 2.0.
// If a copy of the MPL was not distributed with this file,
// You can obtain one at
// http://mozilla.org/MPL/2.0/.


CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here.
	// For complete reference see:
	// http://docs.ckeditor.com/#!/api/CKEDITOR.config
	config.toolbar = "Dentifrice";

	config.toolbar_Dentifrice = [
		{ name: 'clipboard', items : [ 'Undo','Redo','PasteFromWord'] },
		{ name: 'basicstyles', items : [ 'Bold','Italic','Underline'] },
		{ name: 'styles', items : [ 'Styles','Format','FontSize' ] },
		'/',
		{ name: 'paragraph', items : [ 'NumberedList','BulletedList','-','JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock'] },
		{ name: 'links', items : [ 'Link','Unlink','Anchor' ] }
	];

	config.skin = 'dentifrice';

	config.extraPlugins = 'justify,font';

	config.removePlugins = 'liststyle,tabletools,scayt,menubutton,contextmenu,removeformat';

	// Remove some buttons provided by the standard plugins, which are
	// not needed in the Standard(s) toolbar.
	config.removeButtons = 'Underline,Subscript,Superscript';

	// Simplify the dialog windows.
	config.removeDialogTabs = 'image:advanced;link:advanced';
};
