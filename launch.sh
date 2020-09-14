#!/usr/bin/env bash
#args="via-node-nopython log"
#echo "running npm run $args ${*}"
POSITIONAL=()
while [[ $# -gt 0 ]]; do
  case "$1" in
  --clear-logs)
    python3 -c "
from pathlib import Path
def main():
    subdirs = list(Path('.').glob('errors/*'))
    if not subdirs:
        print('no dirs in errors/, not removing anything')
        return
    prompt = (f'Really remove all {len(subdirs)} session dirs in \"errors\"?\n'
    f'First one is \"{subdirs[0]}\", last one is \"{subdirs[-1]}\"\n'
    'y/n:\t'
    )
    if input(prompt).lower() != 'y':
        print('not removing')
        return

    try:
        import subprocess as sp
        if sp.call('rm -rf errors/*', stdout=sp.PIPE, stderr=sp.PIPE, shell=True):
            print('\n\t!\tFAILED \"rm -rf errors/*\"!\n')
        else:
            print('\nsuccess removing errors/*\n')
    except Exception as e:
        print('\n\t!\tFAILED \"rm -rf errors/*\"!\n',e.__class__,e)

if __name__ == '__main__':
    main()
    "

    shift # shift once since flags have no values
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
