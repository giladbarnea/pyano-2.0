#!/usr/bin/env bash
. src/engine/env/bin/activate
python src/engine/check_create_experiments_folder_structure.py $(pwd) debug
