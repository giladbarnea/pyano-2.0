# Install Pyano
## Enable viewing hidden files on Windows Explorer
Main Explorer menu => view => check both "Hidden items" and "File name extensions"

## Install VSCode
https://code.visualstudio.com/download

## git
### Install
https://gitforwindows.org/    
When asked, select "Use visual studio code as git's default editor"

Otherwise, "next".
### Set config
    git config --global user.email "idotavorslab@gmail.com"
    git config --global user.name "ITLab"
    
## Install nvm
https://github.com/coreybutler/nvm-windows/releases

Check if installed: run
    
    nvm -v

Should see 

    Running version <whatever>


## Install node.js

    nvm install 12.13.0
    # Check if installed correctly:
    nvm list    # Should display 12.13.0

## Install python 3.7.6
https://www.python.org/downloads/release/python-376/

(specifically for windowsx64bit: https://www.python.org/ftp/python/3.7.6/python-3.7.6-amd64.exe)
    
    Add python to PATH
    Customize installation -> Check everything then Next -> Check everything -> Install
    
## 2. Clone Pyano
    cd <whereever>
    git clone https://github.com/giladbarnea/pyano-2.0.git
    cd pyano-2.0

## 3. Set local node version
From within root folder,
    
    nvm use 12.13.0
Should see "Now using node 12.13.0".

Check versions:

    node -v
Should see 12.13.0.

    npm -v
Should see something.

## Install Pyano
From within root folder:

    npm install

## Install Python (3.7.x)
https://www.python.org/downloads/release/python-375/

Make sure to check "Add python to PATH" at the beginning

Press "Disable path length limit" at the end

Run:

    python
Should see "Python 3.7..."

To exit press Ctrl+Z then Enter.

## Install virtualenv
    pip install virtualenv

Check if installed correctly:
    
    virtualenv -v

## Install the correct Pyano's python virtual environment
### Check requirements.txt
From within PYANO root folder,
    
    code .
This will launch VSCode on PYANO's dir.

Go to /src/engine, and edit `requirements.txt`. A line that starts with -e should have the correct path. For example, if PYANO is installed in 

    C:\Puppies\PYANO
Then `requirements.txt` should have a line that says: 
    
    -e "C:\Puppies\PYANO\src\engine"


### Create virtualenv
From within PYANO root folder,

    cd src/engine
    virtualenv env
    
May take a while, then:

    env\scripts\activate
Check if ok:

    pip list
Should only see `pip`, `setuptools`, and `wheel`. Also, notice your shell starting with `(env)`.

## Install requirements
    pip install -r requirements.txt
May take a while, then:

    pip list
Should see a new list of packages, including `pyano`.
## Install ffmpeg




