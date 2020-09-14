#!/usr/bin/env bash
#args="via-node-nopython log"
#echo "running npm run $args ${*}"
POSITIONAL=()
while [[ $# -gt 0 ]]; do
  case "$1" in
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
node --experimental-modules --es-module-specifier-resolution=node --enable-source-maps ./node_modules/.bin/electron . no-python "$@"
set -
