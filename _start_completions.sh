#!/usr/bin/env bash
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
source ./scripts/log.sh
log.info "_start_completions.sh | start<tab><tab>"

ORIG_NPM=$(where npm)
function npm() {
  if [[ "$1" == "install" || "$1" == "i" ]]; then

    if ! confirm "Did you backup all modified files in node_modules?"; then
      echo "aborting"
      return 1
    fi
  fi
  log.info "running $ORIG_NPM \"${*}\"..."
  $ORIG_NPM "$@"
  return $?
}
log.info "patched npm to confirm before install"

ORIG_GD=$(where gd)
function gd() {
  if [[ -z "$1" ]]; then
    log.info "running $ORIG_GD -- ':!*.js' ':!*.d.ts'"
    $ORIG_GD -- ':!*.js' ':!*.d.ts'
    return $?
  else
    log.info "running $ORIG_GD \"${*}\"..."
    $ORIG_GD "$@"
    return $?
  fi
}
log.info "patched gd to exclude js and d.ts files by default when no args are passed"
