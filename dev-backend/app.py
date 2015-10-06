# Copyright (c) 2015 Oasiswork.
# All Rights Reserved.
#
# This Source Code Form is subject to the
# terms of the Mozilla Public License, v. 2.0.
# If a copy of the MPL was not distributed with this file,
# You can obtain one at
# http://mozilla.org/MPL/2.0/.

from __future__ import unicode_literals
from bottle import Bottle, request, response, static_file, SimpleTemplate
from uuid import uuid4

app = Bottle()

index = SimpleTemplate("""
<html>
    <head><title>Dentifrice Dev Backend</title></head>
    <body>
        <h1>I'm the test backend for Dentifrice development !</h1>
        <p>Post me stuff, I'll eat it :)</p>
        <ul>
            <li>On <strong>{{url}}</strong>: displays the received newsletter</li>
            <li>On <strong>{{url}}files</strong>: saves the file to /tmp and returns a url pointing to it</li>
        </ul>
        <p>et voilà !</p>
    </body>
</html>""")

postdisplay = SimpleTemplate("""
<html>
    <head>
        <title>Dentifrice Dev Backend</title>
        <script type="text/javascript">
        function autoResize(id){
            var newheight;
            var newwidth;
            if(document.getElementById){
                newheight=document.getElementById(id).contentWindow.document .body.scrollHeight + 20;
                newwidth=document.getElementById(id).contentWindow.document .body.scrollWidth + 100;
            }
            document.getElementById(id).height= (newheight) + "px";
            document.getElementById(id).width= (newwidth) + "px";
        }
        </script>
    </head>
    <body>
        <h1>Hmmm Yummy :)</h1>
        <p>Here is your post</p>
        <iframe id="iframe" src="{{url}}" onLoad="autoResize('iframe');"></iframe>
    </body>
</html>""")

# Generate temp file path and URL
def make_tempfile():
    filename = 'dentifrice-{}'.format(uuid4())
    path = '/tmp/{}'.format(filename)
    url = '{}://{}/get/{}'.format(request.urlparts.scheme, request.urlparts.netloc, filename)
    return path, url

# Log debug messages
def debug(msg):
    print('[DEBUG] {}'.format(msg))

# CORS decorator
def enable_cors(fn):
    def _enable_cors(*args, **kwargs):
        # set CORS headers
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token'

        if request.method != 'OPTIONS':
            # actual request; reply with the actual response
            return fn(*args, **kwargs)

    return _enable_cors

# Strip trailing slash since Bottle considers /path and /path/ as different routes
@app.hook('before_request')
def strip_path():
    request.environ['PATH_INFO'] = request.environ['PATH_INFO'].rstrip('/')

# Homepage
@app.get('/')
def home():
    return index.render(url=request.url)

# File / HTML retrieval
@app.get('/get/<filename>')
def getfile(filename):
    #path = '/tmp/{}'.format(filename)
    #mimetype = from_file(path, mime=True).decode("utf-8")
    return static_file(filename, root='/tmp')

# Files (images) posting
@app.post('/files')
@enable_cors
def upload():
    path, url = make_tempfile()
    files = request.files
    if len(files.keys()) == 0:
        debug('/files : no data received')
        response.status = 400
        return 'So... where is the file ?!'
    else:
        for name, fobj in files.iteritems():
            path, url = make_tempfile()
            debug('/files : file received ({}), saving to {}'.format(fobj.filename, path))
            fobj.save(path, overwrite=True)
        debug('/files : returning url {}'.format(url))
        return url

# Newsletter content posting
@app.post('/')
@enable_cors
def formpost():
    if 'newsletter' in request.POST:
        path, url = make_tempfile()
        with open(path,'w') as f:
            f.write(request.POST['newsletter'])
        return postdisplay.render(url=url)
    else:
        response.status = 400
        return 'I only feed Dentifrice newsletters... take your post away !'

if __name__ == "__main__":
    app.run(debug=True, port=8080)
