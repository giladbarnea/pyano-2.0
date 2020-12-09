#!/usr/bin/env bash
# *** THIS FILE SHOULD NOT IMPORT util.sh, or anything really
if [[ -n "$BASH_LOG_WRITES_TO_FILE" && "$BASH_LOG_WRITES_TO_FILE" =~ (true|True|TRUE) ]]; then
  echo '$BASH_LOG_WRITES_TO_FILE is truthy, util.sh_log() is defined' >&2
  function _log() {
    printf "%b\n" "$1" >>/tmp/LOG.log
  }
else
  function _log() {
    :
  }
fi

function backtrace() {
  # this only works when running files, i.e. ./__tmp.sh, not 'findgrep ...'
  local deptn=${#FUNCNAME[@]}
  for ((i = 1; i < $deptn; i++)); do
    local func="${FUNCNAME[$i]}"
    local line="${BASH_LINENO[$((i - 1))]}"
    local src="${BASH_SOURCE[$((i))]}"
    printf '%*s' $i '' # indent
    echo "at $i: $func(), $src, line $line"
  done
}
function vex() {
  local description
  local cmd
  if [[ -z "$2" ]]; then
    description="'$1'"
    cmd="$1"
  else
    description="$1"
    cmd="${@:2}"
  fi

  if eval "$cmd"; then
    log.info "$description: success"
    return 0
  else
    log.warn "$description: fail"
    return 1
  fi
}
function log() {
  # example: log "launch(${*})"

  # so external scripts can source 'log.sh':
  if [[ -z "$h3" ]]; then
    if [[ -e /home/gilad/Code/bashscripts/colors.sh ]]; then
      source /home/gilad/Code/bashscripts/colors.sh
    else
      export c_0="\033[0m"
      export c_b="\033[1m"
      export c_d="\033[2m"

      export c_white="\033[37m"
      export c_red="\033[31m"
      export c_green="\033[32m"
      export c_yellow="\033[33m"

      export c_br_black='\033[90m' # darker than c_d
      export c_br_white='\033[97m'

      export h2=$c_br_white
      export h3=$c_b$c_white
      export h4=$c_white
    fi
  fi

  local _help
  _help="
${h3}Usage${c_0}
  log <arg>
  log[.<level>] <arg>

  ${h4}levels:${c_0}
  info, good, warn, fatal, debug

${h3}Description${c_0}
  Echos <arg> to stderr, and calls ${h4}_log \"\$1\"${c_0}.
  ${h4}_log${c_0} might be a noop depending on BASH_LOG_WRITES_TO_FILE env var
"
  if [[ "$1" == "-h" || "$1" == "--help" ]]; then
    echo "$_help"
    return 0
  fi

  local caller_fn
  caller_fn=$(echo $funcstack | rev | cut -d ' ' -f 1 | rev)

  # sometimes echo doesn't work (git-fuzzy)
  if [[ -n "$caller_fn" ]]; then
    printf "${c_br_black}[$caller_fn()]${c_0}$1\n" >&2
  else
    printf "$1\n" >&2
  fi
  _log "$1"
}
function log.debug() {
  log "${c_br_black}[DEBUG]${c_0} ${c_d}$1${c_0}"
}
function log.info() {
  log "${c_br_black}[INFO]${c_0}  $1"
}
function log.good() {
  log "${c_br_black}[GOOD]${c_0}  ${c_green}$1${c_0}"
}
function log.title() {
  log "${c_br_black}[TITLE]${c_0} ${h2}$1${c_0}"
}
function log.warn() {
  log "${c_br_black}[WARN]${c_0}  ${c_yellow}$1${c_0}"
}
function log.fatal() {
  log "${c_br_black}[FATAL]${c_0} ${c_red}$1${c_0}"
}

function log.prompt() {
  log "${c_br_black}[PROMPT]${c_0} ${h4}$1${c_0}"
}

function input() {
  if [[ "$1" == "-h" || "$1" == "--help" ]]; then
    echo 'answer=$(input "best icecream: ")'
    return 0
  fi

  log.prompt "$1"
  local user_input
  read -r user_input
  echo "$user_input"
}

function confirm() {
  # if confirm 'are you sure?'; then echo "yay"; else echo "nay"; fi
  log.prompt "$1"
  local user_input
  read -rs user_input
  if [[ "$user_input" == y || "$user_input" == Y || "$user_input" == yes ]]; then
    return 0
  else
    return 1
  fi
}