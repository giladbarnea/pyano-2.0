#/usr/bin/env bash
_start_completions() {

  local suggestions=($(compgen -W "--clear-logs --auto-edit-log --no-python --debug --dry-run --no-screen-capture --devtools" -- "${COMP_WORDS[1]}"))
  if [ "${#suggestions[@]}" == "1" ]; then
    # if there's only one match, we remove the command literal
    # to proceed with the automatic completion of the number
    local number=$(echo ${suggestions[0]/%\ */})
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
echo "_start_completions.sh | start<tab><tab>"

ORIG_NPM=$(where npm)
function npm() {
  source /home/gilad/Code/bashscripts/util.sh
  if [[ "$1" == "install" ]]; then
    if ! confirm "Did you backup all modified files in node_modules?"; then
      echo "aborting"
      return 1
    fi
    echo "running $ORIG_NPM \"\$@\"..."
    $ORIG_NPM "$@"
    return $?
  fi
}
