#!/usr/bin/env python3.8
import sys
import os
from pathlib import Path
import re


def main():
    os.system('rm -rf src/bhe/__tmp')
    os.system('git clone https://github.com/giladbarnea/betterhtmlelement.git src/bhe/__tmp')
    bhe = ["// @ts-nocheck\n"]
    
    with open('src/bhe/__tmp/src/typings.ts') as typings, \
            open('src/bhe/__tmp/src/util.ts') as util, \
            open('src/bhe/__tmp/src/exceptions.ts') as exceptions, \
            open('src/bhe/__tmp/src/index.ts') as index:
        
        bhe.extend(["///////////////////////////////////\n",
                    "// *** Typing\n",
                    "///////////////////////////////////\n",
                    *typings.readlines()
                    ])
        
        bhe.extend(["///////////////////////////////////\n",
                    "// *** Util\n",
                    "///////////////////////////////////\n",
                    *util.readlines()
                    ])
        
        bhe.extend(["///////////////////////////////////\n",
                    "// *** Exceptions\n",
                    "///////////////////////////////////\n",
                    *exceptions.readlines()
                    ])
        bhe.extend(["///////////////////////////////////\n",
                    "// *** Main Content\n",
                    "///////////////////////////////////\n",
                    *index.readlines()
                    ])
    for i, line in enumerate(bhe):
        count = 0
        if line.startswith('class ') \
                or line.startswith('function ') \
                or re.match(r'^type (Tag\b|QuerySelector|ChildrenObj|Element2Tag|Enumerated)', line):
            count += 1
            bhe[i] = f'export {line}'
        print(f'Modified {count} lines to start with "export"')
    with open('src/bhe/index.ts', mode='w') as realindex:
        realindex.write(''.join(bhe))
    os.system('rm -rf src/bhe/__tmp')


if __name__ == '__main__':
    if not Path('./src').is_dir():
        sys.exit(f"no immediate ./src dir. {os.getcwd() = }")
    main()
