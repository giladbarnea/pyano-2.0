#!/usr/bin/env bash

POSITIONAL=()
while [[ $# -gt 0 ]]; do
  case "$1" in
  -h | *help)
    echo "
start.sh [FLAG]...

Available args:
  --clear-logs              flag. deletes all contents of /errors dir
  --devtools                flag. opens DevTools on startup
  --edit-big-conf[=EDITOR]  opens big config file (e.g ~/.config/pyano-2.0/config.json) with EDITOR. defaults to vscode
  --edit-log                flag. opens current session's log file with vscode
  --fullscreen              flag. window's maximized. Otherwise it's 75% screen, or 1500x750 (the greater)
  --no-console-log-to-file  flag. disables automatic writing of console messages to log file.
  --no-screen-capture       flag.
  --no-screenshots-on-error   flag. disables automatic screenshot on uncaught errors.
  --no-swal-on-error        flag. disables automatic swal on uncaught errors.
  --debug                   flag. not sure what it does
  --dry-run                 flag. incomplete
  --no-python               flag.
    "
    exit 0
    ;;
  --clear-logs)
    python3 ./scripts/empty_errors_dir.py
    shift
    ;;
  *)
    POSITIONAL+=("$1")
    shift
    ;;
  esac
done
set -- "${POSITIONAL[@]}" # restore positional params

set -x
# https://www.electronjs.org/docs/api/environment-variables#electron_enable_logging
export ELECTRON_ENABLE_LOGGING=true       # equiv to --enable-logging
export ELECTRON_ENABLE_STACK_DUMPING=true # wont work if the crashReporter is started.
node --experimental-modules --es-module-specifier-resolution=node --enable-source-maps ./node_modules/.bin/electron . "$@"
#node --experimental-modules --es-module-specifier-resolution=node ./node_modules/.bin/electron . --no-python "$@"
set -
