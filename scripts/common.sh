#!/usr/bin/env bash

function common.clean_dist_of_junk_files() {
  if [[ -n "$1" && "$1" == "-q" ]]; then
    rm -r dist/**/*__pycache__ &>/dev/null
    rm -r dist/**/*pyano2.egg-info &>/dev/null
    rm -r dist/**/*.zip &>/dev/null
    rm -rf dist/engine/mock &>/dev/null
    # * remove dist/**/*.ts files
    find . -type f -regextype posix-extended -regex "\./dist/.*[^.]*\.ts$" | while read -r tsfile; do
      rm "$tsfile" &>/dev/null
    done
  else
    vex "rm -r dist/**/*__pycache__"
    vex "rm -r dist/**/*pyano2.egg-info"
    vex "rm -r dist/**/*.zip"
    vex "rm -rf dist/engine/mock"
    # * remove dist/**/*.ts files
    find . -type f -regextype posix-extended -regex "\./dist/.*[^.]*\.ts$" | while read -r tsfile; do
      vex "rm $tsfile"
    done
  fi

}
function common.kill_tsc_procs() {
  for proc in $(pgrep -f ".*tsc -p.*"); do
    vex "kill $proc"
  done
}
function common.kill_watch_procs() {
  for proc in $(pgrep -f '.*\bwatch .*'); do
    vex "kill $proc"
  done
}
function common.source_whatevers_available() {
  if [[ -n "$SCRIPTS" && -d "$SCRIPTS" ]]; then
    # shellcheck source=/home/gilad/Code/bashscripts/log.sh
    source "$SCRIPTS"/log.sh
    # shellcheck source=/home/gilad/Code/bashscripts/util.sh
    source "$SCRIPTS"/util.sh # for vex
    log.good "\$SCRIPTS var ok, sourced log.sh and util.sh from there"
  else
    source ./scripts/log.sh
    log.warn "\$SCRIPTS var was empty or not a dir, sourced project's log.sh fallback"
  fi
}
function vsleep() {
  log.info "sleeping $1 seconds..."
  sleep "$1"
  log.info "done sleeping $1 seconds"

}
