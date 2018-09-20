# VSCode Haskutil
[![Build Status](https://travis-ci.org/EduardSergeev/vscode-haskutil.svg?branch=master)](https://travis-ci.org/EduardSergeev/vscode-haskutil)

'QuickFix' actions for Haskell editor  
Available at [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=Edka.haskutil)

## Installation
This extension uses diagnostics (errors and warnings) from `PROBLEMS` window which is populated by other Haskell extension such as [Simple GHC](https://marketplace.visualstudio.com/items?itemName=dramforever.vscode-ghc-simple) or [Haskero](https://marketplace.visualstudio.com/items?itemName=Vans.haskero). Please install either of them along with this extension.

## Features

### Add missing import  
![Add missing import](/images/AddImport_sm.gif "Add missing import")  
Uses [Hoogle](https://www.haskell.org/hoogle/) to search for matching modules. Configurable via  [hoogle-vscode](https://marketplace.visualstudio.com/items?itemName=jcanero.hoogle-vscode) extension configuration (can be configured to use local instance of hoogle for example).


### Organize imports  
![Sort imports](/images/OrganizeImports_sm.gif "Sort imports")  
Sorting and alignment is configurable via `haskutil.sortImports` and `haskutil.alignImports` respectively. Imports can also be organized on file save with `haskutil.organiseImportsOnSave = true` (dafault is `false`). 


### Add LANGUAGE extension  
![Add extension](/images/AddExtension_sm.gif "Add extension")  
Adds `LANGUAGE` pragma suggested by error. List of supported pragmas is defined by `haskutil.supportedExtensions`.

### Add top-level signature
![Add top-level signature](  /images/AddSignature_sm.gif "Add top-level signature")  
Adds signature suggested by warning.

## Dependencies

 * Automatic dependency (auto install) [hoogle-vscode](https://marketplace.visualstudio.com/items?itemName=jcanero.hoogle-vscode)
