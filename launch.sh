#!/usr/bin/env bash
# node --experimental-modules --es-module-specifier-resolution=node --enable-source-maps ./node_modules/.bin/electron . no-python log
args="via-node-nopython log"
echo "running npm run $args"
npm run $args
