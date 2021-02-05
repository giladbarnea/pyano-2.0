# pytest -s -c tests/pytest.ini --tb=long --pdbcls=IPython.terminal.debugger:TerminalPdb tests/flow/test__analyze_txt.py
import pickle
from api import analyze_txt


class TestRealWorld:
    def test__1(self):
        with open('/tmp/pyano/analyze_txt/dataobj', mode='r+b') as dataobj_f:
            dataobj = pickle.load(dataobj_f)
        with open('/tmp/pyano/analyze_txt/root', mode='r+b') as root_f:
            root = pickle.load(root_f)
        analyze_txt.main(root, **dataobj)
