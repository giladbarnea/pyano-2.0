#!/usr/bin/env zsh

tscwatch=false
remove_use_strict=true
fix_d_ts_reference_types=true
_help="
tsc.sh [--watch (false)] [--rm_use_strict=BOOL (true)] [--fix_d_ts_reference_types=BOOL (true)]

  --watch                                  flag. passes --watch to tsc. on if script is tscw.sh
  --rm_use_strict=true|false               true by default
  --fix_d_ts_reference_types=true|false    true by default
  "
POSITIONAL=()
while [[ $# -gt 0 ]]; do
  case "$1" in
  -h | --help)
    echo "$_help"
    exit 0
    ;;
  --watch)
    tscwatch=true
    shift
    ;;
  --rm_use_strict=false | --remove_use_strict=false)
    remove_use_strict=false
    shift
    ;;
  --fix_d_ts_reference_types=false)
    fix_d_ts_reference_types=false
    shift
    ;;
  *)
    echo "$_help"
    echo "\nFATAL: unknown arg: $1. exiting."
    exit 1
    ;;
  esac
done
set -- "${POSITIONAL[@]}"

printf "\nkilling possible tsc processes...\n---------------------------------\n"
for proc in $(pgrep -f "tsc "); do
  kill $proc && printf "\nkilled %s\n" $proc || printf "\nWARN: failed killing %s\n" $proc
done
source ./scripts/rm_tscompiled_files.sh

printf "\nrunning tsc...\n--------------\n"
./node_modules/typescript/bin/tsc -p . &
wait $!
printf "\ncopying non-js files to dist...\n---------------------------------\n"
if [[ ! -e ./dist ]]; then
  mkdir dist && printf "\nWARN: dist dir did not exist, created it\n" || ( printf "\nFATAL: 'dist' dir did not exist and failed creating it\n" && exit 1 )
fi
cp -r ./src/* ./dist && printf "\ncopied all files in src into dist\n" || ( printf "\nFATAL: failed copying all files in src into dist\n" && exit 1 )
if find . -type f -regextype posix-extended -regex "\./dist/.*[^.]*\.ts$" -exec rm "{}" ";"; then
  echo "removed all .ts files from 'dist' dir"
else
  echo "FATAL: failed removing all .ts files from 'dist' dir"
  exit 1
fi
printf "\nfinished copying\n"
function check_iwatch_or_die(){
  if ! command -v 'iwatch'; then
    printf "\nFATAL: 'iwatch' not found. exiting."
    exit 1
  fi
}
if [[ "$tscwatch" == true ]]; then
  printf "\nrunning tsc --watch, sleeping for 1s...\n---------------------------------------\n"
  sleep 1
  ./node_modules/typescript/bin/tsc -p . --watch &
  printf "\nafter tsc --watch\n"
  if [[ "$remove_use_strict" == true ]]; then
    check_iwatch_or_die
    iwatch -e close_write -c 'python3 ./scripts/remove_use_strict.py %f' -t '.*\.js$' -r dist &
  fi
  if [[ "$fix_d_ts_reference_types" == true ]]; then
    check_iwatch_or_die
    iwatch -c 'python3 ./scripts/fix_d_ts_reference_types.py %f' -t '.*\.d\.ts$' -r declarations
  fi
else
  if [[ "$remove_use_strict" == true ]]; then
    find . -type f -regextype posix-extended -regex "\./dist/.*\.js$" -exec python3 ./scripts/remove_use_strict.py "{}" ";"
  fi
  if [[ "$fix_d_ts_reference_types" == true ]]; then
    find . -type f -regextype posix-extended -regex "\./declarations/.*\.d\.ts$" -exec python3 ./scripts/fix_d_ts_reference_types.py "{}" ";"
  fi
fi
