#!/usr/bin/env zsh
if [[ "$1" == "--help" ]]; then
  echo "tsc.sh [--watch] [--rm_use_strict=false]
  --watch for tsc --watch
  --rm_use_strict is true by default"
  return 0
fi
tscwatch=false
remove_use_strict=true
POSITIONAL=()
while [[ $# -gt 0 ]]; do
  case "$1" in
  --watch)
    tscwatch=true
    shift
    ;;
  --rm_use_strict=false | --remove_use_strict=false)
    remove_use_strict=false
    shift
    ;;
  *) # unknown flag/switch
    POSITIONAL+=("$1")
    echo "added '$1' to POSITIONAL"
    shift
    ;;
  esac
done
set -- "${POSITIONAL[@]}" # restore positional params

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
if [[ "$tscwatch" == true ]]; then
  printf "\nrunning tsc --watch, sleeping for 1s...\n--------------\n"
  sleep 1
  ./node_modules/typescript/bin/tsc -p . --watch &
  printf "\nafter tsc --watch\n"
  if [[ "$remove_use_strict" == true ]]; then
    iwatch -e close_write -c 'python3 ./scripts/remove_use_strict.py %f' -t '.*\.js$' -r dist
  fi
elif [[ "$remove_use_strict" == true ]]; then
  sudo find . -type f -regextype posix-extended -regex "\./dist/.*\.js$" -exec python3 ./scripts/remove_use_strict.py "{}" ";"
fi
