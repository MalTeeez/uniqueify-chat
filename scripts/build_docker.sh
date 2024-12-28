#!/usr/bin/sh
docker run --rm -d -v ./build/:/tmp/build/ $(docker build -q -f docker/Dockerfile .)