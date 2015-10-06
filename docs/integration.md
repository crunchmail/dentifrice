# Dentifrice Integration

## Hosting the application

First of all, you need to make Dentifrice available for your website.  
To do that, you just need to host the content of the *dist* directory on your webserver of choice. Here is a simple configuration example for Nginx:

```
  server {

  listen 80;
  server_name www.example.com;

  # Your site's configuration: other locations, fcgi, ssl, whatever
  # ...

  # This assumes you have copied the contents of dentifrice/dist
  # to /var/www/mywebsite/assets/dentifrice
  location /dentifrice {
      alias /var/www/mywebsite/assets/dentifrice;
  }
```

Of course, you can also host Dentifrice on a different subdomain (eg. *dentifrice.example.com*).  

## Hosting your templates

The easiest is to host your templates along with Dentifrice, for example in the *templates* directory.  
But for various reasons you might want to host them elsewhere, on a different domain or even a different server.

If you choose to do so, make sure that:
* you use absolute URLs for the template, configuration and stylesheet (see the [Templates Design doc](/docs/templates_design.md) for details of what these are)
* the server that hosts the templates allow CORS requests, since the different parts are loaded dynamically by the app from the browser

## Integrating the editor

To integrate Dentifrice on your own site, you first need to import the bootstrap.js script (*dist/dentifrice.js* once built) and the CSS required for the validation alert.  
This script is responsible for:
* creating an iFrame loaded with the editor, passing along the configured language and template / styles / config URLs to it
* setting up a PostMessage listener that will receive the final HTML and set the value of the target textarea with it so you can retrieve it through a form post or any other method you like. We use PostMessages to allow discussions between the Parent page and the iFrame, without them having to be on the same domain.

To include Dentifrice on your page, simply add the following lines in the <head> of the page. Of course, adjust the source URL/path depending on your deployment.

    <link rel="stylesheet" href="css/dentifrice.css">
    <script src="dentifrice.js"></script>

You then have two methods at your disposal from the *dentifrice* module:
* dentifrice.bootstrap() to kickstart the editor
* dentifrice.checkIfValidated() to check whether the edition has been validated by the user and the target textarea has been populated with the final HTML

`dentifrice.bootstrap()` takes various settings as arguments (see [below](#user-settings)) and returns *true* if it was able to bootstrap the editor (*false* otherwise) so you can test and take appropriate measures.  
`dentifrice.checkIfValidated()` is meant to be included in your Form validation function. It will return *false* if the target textarea is empty and will display an alert message above the editor asking the user to validate its work.

You can check the [test page](/src/test.html) included in this repository for a simple example of an integration in a page with a Form.

Here is what a different approach to integrating Dentifrice on your site may look like.  
In this example we've chosen use AJAX to push the final HTML to a remote endpoint (for example to an API).  
In real life, you'll probably want to POST from your backend though to avoid leaking credentials, unless you use temporary tokens such as [JSON Web Tokens](http://jwt.io/):

```html
<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Dentifrice Test</title>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="css/dentifrice.css">
  <script src="dentifrice.js"></script>
  <script>
	function sendHTML() {
    if ( dentifrice.checkIfValidated() ) {
      var final = document.getElementById('dentifrice-target').value;
      var request = new XMLHttpRequest();
      request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
          alert('Content pushed !');
        } else if (request.readyState == 4 && request.status != 200) {
          alert('Error while pushing content...');
        }
      };
      request.open('POST', 'http://localhost:8080', false);
      request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      request.send('newsletter='+encodeURIComponent(final));
    }
	}
	</script>
</head>
<body>
  <!-- ...-->
  <div id="dentifrice-anchor"></div>
  <textarea id="dentifrice-target"></textarea>
  <button onclick="sendHTML()">Send HTML</button>
  <script type="text/javascript">
    var settings = {
      templateUrl: 'templates/basic/basic.html',
      anchorId: 'dentifrice-anchor',
      targetId: 'dentifrice-target'
    };
		if ( !dentifrice.bootstrap ( settings ) ) {
        alert('Could not load Dentifrice editor ! See console for errors.');
    }
  </script>
</body>
</html>
```
## Editor settings

There are 2 different types of settings you can use:
* global settings
* user settings, such as the template URL, language, ...

### Global settings

These settings are defined in a file called **_local_settings.js** which must be placed at the root of the application (ie. along with bootstrap.js, editor.html, ...). They are therefore global to all the instances of the editor.  
The following settings can be defined in this file:

Setting          |     Type     |      Default      |  Description
-----------------|--------------|:-----------------:|--------------
**log**          |  Boolean     |  *true*           |  Enable/Disable info console messages for the editor app
**debug**        |  Boolean     |  *false*          |  Enable/Disable debug console messages for the editor app
**showSpinner**  |  Boolean     |  *true*           |  Enable/Disable displaying the loading spinner on potentially long running tasks
**uploadURL**    |  String      |  dev-backend URL  |  Absolute URL the editor will POST images to. See [the Upload Store section](#upload-store) for more details
**plugins**      |  Dictionary  |  (see section)    |  JS files that will be loaded dynamically upon initialization of the editor. See [the plugins section](#plugins) for more details

### User settings

These settings can be provided at bootstrap time. They are meant to make the integration of the editor as flexible as possible:

Setting             |      Type     |         Default         |  Description
--------------------|---------------|:-----------------------:|--------------
**log**             |  Boolean      | true                    |  Enable/Disable info console messages for the editor's integration
**debug**           |  Boolean      | false                   |  Enable/Disable debug console messages for the editor's integration
**lang**            |  String       | en                      |  Language that the editor should use. Needs for the corresponding translation to be available, otherwise the browser's language will be tried with a fall-back to English
**targetSelector**  |  String       | dentifrice-textarea     |  ID of the textarea where the final HTML will be inserted
**hideTarget**      |  Boolean      | true                    |  Enable/Disable automatically hiding the target textarea
**templateUrl**     |  String       | null                    |  Absolute or relative (to the app root) URL of the template to be loaded. See the [Templates Design doc](/docs/templates_design.md) for more info
**stylesUrl**       |  String       | styles.html             |  Absolute or relative (to the template) URL of the file containing the template's styles. See the [Templates Design doc](/docs/templates_design.md) for more info
**configUrl**       |  String       | configuration.json      |  Absolute or relative (to the template) URL of the file containing the template's blocks configuration. See the [Templates Design doc](/docs/templates_design.md) for more info
**title**           |  String       | Dentifrice Newsletter   |  The title of the final HTML document. This is really only useful for the *View Online* version
**anchorId**        |  String       | null                    |  ID of the DOM element where the editor should be placed. If not provided, the editor will be inserted right after the target textarea
**replaceAnchor**   |  Boolean      | false                   |  Whether the editor should be inserted inside the Anchor or should replace it
**width**           |  Integer      | 850                     |  Editor's width, in pixels
**height**          |  Integer      | window.outerHeight*0.8  |  Editor's height, in pixels

The above settings can be passed as a dictionary to Dentifrice bootstrap method.

```
<script type="text/javascript">
  var dentifrice_settings = {
    lang        : 'fr',
    templateUrl : 'templates/basic/basic.html',
    anchorId    : 'editor-anchor',
  };
  dentifrice.bootstrap( dentifrice_settings );
</script>
```

## Plugins

You can provide 4 different types of plugins to Dentifrice.  
Two of them are mandatory for the application to work correctly and therefore have defaults (draftStore and uploadStore), the two others are optional and can be used to easily execute your code within the editor:
* **draftStore**: a module responsible for drafts saving and retrieval. Defaults to *drafts-localstore.js*. See [below](#draft-store) for more details
* **uploadStore**: a module responsible for posting images to the *uploadURL*. Defaults to *upload-simplestore.js*. See [below](#upload-store) for more details
* **beforeEditor**: a single (or a list of) URLs of JS scripts that will be loaded before the editor
* **afterEditor**: a single (or a list of) URLs of JS scripts that will be loaded after the editor

All the scripts loaded dynamically at initialization are loaded synchronously to ensure that the code in the plugins is executed when we want.

### Draft Store

The draft store module provided with the project is a simple LocalStorage store.  
But you can provide your own module, using this boilerplate:

```
var draftStore = (function () {
  var saveDraft = function ( name, html, styles, config, date ) {
    /* Save the draft and return true or false
     * based on success or failure.
     * Remember to assign a unique ID
     */
  };

  var listDrafts = function () {
    /* Return and list of objects with the following attributes:
     *  - id: the draft's unique ID
     *  - name: the draft's name
     *  - date: the date of the draft's last save
     *  - html: the draft's html content, as provided to saveDraft
     *  - styles: the draft's css content, as provided to saveDraft
     *  - config: the draft's config content, as provided to saveDraft
     */
  };

  var draftExists = function ( name ) {
    /* Return true or false based on whether
     * a draft with the same name already exists
     */
  };

  var deleteDraft = function ( id ) {
    /* Delete the draft with the provided ID
     */
  };

  return {
    saveDraft   : saveDraft,
    listDrafts  : listDrafts,
    draftExists : draftExists,
    deleteDraft : deleteDraft
  };

})();
```

### Upload Store

The image upload module provided with the project does a simple POST to the specified *uploadURL* address.  
This upload endpoint is expected to reply with a publicly accessible URL at which the image can be found.  
The URL is then returned back to the editor so the image can be included in the template.

You can provide your own upload module (for example to cloud services such as [imgur](https://imgur.com/)), using the following boilerplate:

```
var uploadStore = (function () {
  var doUpload = function (data) {
    /* Post the received raw image to the chosen service
     * and return the publicly accessible image URL
  };

  return {
    doUpload : doUpload
  };
})();
```
