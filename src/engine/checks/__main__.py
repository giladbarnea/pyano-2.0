print('checks __main__.py')
from . import dirs

dirs.experiments.check_and_fix()
from .config import main as configmain

configmain.main()
