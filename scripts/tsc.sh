#!/usr/bin/env zsh
printf "\nkilling possible tsc processes...\n--------------\n"
for proc in $(pgrep -f "tsc "); do
  kill $proc
  printf "\nkilled %s\n" $proc
done
source ./scripts/rm_tscompiled_files.sh

printf "\nrunning tsc...\n--------------\n"
./node_modules/typescript/bin/tsc -p . &
wait $!
printf "\ncopying non-js files to dist...\n"
if [[ ! -e ./dist ]]; then
  mkdir dist
  printf "\ndist dir did not exist, created it\n"
fi
cp -r ./src/* ./dist
sudo find . -type f -regextype posix-extended -regex "\./dist/.*[^.]*\.ts$" -exec rm "{}" ";"
printf "\nfinished copying\n"
if [[ -n "$1" && "$1" == "--watch" ]]; then
  printf "\nrunning tsc --watch, sleeping for 1s...\n--------------\n"
  sleep 1
  #  node_modules/typescript/bin/tsc -p . "${@}" &>/dev/null &
  ./node_modules/typescript/bin/tsc -p . "${@}" &
  printf "\nafter tsc --watch\n"
  iwatch -e close_write -c 'python3 ./scripts/remove_use_strict.py %f' -t '.*\.js$' -r dist
fi
