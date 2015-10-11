Dentifrice is a modern and simple editor for HTML emails.

It's primary purpose is to allow non-technical users to create great looking and well crafted HTML emails from pre-defined templates.

The application is composed of two main parts:

* A bootstrap script to be embedded in your page. It is written in plain JS and has no dependencies on external libraries.
* The actual editor that is loaded in an iFrame on the parent page. It ships with all its dependencies, the main ones being CKEditor and jQuery.

Dentifrice is developed and maintained by the team behind [Crunchmail](http://crunchmail.com).  
While it works great in combination with Crunchmail's platform, it can be used completely independently to help produce your email content.

We provide the toothpaste (yes, that's what Dentifrice means) and you can brush your way, but no less than twice a day!

## Getting started

### Development environment

First you'll need npm for dependencies management. Head over to the [NodeJS website](http://nodejs.org) for installation instructions.

Then clone the repo and install the dependencies

    git clone https://github.com/crunchmail/dentifrice.git dentifrice
    # Install gulp and bower globally
    (sudo) npm install -g gulp bower
    # Install npm dependencies
    cd dentifrice
    npm install

The project ships with a development backend. It is a very lightweight python application build with Bottle that exposes two POST endpoints for Dentifrice (image upload and final HTML submission, for checking).  
To run this backend you'll need Python3 and virtualenv. Go to the [Python website](http://python.org) to get it if necessary and then :

    (sudo) pip install virtualenv
    # The start.sh script will setup the virtualenv
    # and install the backend dependencies for you
    ./dev-backend/start.sh

All you need to do now is to build the app and run the dev webserver :

    gulp
    npm start

You're all set. Open [http://localhost:8000/test.html](http://localhost:8000/test.html) in your browser to try out Dentifrice.

### Integrate Dentifrice

Dentifrice can be integrated in any HTML page, very easily.  
A minimal integration is as simple as a couple of imports, a form and a script block:

```html
<head>
  <!-- ...-->
  <link rel="stylesheet" href="css/dentifrice.css">
  <script src="dentifrice.js"></script>
</head>
<body>
  <!-- ...-->
  <form ... >
    <textarea id="dentifrice-textarea" name="textarea"></textarea>
  </form>
  <script type="text/javascript">
		dentifrice.bootstrap ( { templateUrl: 'templates/basic/basic.html' } );
  </script>
</body>
```

Check out [test.html](/src/test.html) for a sample integration.

Dentifrice's bootstrap module offers several options for the editor's placement and other parameters.
See [docs/integration.md](/docs/integration.md) for the detailed documentation, including a Nginx example config for serving Dentifrice app.

## Creating your own templates

You can find the detailed documentation in [docs/templates_design.md](/docs/templates_design.md).

An sample template is shipped with the project and can be found in [templates/basic](/templates/basic).

## Browser compatibility

Since Dentifrice makes use of relatively modern web techniques, it works best on recent browsers.

It has currently been tested on:

* Firefox 38+
* Chrome 31+

For example, Dentifrice makes use of XMLHTTPRequest advanced features for images upload. A compatibility list can be found at http://caniuse.com/#feat=xhr2

Feel free to give feedback on using Dentifrice with other browsers, we will update this section.

## Translating

Dentifrice is currently available in the following languages:

* English
* French

The translations for the bootstrap script are embedded directly in the code since there are very few of them. See the **locales** variable in [bootstrap.js](/src/bootstrap.js).  

The translations for the editor itself use [i18next-client](http://i18next.com/).  
They are loaded from JSON files in [locales](/locales).

Dentifrice will first try to honor the language passed in the bootstrap settings. If none is provided or a translation can't be found for this language, it will try to find one for the browser's language. Finally, it will fall back to English.

Feel free to send us pull requests for new translations or fixes to the existing ones.  
You can also help translating Dentifrice on the project's [Transifex page](https://transifex.com/crunchmail/dentifrice).

## Contributing

Please read our [Contributing Guidelines](/CONTRIBUTING.md) before submitting issues or pull requests.

## License

Dentifrice is available under Mozilla Public License, version 2.0.

You can find the complete license in [LICENSE.md](/LICENSE.md) or at https://www.mozilla.org/en-US/MPL/2.0/
