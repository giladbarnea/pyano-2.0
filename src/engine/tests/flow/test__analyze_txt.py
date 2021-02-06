# pytest -s -c tests/pytest.ini --tb=long --pdbcls=IPython.terminal.debugger:TerminalPdb tests/flow/test__analyze_txt.py
import pickle
from api import analyze_txt
from pathlib import Path

class TestRealWorld:
    def test__1(self):
        with open('./tests/flow/dataobj', mode='r+b') as dataobj_f:
            dataobj = pickle.load(dataobj_f)
        # with open('./tests/flow/root', mode='r+b') as root_f:
        #     root = pickle.load(root_f)

        root = '/Volumes/home/pyano-2.0'

        analyze_txt.main(root, **dataobj)


