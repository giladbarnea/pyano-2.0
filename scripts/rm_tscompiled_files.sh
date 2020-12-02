#!/usr/bin/env zsh
printf "\nremoving ts-compiled files...\n-----------------------------\n\n"
rm -rf declarations
rm -rf dist
printf "removed declarations and dist dirs\n"
# source $HOME/.extra.sh
jsmap_files=$(find . -type f -regextype posix-extended -regex ".*[^.]*\.js\.map" ! -regex "\./node_modules.*")
printf ".js.map files:\n"
if [ -n "$jsmap_files" ]; then
  echo "$jsmap_files" | pyp 'lines'
  if find . -type f -regextype posix-extended -regex ".*[^.]*\.js\.map" ! -regex "\./node_modules.*" -exec rm "{}" ";"; then
    echo "removed .js.map files successfully"
  else
    echo "\nFATAL: failed removing .js.map files. exit 1"
    exit 1
  fi
else
  printf "no .js.map files to remove\n"
fi

dts_files=$(find . -type f -regextype posix-extended -regex ".*[^.]*\.d\.ts" ! -regex "\./node_modules.*")
printf "\n.d.ts files:\n"
if [ -n "$dts_files" ]; then
  echo "$dts_files" | pyp 'lines'
  if find . -type f -regextype posix-extended -regex ".*[^.]*\.d\.ts" ! -regex "\./node_modules.*" -exec rm "{}" ";"; then
    echo "removed .d.ts files successfully"
  else
    echo "\nFATAL: failed removing .d.ts files. exit 1"
    exit 1
  fi
else
  printf "no .d.ts files to remove\n"
fi

dts_map_files=$(find . -type f -regextype posix-extended -regex ".*[^.]*\.d\.ts.map" ! -regex "\./node_modules.*")
printf "\n.d.ts.map files:\n"
if [ -n "$dts_map_files" ]; then
  echo "$dts_map_files" | pyp 'lines'
  if find . -type f -regextype posix-extended -regex ".*[^.]*\.d\.ts.map" ! -regex "\./node_modules.*" -exec rm "{}" ";"; then
    echo "removed .d.ts.map files successfully"
  else
    echo "\nFATAL: failed removing .d.ts.map files. exit 1"
    exit 1
  fi
else
  printf "no d.ts.map files to remove\n"
fi
printf "\nremoving .js files with matching .ts files...\n"
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
