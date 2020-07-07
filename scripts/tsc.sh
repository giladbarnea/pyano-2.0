#!/usr/bin/env zsh
source ./scripts/rm_tscompiled_files.sh
printf "\nrunning tsc...\n--------------\n"
node_modules/typescript/bin/tsc -p .
printf "\ncopying non-js files to dist...\n"
cp -r ./src/* ./dist
sudo find . -type f -regextype posix-extended -regex "\./dist/.*[^.]*\.ts$" -exec rm "{}" ";"
printf "\nok\n"
if [ -n "$1" ]; then
  node_modules/typescript/bin/tsc -p . "${@}"
fi
