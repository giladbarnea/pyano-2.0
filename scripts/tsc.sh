#!/usr/bin/env bash
source ./scripts/log.sh

tscwatch=false
remove_use_strict=true
fix_d_ts_reference_types=true
_help="
tsc.sh [--watch (false)] [--remove_use_strict=BOOL (true)] [--fix_d_ts_reference_types=BOOL (true)]

  --watch                                  flag. passes --watch to tsc. on if script is tscw.sh
  --remove_use_strict=true|false           true by default
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
    log.info "set tscwatch=true"
    shift
    ;;
  --remove_use_strict | --remove_use_strict=false | --remove_use_strict=true)
    if [[ "$1" == "--remove_use_strict" || "$1" == "--remove_use_strict=true" ]]; then
      remove_use_strict=true
    else
      # for sure val is 'false'
      remove_use_strict=false
    fi
    log.info "set remove_use_strict=$remove_use_strict"
    shift
    ;;
  --fix_d_ts_reference_types | --fix_d_ts_reference_types=false | --fix_d_ts_reference_types=true)
    if [[ "$1" == "--fix_d_ts_reference_types" || "$1" == "--fix_d_ts_reference_types=true" ]]; then
      fix_d_ts_reference_types=true
    else
      # for sure val is 'false'
      fix_d_ts_reference_types=false
    fi
    log.info "set fix_d_ts_reference_types=$fix_d_ts_reference_types"
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
log.title "tsc.sh: tscwatch=$tscwatch | remove_use_strict=$remove_use_strict | fix_d_ts_reference_types=$fix_d_ts_reference_types"
log.title "killing possible tsc processes..."

for proc in $(pgrep -f "tsc "); do
  vex "kill $proc"
done

source ./scripts/rm_tscompiled_files.sh

# *** tsc compile
log.title "running tsc..."
if [[ "$tscwatch" == true ]]; then
  ./node_modules/typescript/bin/tsc -p . &>/dev/null &
  wait $!
else
  ./node_modules/typescript/bin/tsc -p . &
  wait $!
fi
if python3 -c "
from pathlib import Path
import os
import sys
srcfiles = os.listdir('src')
for d in filter(Path.is_dir, Path('declarations').iterdir()):
    if not d.stem in srcfiles:
        sys.exit(f'{d} not a child of src/')
"; then
  log.good "tsc ok"
else
  log.fatal "bad tsc"
  exit 1
fi

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
  if ! command -v 'iwatch' &>/dev/null; then
    log.fatal "'iwatch' not found. exiting."
    exit 1
  fi
}
function vsleep() {
  log.info "sleeping $1 seconds..."
  sleep "$1"
  log.info "done sleeping $1 seconds"

}
function fn__fix_d_ts() {
  log.title "fixing '/// <reference types=' in declarations/**/*.d.ts files"
  find . -type f -regextype posix-extended -regex "\./declarations/.*\.d\.ts$" | while read -r dtsfile; do
    vex "python3 ./scripts/fix_d_ts_reference_types.py \"$dtsfile\""
  done
  if "$tscwatch"; then
    check_iwatch_or_die
    iwatch -e modify -c 'python3 ./scripts/fix_d_ts_reference_types.py %f' -t '.*\.d\.ts$' -r declarations &
  fi

}
function fn__remove_use_strict() {
  log.title "removing 'use strict;' from dist/**/*.js files"
  find . -type f -regextype posix-extended -regex "\./dist/.*\.js$" | while read -r jsfile; do
    vex "python3 ./scripts/remove_use_strict.py \"$jsfile\""
  done
  if "$tscwatch"; then
    check_iwatch_or_die
    iwatch -e modify -c 'sleep 0.49 &&  python3 ./scripts/remove_use_strict.py %f' -t '.*\.js$' -r dist &
  fi
}
if [[ "$tscwatch" == true ]]; then
  if ! confirm "tsc --watch?"; then
    log.warn "user aborted"
    exit 1
  fi
  # tsc takes 5.8~ seconds usually
  log.title "running tsc --watch, then sleeping 9 seconds..."
  ./node_modules/typescript/bin/tsc -p . --watch &
  vsleep 9
  

  
  # if [[ "$remove_use_strict" == true ]]; then
  #   check_iwatch_or_die
  #   iwatch -e close_write -c 'python3 ./scripts/remove_use_strict.py %f' -t '.*\.js$' -r dist &
  # else
  #   log.info "remove_use_strict is $remove_use_strict, not modifying js files"
  # fi
  # vsleep 5
  # if [[ "$fix_d_ts_reference_types" == true ]]; then
  #   check_iwatch_or_die
  #   iwatch -e close_write -c 'python3 ./scripts/fix_d_ts_reference_types.py %f' -t '.*\.d\.ts$' -r declarations &
  # else
  #   log.info "fix_d_ts_reference_types is $fix_d_ts_reference_types, not modifying d.ts files"
  # fi
# else # no watch
#   if [[ "$remove_use_strict" == true ]]; then
#     log.title "removing 'use strict;' from dist/**/*.js files"
#     find . -type f -regextype posix-extended -regex "\./dist/.*\.js$" | while read -r jsfile; do
#       vex "python3 ./scripts/remove_use_strict.py \"$jsfile\""
#     done
#   else
#     log.info "remove_use_strict is $remove_use_strict, not modifying js files"
#   fi
#   if [[ "$fix_d_ts_reference_types" == true ]]; then
#     log.title "fixing '/// <reference types=' in declarations/**/*.d.ts files"
#     find . -type f -regextype posix-extended -regex "\./declarations/.*\.d\.ts$" | while read -r dtsfile; do
#       vex "python3 ./scripts/fix_d_ts_reference_types.py \"$dtsfile\""
#     done
#   else
#     log.info "fix_d_ts_reference_types is $fix_d_ts_reference_types, not modifying d.ts files"
#   fi
fi
if [[ "$remove_use_strict" == true ]]; then
  fn__remove_use_strict
else
  log.info "remove_use_strict is $remove_use_strict, not modifying js files"
fi
if [[ "$fix_d_ts_reference_types" == true ]]; then
  fn__fix_d_ts_reference_types
else
  log.info "fix_d_ts_reference_types is $fix_d_ts_reference_types, not modifying d.ts files"
fi
