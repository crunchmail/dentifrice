#!/bin/bash

curdir=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

if [ ! -d "$curdir/.virtualenv" ]; then
  echo "Creating virtualenv"
  virtualenv "$curdir/.virtualenv"
  "$curdir/.virtualenv/bin/pip" install -r "$curdir/requirements.txt"
fi

"$curdir/.virtualenv/bin/python" "$curdir/app.py"
