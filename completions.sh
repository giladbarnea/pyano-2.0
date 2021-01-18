#!/usr/bin/env bash
# ** This script is sourced on cd
source ./scripts/common.sh # has pyano-specific fns, for playing in terminal if needed. doesn't matter when calling e.g. ./scripts/tsc.sh
# shellcheck source=/home/gilad/Code/bashscripts/npm.sh
source "$SCRIPTS"/npm.sh
# *** 'start' completions
_start_completions() {

  local suggestions=($(compgen -W "--clear-logs --edit-log --edit-big-conf --no-python --debug --dry-run --no-screen-capture --no-screenshots-on-error --no-swal-on-error --no-console-log-to-file --devtools --fullscreen" -- "${COMP_WORDS[1]}"))
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

  local suggestions=($(compgen -W "--fix_d_ts_reference_types=false --remove_use_strict=false --watch --only_clean --no_pre_clean --help" -- "${COMP_WORDS[1]}"))
  if [ "${#suggestions[@]}" == "1" ]; then
    # if there's only one match, we remove the command literal
    # to proceed with the automatic completion of the number
    local number
    number="$(echo ${suggestions[0]/%\ */})"
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
## ** npm
if command -v nvm &>/dev/null; then
  nvm use 15.4.0
#  ORIG_NPM=$(dirname "$(nvm which current)")/npm
#else
#  ORIG_NPM=$(where npm)
fi
#function npm() {
#  if [[ "$1" == "install" || "$1" == "i" ]]; then
#
#    if ! confirm "Did you backup all modified files in node_modules?"; then
#      echo "aborting"
#      return 1
#    fi
#  fi
#  local exitcode
#  set -x
#  $ORIG_NPM "$@"
#  exitcode=$?
#  set +x
#  return $exitcode
#}
#log.info "patched npm"

# ** gd
alias gd="gd -- ':!*.js' ':!*.d.ts' ':!*package-lock.json'"
#ORIG_GD=$gd
#function gd() {
#  if [[ -z "$1" ]]; then
#    set -x
#    eval "$ORIG_GD -- ':!*.js' ':!*.d.ts' ':!*package-lock.json'"
#    set +x
#    return $?
#  else
#    local exitcode
#    set -x
#    eval "$ORIG_GD ${*}"
#    exitcode=$?
#    set +x
#    return $exitcode
#  fi
#}
log.info "patched gd"
alias jest=./node_modules/.bin/jest
log.info "jest alias"
