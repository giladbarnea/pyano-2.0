from setuptools import setup

# python setup.py develop OR (better):
# (env) cd src/engine && pip install -e .
setup(name='pyano2',
      version='1.0.4',
      description='A description for Pyano',
      author='Gilad Barnea',
      author_email='giladbrn@gmail.com',
      url='https://www.google.com',
      packages=['txt', 'common', 'checks'],

      )
