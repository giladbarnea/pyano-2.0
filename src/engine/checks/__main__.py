print('checks __main__.py')
from . import dirs

dirs.experiments.check_and_fix()
from .config import main as config_main

config_main.main()
