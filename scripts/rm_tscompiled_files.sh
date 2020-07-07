#!/usr/bin/env zsh
rm -rf declarations
source $HOME/.extra.sh
printf "removing ts-compiled files...:\n-----------------------------\n\n"
jsmap_files=$(sudo find . -type f -regextype posix-extended -regex ".*[^.]*\.js\.map" ! -regex "\./node_modules.*")
printf ".js.map files:\n"
echo "$jsmap_files" | pyp 'lines'
if [ -n "$jsmap_files" ]; then
  sudo find . -type f -regextype posix-extended -regex ".*[^.]*\.js\.map" ! -regex "\./node_modules.*" -exec rm "{}" ";"
else
  printf "(nothing to remove)\n"
fi

dts_files=$(sudo find . -type f -regextype posix-extended -regex ".*[^.]*\.d\.ts" ! -regex "\./node_modules.*")
printf "\n.d.ts files:\n"
echo "$dts_files" | pyp 'lines'
if [ -n "$dts_files" ]; then
  sudo find . -type f -regextype posix-extended -regex ".*[^.]*\.d\.ts" ! -regex "\./node_modules.*" -exec rm "{}" ";"
else
  printf "(nothing to remove)\n"
fi

dts_map_files=$(sudo find . -type f -regextype posix-extended -regex ".*[^.]*\.d\.ts.map" ! -regex "\./node_modules.*")
printf "\n.d.ts.map files:\n"
echo "$dts_map_files" | pyp 'lines'
if [ -n "$dts_map_files" ]; then
  sudo find . -type f -regextype posix-extended -regex ".*[^.]*\.d\.ts.map" ! -regex "\./node_modules.*" -exec rm "{}" ";"
else
  printf "(nothing to remove)\n"
fi
printf "\nremoving .js files with matching .ts files...:\n"
python3.8 -c "
from pathlib import Path
here = Path('.')
for ts in filter(lambda p:not str(p).startswith('node_modules'),here.glob('**/*/*.ts')):
    if (js:=Path(ts.parent / (ts.stem+'.js'))).is_file():
        print(f'removing {js}')
        js.unlink()
"
