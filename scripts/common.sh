#!/usr/bin/env bash
function common.is_in_proj_root() {
  if [[ -f ./package.json && -s ./package.json && -d ./node_modules && -s ./node_modules ]]; then
    return 0
  else
    log.warn "NOT in project root. PWD: $PWD"
    return 1
  fi
}
function common.source_whatevers_available() {
  log.bold "sourcing whatever's possible..."
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
function common.kill_tsc_procs() {
  log.bold "killing possible tsc processes..."
  local any_killed=false
  for proc in $(pgrep -f ".*tsc -p.*"); do
    vex "kill -9 \"$proc\"" && any_killed=true
  done
  if [[ $any_killed == true ]]; then
    log.good "tsc processes found and killed"
  else
    log.info "no tsc processes found"
  fi
}
function common.kill_watch_procs() {
  log.bold "killing possible watch processes..."
  local any_killed=false
  for proc in $(pgrep -f '.*\bwatch .*'); do
    vex "kill -9 \"$proc\"" && any_killed=true
  done
  if [[ $any_killed == true ]]; then
    log.good "'watch' processes found and killed"
  else
    log.info "no 'watch' processes found"
  fi
}
# *** project-wide (everything except node_modules)
# common.project.generic_remove <DESCRIPTION> <ADV_REGEX>
function common.project.generic_remove() {
  local any_removed
  log.bold "removing $1 files from project..."
  find . -type f -regextype posix-extended -regex "$2" ! -regex "\./node_modules.*" | while read -r file; do
    vex "rm '$file'" && any_removed=true
  done
  [[ -z $any_removed ]] && log.info "no $1 files to remove"
}
function common.project.remove_js_files_with_matching_ts_files() {
  log.bold "removing .js files with matching .ts files from project..."
  python3.8 -c "
from pathlib import Path
here = Path('.')
removed = False
for ts in filter(lambda p:not str(p).startswith('node_modules'),here.glob('**/*/*.ts')):
    if (js:=Path(ts.parent / (ts.stem+'.js'))).is_file():
        removed = True
        print(f'removing {js}')
        js.unlink()
if not removed:
  print('no .js files with matching .ts files to remove')
"
}
function common.verfify_tsc_went_ok() {
  log.title "verifying tsc went ok..."

  if python3 ./scripts/verfify_tsc_went_ok.py; then
    log.good "tsc ok"
    return 0
  else
    log.fatal "bad tsc"
    exit 1
  fi
}
# *** dist
# common.dist.remove_use_strict [-q]
function common.dist.remove_use_strict() {
  log.bold "removing 'use strict;' from dist/**/*.js files"
  find . -type f -regextype posix-extended -regex "\./dist/.*\.js$" ! -regex "\./dist/engine/.*\.js$" | while read -r jsfile; do
    if [[ $1 == "-q" ]]; then
      python3 ./scripts/remove_use_strict.py "$jsfile" -q
    else
      vex "python3 ./scripts/remove_use_strict.py \"$jsfile\""
    fi
  done
  #  if "$tscwatch"; then
  #    check_iwatch_or_die
  #    iwatch -e modify -c 'sleep 0.49 &&  python3 ./scripts/remove_use_strict.py %f' -t '.*\.js$' -r dist &
  #  fi
}
# Called before tsc
function common.dist.remove_all_content_except_engine_and_Salamander() {
  log.title "removing dist/ content except engine/ and Salamander/..."
  if [[ "$1" == -q ]]; then
    function _rm() {
      if [[ -d "$1" ]]; then
        rm -rf "$1" &>/dev/null
      else
        rm "$1" &>/dev/null
      fi
      return $?
    }
  else
    function _rm() {
      if [[ -d "$1" ]]; then
        vex rm -rf "$1"
      else
        vex rm "$1"
      fi
      return $?
    }
  fi
  find -maxdepth 2 -regextype posix-extended -regex "\./dist/.*" \
    ! -regex ".*/engine.*" \
    ! -regex ".*/Salamander" |
    while read -r file_or_dir; do
      if ! _rm "$file_or_dir"; then
        log.fatal "failed"
        return 1
      fi

    done
}
# Called after tsc. Copies all package.json files, *.html files, and experiments dir.
function common.dist.copy_src_content_that_tsc_skips_except_engine_and_Salamander() {
  log.title "copying src/ subdirs to dist/ except engine and Salamander..."
  if [[ "$1" == -q ]]; then
    function _cp() {
      if [[ -d "$1" ]]; then
        cp -r "$1" "$2" &>/dev/null
      else
        cp "$1" "$2" &>/dev/null
      fi
      return $?
    }

  else
    function _cp() {
      if [[ -d "$1" ]]; then
        vex cp -r "$1" "$2"
      else
        vex cp "$1" "$2"
      fi
      return $?
    }
  fi

  find -regextype posix-extended -regex "\./src/.*" \
    ! -regex ".*/engine/.*" \
    ! -regex ".*/Salamander/.*" \
    -a \( -regex ".*/package\.json" -o -regex ".*\.html" -o -regex "^\./src/experiments$" \) |
    while read -r file_or_dir; do
      local without_src_prefix="${file_or_dir:6}"     # ./src/package.json → package.json
      local with_dist_prefix=dist/$without_src_prefix # package.json → dist/package.json
      if ! _cp "$file_or_dir" "$with_dist_prefix"; then # _cp ./src/package.json dist/package.json
        log.fatal "failed"
        return 1
      fi
    done

}
# Called after tsc.
function common.dist.copy_engine_subdirs_from_src() {
  log.title "copying to dist/engine all src/engine/ subdirs except env, egg-info, __pycache__, .idea..."
  find -maxdepth 3 -type d -regextype posix-extended \
    -regex "\./src/engine/.*" \
    ! -regex ".*/env.*" \
    ! -regex ".*__pycache__" \
    ! -regex ".*\.idea" \
    ! -regex ".*egg\-info" |
    while read -r engine_subdir; do
      if [[ "$1" == -q ]]; then
        if ! cp -r "$engine_subdir" ./dist/engine &>/dev/null; then
          log.warn "failed 'cp -r \"$engine_subdir\" ./dist/engine'"
          return 1
        fi
      else
        vex cp -r "$engine_subdir" ./dist/engine || return 1
      fi

    done

}

function common.dist.remove_ts_and_junk_files() {
  log.title "removing .ts and junk files from 'dist/'..."
  if [[ -n "$1" && "$1" == "-q" ]]; then
    #    rm -r dist/**/*__pycache__ &>/dev/null
    #    rm -r dist/**/*pyano2.egg-info &>/dev/null
    rm -r dist/**/*.zip &>/dev/null
    rm -rf dist/engine/mock &>/dev/null
    # * remove dist/**/*.ts files
    find . -type f -regextype posix-extended -regex "\./dist/.*[^.]*\.ts$" | while read -r tsfile; do
      rm "$tsfile" &>/dev/null
    done
  else
    #    vex "rm -r dist/**/*__pycache__"
    #    vex "rm -r dist/**/*pyano2.egg-info"
    vex "rm -r dist/**/*.zip"
    vex "rm -rf dist/engine/mock"
    # * remove dist/**/*.ts files
    find . -type f -regextype posix-extended -regex "\./dist/.*[^.]*\.ts$" | while read -r tsfile; do
      vex "rm $tsfile"
    done
  fi

}
# *** declarations
# common.declarations.fix_d_ts_reference_types [-q]
function common.declarations.fix_d_ts_reference_types() {
  log.bold "fixing '/// <reference types=' in declarations/**/*.d.ts files..."
  find . -type f -regextype posix-extended -regex "\./declarations/.*\.d\.ts$" | while read -r dtsfile; do
    if [[ $1 == "-q" ]]; then
      python3 ./scripts/fix_d_ts_reference_types.py "$dtsfile" -q
    else
      vex "python3 ./scripts/fix_d_ts_reference_types.py \"$dtsfile\""
    fi
  done
  #  if "$tscwatch"; then
  #    echo "\n\nHI!!!!!\n\n"
  #    check_iwatch_or_die
  #    iwatch -e modify -c 'python3 ./scripts/fix_d_ts_reference_types.py %f' -t '.*\.d\.ts$' -r declarations &
  #  fi

}

function common.check_iwatch_or_die() {
  if ! command -v 'iwatch' &>/dev/null; then
    log.fatal "'iwatch' not found. exiting."
    exit 1
  fi
}
function common.vsleep() {
  log.info "sleeping $1 seconds..."
  sleep "$1"
  log.info "done sleeping $1 seconds"

}
