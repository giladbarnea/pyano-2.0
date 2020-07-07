#!/usr/bin/env zsh
source ./scripts/rm_tscompiled_files.sh
printf "\nrunning tsc...\n--------------\n"
node_modules/typescript/bin/tsc -p .
