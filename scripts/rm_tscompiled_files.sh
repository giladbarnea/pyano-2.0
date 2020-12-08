#!/usr/bin/env bash
source ./scripts/log.sh
log.title "removing ts-compiled files..."
vex 'rm -rf declarations' || exit 1
vex 'rm -rf dist' || exit 1
function _remove() {
  local any_removed
  log.title "removing $1 files from project..."
  find . -type f -regextype posix-extended -regex "$2" ! -regex "\./node_modules.*" | while read -r file; do
    vex "rm '$file'" && any_removed=true
  done
  [[ -z $any_removed ]] && log.info "no $1 files to remove"
}
_remove ".js.map" ".*[^.]*\.js\.map"
#log.title "removing .js.map files from project..."
#
#find . -type f -regextype posix-extended -regex ".*[^.]*\.js\.map" ! -regex "\./node_modules.*" | while read -r jsmapfile; do
#  vex "rm '$jsmapfile'" && any_jsmap_removed=true
#done
#[[ -z $any_jsmap_removed ]] && log.info "no .js.map files to remove"

_remove ".d.ts" ".*[^.]*\.d\.ts"

#log.title "removing .d.ts files from project..."
#find . -type f -regextype posix-extended -regex ".*[^.]*\.d\.ts" ! -regex "\./node_modules.*" | while read -r dtsfile; do
#  if rm "$dtsfile"; then
#    any_dts_removed=true
#    log.info "removed '$dtsfile' successfully"
#  else
#    log.warn "failed removing '$dtsfile'"
#  fi
#done
#[[ -z $any_dts_removed ]] && log.info "no .d.ts files to remove"

_remove ".d.ts.map" ".*[^.]*\.d\.ts.map"

#log.title "removing .d.ts.map files from project..."
#find . -type f -regextype posix-extended -regex ".*[^.]*\.d\.ts.map" ! -regex "\./node_modules.*" | while read -r dtsmapfile; do
#  if rm "$dtsmapfile"; then
#    any_dtsmap_removed=true
#    log.info "removed '$dtsmapfile' successfully"
#  else
#    log.warn "failed removing '$dtsmapfile'"
#  fi
#done
#[[ -z $any_dtsmap_removed ]] && log.info "no .d.ts.map files to remove"

log.title "removing .js files with matching .ts files from project..."
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
