# VSCode Haskutil
[![Build Status](https://travis-ci.org/EduardSergeev/vscode-haskutil.svg?branch=master)](https://travis-ci.org/EduardSergeev/vscode-haskutil)
[![vscode-ghc-simple on Visual Studio Marketplace](https://img.shields.io/vscode-marketplace/v/edka.haskutil.svg)](https://marketplace.visualstudio.com/items?itemName=Edka.haskutil)


'QuickFix' actions for Haskell editor  


## Requirements
This extension uses diagnostics (errors and warnings) from `PROBLEMS` tab which is populated by other Haskell extensions such as [Simple GHC](https://marketplace.visualstudio.com/items?itemName=dramforever.vscode-ghc-simple), [Haskero](https://marketplace.visualstudio.com/items?itemName=Vans.haskero) or [ghcid](https://marketplace.visualstudio.com/items?itemName=ndmitchell.haskell-ghcid). Please install one of them along with this extension.

## Features
 * [Add missing import](#add-missing-import)
 * [Organize imports](#organize-imports)
 * [Add missing LANGUAGE extension](#add-missing-language-extension)
 * [Organize LANGUAGE extensions](#organize-language-extensions)
 * [Add top-level signature](#add-top-level-signature)
 * [Fill typed hole](#fill-typed-hole)

Individual features can be turned on and off via `haskutil.feature.[feature]` flags

### Add missing import  
![Add missing import](/images/AddImport_sm.gif "Add missing import")  
Uses [Hoogle](https://www.haskell.org/hoogle/) to search for matching modules. Configurable via  [hoogle-vscode](https://marketplace.visualstudio.com/items?itemName=jcanero.hoogle-vscode) extension configuration (can be configured to use local instance of hoogle for example).

### Organize imports  
![Organize imports](/images/OrganizeImports_sm.gif "Organize imports")  
Sorting and alignment are configurable via `haskutil.sortImports` and `haskutil.alignImports` respectively. Imports can also be organized on file save with `haskutil.organiseImportsOnSave: true` (dafault is `false`). 

### Add missing LANGUAGE extension  
![Add extension](/images/AddExtension_sm.gif "Add extension")  
Adds `LANGUAGE` pragma suggested by error. List of supported pragmas is defined by `haskutil.supportedExtensions`.

### Organize LANGUAGE extensions  
![Organize extensions](/images/OrganizeExtensions_sm.gif "Organize extensions")  
Splitting, sorting and alignment of extensions are configurable via `haskutil.splitExtensions`, `haskutil.sortExtensions` and `haskutil.alignExtensions` respectively. Extensions can also be organized on file save with `haskutil.organiseExtensionOnSave: true` (dafault is `false`). 

### Add top-level signature
![Add top-level signature](/images/AddSignature_sm.gif "Add top-level signature")  
Adds signature suggested by warning.

### Fill typed hole
![Fill typed hole](/images/FillTypedHole_sm.gif "Fill types hole")  
Replaces [typed hole](https://downloads.haskell.org/~ghc/8.6.4/docs/html/users_guide/glasgow_exts.html#typed-holes) with one of the `valid hole fits` from the warning.  
Similarly replaces [type wildcard](https://downloads.haskell.org/~ghc/8.6.4/docs/html/users_guide/glasgow_exts.html#type-wildcards) with inferred type.

## Dependencies

 * Automatic dependency (auto install) [hoogle-vscode](https://marketplace.visualstudio.com/items?itemName=jcanero.hoogle-vscode)
