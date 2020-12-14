#!/usr/bin/env bash
source ./scripts/log.sh
# *** 'start' completions
_start_completions() {

  local suggestions=($(compgen -W "--clear-logs --auto-edit-log --no-python --debug --dry-run --no-screen-capture --devtools --fullscreen" -- "${COMP_WORDS[1]}"))
  if [ "${#suggestions[@]}" == "1" ]; then
    # if there's only one match, we remove the command literal
    # to proceed with the automatic completion of the number
    local number
    number=$(echo ${suggestions[0]/%\ */})
    COMPREPLY=("$number")
  else
    # more than one suggestions resolved,
    # respond with the suggestions intact
    COMPREPLY=("${suggestions[@]}")
  fi

}
start() {
  ./start.sh "$@"
}
complete -F _start_completions start
log.info "completions.sh | start<tab><tab>"

# *** 'tsc' completions
_tsc_completions() {

  local suggestions=($(compgen -W "--fix_d_ts_reference_types= --remove_use_strict= --watch --help" -- "${COMP_WORDS[1]}"))
  if [ "${#suggestions[@]}" == "1" ]; then
    # if there's only one match, we remove the command literal
    # to proceed with the automatic completion of the number
    local number
    number=$(echo ${suggestions[0]/%\ */})
    COMPREPLY=("$number")
  else
    # more than one suggestions resolved,
    # respond with the suggestions intact
    COMPREPLY=("${suggestions[@]}")
  fi

}

tsc() {
  ./scripts/tsc.sh "$@"
}
complete -F _tsc_completions tsc
log.info "completions.sh | tsc<tab><tab>"

# *** patches
# ** npm
ORIG_NPM=$(where npm)
function npm() {
  if [[ "$1" == "install" || "$1" == "i" ]]; then

    if ! confirm "Did you backup all modified files in node_modules?"; then
      echo "aborting"
      return 1
    fi
  fi
  set -x
  local exitcode
  $ORIG_NPM "$@"
  exitcode=$?
  set +x
  return $exitcode
}
log.info "patched npm"

# ** gd
ORIG_GD=$(alias_value gd)
unalias gd
function gd() {
  if [[ -z "$1" ]]; then
    set -x
    eval "$ORIG_GD -- ':!*.js' ':!*.d.ts' ':!*package-lock.json'"
    set +x
    return $?
  else
    set -x
    local exitcode
    eval "$ORIG_GD ${*}"
    exitcode=$?
    set +x
    return $exitcode
  fi
}
log.info "patched gd"
