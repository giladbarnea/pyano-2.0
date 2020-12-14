#!/usr/bin/env bash
source ./scripts/log.sh
source ./scripts/common.sh
log.bold "removing ts-compiled files..."
vex 'rm -rf declarations' || exit 1
vex 'rm -rf dist' || exit 1
function _remove() {
  local any_removed
  log.bold "removing $1 files from project..."
  find . -type f -regextype posix-extended -regex "$2" ! -regex "\./node_modules.*" | while read -r file; do
    vex "rm '$file'" && any_removed=true
  done
  [[ -z $any_removed ]] && log.info "no $1 files to remove"
}
_remove ".js.map" ".*[^.]*\.js\.map"

_remove ".d.ts" ".*[^.]*\.d\.ts"

_remove ".d.ts.map" ".*[^.]*\.d\.ts.map"

log.bold "removing .js files with matching .ts files from project..."
python3.8 -c "
from pathlib import Path
here = Path('.')
removed = False
for ts in filter(lambda p:not str(p).startswith('node_modules'),here.glob('**/*/*.ts')):
    if (js:=Path(ts.parent / (ts.stem+'.js'))).is_file():
        removed = True
        print(f'removing {js}')
        js.unlink()
if not removed:
  print('no .js files with matching .ts files to remove')
"
