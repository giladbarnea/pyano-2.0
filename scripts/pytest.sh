#!/usr/bin/env bash
pytest tests/python -l -vv -rA --tb=native
#python tests/python/test_Message.py $(pwd) ${@}
