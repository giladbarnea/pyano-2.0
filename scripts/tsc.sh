#!/usr/bin/env bash
source ./scripts/common.sh
common.source_whatevers_available
if ! common.is_in_proj_root; then
  log.fatal "PWD: $PWD. NOT PROJECT ROOT. ABORTING"
  exit 1
fi
tscwatch=false
remove_use_strict=false
fix_d_ts_reference_types=false
only_clean=false
no_pre_clean=false
_help="
tsc.sh [--watch (false)] [--remove_use_strict=BOOL (false)] [--fix_d_ts_reference_types=BOOL (false)]

  --watch                                  flag. passes --watch to tsc. on if script is tscw.sh
  --only_clean                             flag. do the pre-compile cleaning across project and exit before tsc
  --no_pre_clean                           flag. skip the pre-compile cleaning of project and jump straight to tsc
  --remove_use_strict=true|false           false by default
  --fix_d_ts_reference_types=true|false    false by default
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
  --only_clean)
    only_clean=true
    log.info "set only_clean=true"
    shift
    ;;
  --no_pre_clean)
    no_pre_clean=true
    log.info "set no_pre_clean=true"
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
log.title "tsc.sh: tscwatch=$tscwatch | remove_use_strict=$remove_use_strict | fix_d_ts_reference_types=$fix_d_ts_reference_types | only_clean=$only_clean | no_pre_clean=$no_pre_clean"

common.kill_tsc_procs
common.kill_watch_procs

if [[ $no_pre_clean == false ]]; then
  # *** Remove ts-compiled files (declarations/, dist/, .ts, .d.ts, .js.map, d.ts.map
  log.title "removing ts-compiled files..."
  vex 'rm -rf declarations' || exit 1
  common.dist.remove_all_dirs_except_engine_and_Salamander || exit 1

  #  vex 'rm -rf dist' || exit 1

  common.project.generic_remove ".js.map" ".*[^.]*\.js\.map"

  common.project.generic_remove ".d.ts" ".*[^.]*\.d\.ts"

  common.project.generic_remove ".d.ts.map" ".*[^.]*\.d\.ts.map"

  common.project.remove_js_files_with_matching_ts_files
fi

if [[ $only_clean == "true" ]]; then
  log.good "only_clean is true, exiting"
  exit 0
fi

# *** tsc compile
log.title "running tsc..."
if [[ "$tscwatch" == true ]]; then
  ./node_modules/typescript/bin/tsc -p . &>/dev/null &
  wait $!
else
  ./node_modules/typescript/bin/tsc -p . &
  wait $!
fi

common.verfify_tsc_went_ok || exit 1

# *** populate dist/ dir
log.bold "populating dist/ dir..."
# * create dist/ if not exist
if [[ ! -e ./dist ]]; then
  if mkdir dist; then
    log.warn "'dist' dir did not exist, created it"
  else
    log.fatal "'dist' dir did not exist and failed creating it"
    exit 1
  fi
fi
# * copy all src/ contents into dist/
common.dist.copy_src_subdirs_except_engine_and_Salamander || exit 1
common.dist.copy_engine_subdirs_from_src || exit 1
#if cp -r ./src/* ./dist; then
#  log.good "copied all files from src into dist, now removing .ts and junk files from dist/..."
#else
#  log.fatal "failed copying all files in src into dist"
#  exit 1
#fi

# * remove dist/**/*.ts files, python cache and .zip
common.dist.remove_ts_and_junk_files

log.good "finished popuplating dist/ dir"

if [[ "$tscwatch" == true ]]; then

  # tsc sometimes takes 6-7~ seconds
  log.bold "running tsc --watch, then sleeping 10 seconds..."
  ./node_modules/typescript/bin/tsc -p . --watch &
  common.vsleep 10

  log.bold "starting 'while true' sleep 90 interval"
  while true; do

    common.dist.remove_ts_and_junk_files -q
    if [[ "$remove_use_strict" == true ]]; then
      common.dist.remove_use_strict -q
    fi
    if [[ "$fix_d_ts_reference_types" == true ]]; then
      common.declarations.fix_d_ts_reference_types -q
    fi
    common.vsleep 90
  done

else

  if [[ "$remove_use_strict" == true ]]; then
    common.dist.remove_use_strict
  else
    log.warn "remove_use_strict is $remove_use_strict, not modifying js files"
  fi
  if [[ "$fix_d_ts_reference_types" == true ]]; then
    common.declarations.fix_d_ts_reference_types
  else
    log.warn "fix_d_ts_reference_types is $fix_d_ts_reference_types, not modifying d.ts files"
  fi
fi
