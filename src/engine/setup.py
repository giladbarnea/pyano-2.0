from setuptools import setup

# python setup.py develop OR (better):
# (env) cd src/engine && pip install -e .

# for birdseye:
# pip install -e /home/gilad/Code/birdseye/
setup(name='pyano2',
      version='1.0.5',
      description='A description for pyano-2.0',
      author='Gilad Barnea',
      author_email='giladbrn@gmail.com',
      url='https://www.google.com',
      packages=['api', 'common', 'checks'],

      )
