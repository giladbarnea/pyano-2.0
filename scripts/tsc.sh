#!/usr/bin/env bash
source ./scripts/log.sh

tscwatch=false
remove_use_strict=true
fix_d_ts_reference_types=true
_help="
tsc.sh [--watch (false)] [--rm_use_strict=BOOL (true)] [--fix_d_ts_reference_types=BOOL (true)]

  --watch                                  flag. passes --watch to tsc. on if script is tscw.sh
  --rm_use_strict=true|false               true by default
  --fix_d_ts_reference_types=true|false    true by default
  "

# *** command line args
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
    log.fatal "unknown arg: $1. exit 1"
    exit 1
    ;;
  esac
done
set -- "${POSITIONAL[@]}"

# *** kill tsc processes if exist
log.title "killing possible tsc processes..."

for proc in $(pgrep -f "tsc "); do
  vex "kill $proc"
done

source ./scripts/rm_tscompiled_files.sh

# *** tsc compile
log.title "running tsc..."
./node_modules/typescript/bin/tsc -p . &
wait $!

# *** populate dist/ dir
log.title "populating dist/ dir..."
# * create dist/ if not exist
if [[ ! -e ./dist ]]; then
  if mkdir dist; then
    log.warn "dist dir did not exist, created it"
  else
    log.fatal "'dist' dir did not exist and failed creating it"
    exit 1
  fi
fi
# * copy all src/ contents into dist/
if cp -r ./src/* ./dist; then
  log.good "copied all files from src into dist, now removing unnecessary files..."
else
  log.fatal "failed copying all files in src into dist"
  exit 1
fi
# * remove dist/**/*.ts files
find . -type f -regextype posix-extended -regex "\./dist/.*[^.]*\.ts$" | while read -r tsfile; do
  vex "rm $tsfile"
done

# * remove misc dirs and spare files
vex "rm -r dist/**/*__pycache__"
vex "rm -r dist/**/*pyano2.egg-info"
vex "rm -r dist/**/*.zip"
vex "rm -rf dist/engine/mock"

log.good "finished popuplating dist/ dir"

# *** modify .js/.ts files
# * 1) remove 'use strict;' from dist/**/*.js files
# * 2) fix '/// <reference types=' in declarations/**/*.d.ts files
log.title "modifying .js and .ts files across project..."
function check_iwatch_or_die() {
  if ! command -v 'iwatch'; then
    log.fatal "'iwatch' not found. exiting."
    exit 1
  fi
}
if [[ "$tscwatch" == true ]]; then
  log.title "running tsc --watch, sleeping for 1s..."
  sleep 1
  ./node_modules/typescript/bin/tsc -p . --watch &
  log.info "after tsc --watch"

  if [[ "$remove_use_strict" == true ]]; then
    check_iwatch_or_die
    iwatch -e close_write -c 'python3 ./scripts/remove_use_strict.py %f' -t '.*\.js$' -r dist &
  fi
  if [[ "$fix_d_ts_reference_types" == true ]]; then
    check_iwatch_or_die
    iwatch -c 'python3 ./scripts/fix_d_ts_reference_types.py %f' -t '.*\.d\.ts$' -r declarations
  fi
else # no watch
  log.title "removing 'use strict;' from dist/**/*.js files"
  if [[ "$remove_use_strict" == true ]]; then
    find . -type f -regextype posix-extended -regex "\./dist/.*\.js$" | while read -r jsfile; do
      vex "python3 ./scripts/remove_use_strict.py \"$jsfile\""
    done
  fi
  log.title "fixing '/// <reference types=' in declarations/**/*.d.ts files"
  if [[ "$fix_d_ts_reference_types" == true ]]; then
    find . -type f -regextype posix-extended -regex "\./declarations/.*\.d\.ts$" | while read -r dtsfile; do
      vex "python3 ./scripts/fix_d_ts_reference_types.py \"$dtsfile\""
    done
  fi
fi
