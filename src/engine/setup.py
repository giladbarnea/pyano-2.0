from setuptools import setup

# python setup.py develop OR (BETTER):
# ./dist/engine/env/bin/python -m pip install -e ./dist/engine

# for birdseye:
# pip install -e /home/gilad/Code/birdseye/
setup(name='pyano2',
      version='2021.1.18',
      description='A description for pyano-2.0',
      author='Gilad Barnea',
      author_email='giladbrn@gmail.com',
      url='https://www.google.com',
      packages=['api', 'common', 'checks'],
      install_requires=[
          # 'birdseye @ file:///home/gilad/Code/birdseye#egg=birdseye'
          # 'pygments',
          'cheap_repr',
          'more_termcolor',
          'more-itertools',
          # 'logbook'
          ],
      extras_require={
          'dev': [
              'pytest',
              # 'ipdb',
              'IPython',
              'rich'
              ]
          }
      )
