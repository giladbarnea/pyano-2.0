#!/usr/bin/env bash

POSITIONAL=()
while [[ $# -gt 0 ]]; do
  case "$1" in
  -h | --help)
    echo "
start.sh [FLAG]...

Available args:
  --clear-logs          flag. deletes all contents of /errors dir
  --auto-edit-log       flag. opens current session's log file with vscode
  --no-python           flag. on by default
  --debug               flag. not sure what it does
  --dry-run             flag. incomplete
  --no-screen-capture   flag.
  --devtools            flag. opens DevTools on startup
  --fullscreen          flag. window's maximized. Otherwise it's half screen dimensions, or 1500x750 (the greater)
    "
    exit 0
    ;;
  --clear-logs)
    python3 ./scripts/empty_errors_dir.py
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

set -x
node --experimental-modules --es-module-specifier-resolution=node --enable-source-maps ./node_modules/.bin/electron . --no-python "$@"
set -
