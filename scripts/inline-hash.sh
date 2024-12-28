#!/usr/bin/sh
perl -0777 -ne 'print "$&" if /(?<=<script>).*(?=<\/script>)/s' build/index.html | openssl sha256 -binary | openssl base64