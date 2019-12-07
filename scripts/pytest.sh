#!/usr/bin/env bash
pytest tests/python -l -vv -rA --tb=native --maxfail=1 -k create_tempo_shifted
#python tests/python/test_Message.py $(pwd) ${@}
#pytest tests/python/test_Message.py -l -v -rA --tb=native --maxfail=1 | grep -P -C 5 ",\sline\s\d+"
