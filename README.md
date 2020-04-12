# VSCode Haskutil
[![Build Status](https://travis-ci.org/EduardSergeev/vscode-haskutil.svg?branch=master)](https://travis-ci.org/EduardSergeev/vscode-haskutil)
[![vscode-ghc-simple on Visual Studio Marketplace](https://img.shields.io/vscode-marketplace/v/edka.haskutil.svg)](https://marketplace.visualstudio.com/items?itemName=Edka.haskutil)


'QuickFix' actions for Haskell editor  


## Requirements
This extension uses diagnostics (errors and warnings) from `PROBLEMS` tab which is populated by other Haskell extensions such as [Simple GHC](https://marketplace.visualstudio.com/items?itemName=dramforever.vscode-ghc-simple), [Haskero](https://marketplace.visualstudio.com/items?itemName=Vans.haskero) or [ghcid](https://marketplace.visualstudio.com/items?itemName=ndmitchell.haskell-ghcid). Please install one of them along with this extension.

## Features
 * [Add missing import](#add-missing-import)
 * [Organize imports](#organize-imports)
 * [Remove unused imports](#remove-unused-imports)
 * [Add missing LANGUAGE extension](#add-missing-language-extension)
 * [Organize LANGUAGE extensions](#organize-language-extensions)
 * [Add top-level signature](#add-top-level-signature)
 * [Fill typed hole](#fill-typed-hole)

Individual features can be turned on and off via <code>Haskutil›feature:_[feature]_</code> flags

### Add missing import  
![Add missing import](/images/AddImport_sm.gif "Add missing import")  
Uses [Hoogle](https://www.haskell.org/hoogle/) to search for matching modules. Configurable via  [hoogle-vscode](https://marketplace.visualstudio.com/items?itemName=jcanero.hoogle-vscode) extension configuration (can be configured to use local instance of hoogle for example).

### Organize imports  
![Organize imports](/images/OrganizeImports_sm.gif "Organize imports")  
Sorting and alignment are configurable via [Haskutil: Sort Imports](#haskutil-sort-imports) and [Haskutil: Align Imports](#haskutil-align-imports) respectively. Imports can also be organized on file save with [Haskutil: Organize Imports On Save](#haskutil-organize-imports-on-save).

### Remove unused imports
![Remove unused imports](/images/RemoveUnusedImports_sm.gif "Remove unused imports")  
Removes unused imports identified by warnings. [Haskutil: Align Imports](#haskutil-align-imports "haskutil.alignImports") controls if remaning imports are also aligned.

### Add missing LANGUAGE extension  
![Add extension](/images/AddExtension_sm.gif "Add extension")  
Adds `LANGUAGE` pragma suggested by error. List of supported pragmas is defined by [Haskutil: Supported Extensions](#haskutil-supported-extensions).

### Organize LANGUAGE extensions  
![Organize extensions](/images/OrganizeExtensions_sm.gif "Organize extensions")  
Splitting, sorting and alignment of extensions are configurable via [Haskutil: Split Extensions](#haskutil-split-extensions), [Haskutil: Sort Extensions](#haskutil-sort-extensions) and [Haskutil: Align Extensions](#haskutil-align-extensions) respectively. Extensions can also be organized on file save with [Haskutil: Organize Extensions On Save](#haskutil-organize-extension-on-save).

### Add top-level signature
![Add top-level signature](/images/AddSignature_sm.gif "Add top-level signature")  
Adds signature suggested by warning.

### Fill typed hole
![Fill typed hole](/images/FillTypedHole_sm.gif "Fill types hole")  
Replaces [typed hole](https://downloads.haskell.org/~ghc/8.6.4/docs/html/users_guide/glasgow_exts.html#typed-holes) with one of the `valid hole fits` from the warning.  
Similarly replaces [type wildcard](https://downloads.haskell.org/~ghc/8.6.4/docs/html/users_guide/glasgow_exts.html#type-wildcards) with inferred type.

## Configuration

### Haskutil › Feature: Add Import
- [x] Enable [Add missing import](#add-missing-import) feature

### Haskutil › Feature: Organize Imports
- [x] Enable [Organize imports](#organize-imports) feature

#### Haskutil: Always Pad Imports
- [ ] Always pad after `import` regardless if there is `qualified` import or not

#### Haskutil: Sort Imports
- [x] Sort imports when [organizing imports](#organize-imports)

#### Haskutil: Organize Imports On Save
- [ ] [Organize imports](#organize-imports) when saving the document

### Haskutil › Feature: Remove Unused Import
- [x] "Enable [Remove unused imports](#remove-unused-imports) feature"

#### Haskutil: Align Imports
- [x] Align imports when [organizing imports](#organize-imports) or [removing unused imports](#remove-unused-imports)

### Haskutil › Feature: Add Extension
- [x] Enable [Add missing LANGUAGE extension](#add-missing-language-extension) feature

### Haskutil › Feature: Organize Extensions
- [x] Enable [Organize LANGUAGE extensions](#organize-language-extensions) feature

#### Haskutil: Split Extensions  
- [x] Make sure there is one extension per `LANGUAGE` pragma when [organizing LANGUAGE extensions](#organize-language-extensions)

#### Haskutil: Align Extensions
- [x] `haskutil.alignExtensions` Make sure `LANGUAGE` extension pragmas are of the same length when [organizing LANGUAGE extensions](#organize-language-extensions)

#### Haskutil: Sort Extensions
- [x] Make sure `LANGUAGE` extension pragmas are sorted when [organizing extensions](#organize-language-extensions)

#### Haskutil: Organize Extension On Save
- [ ] [Organize extensions](#organize-language-extensions) when saving the document

#### Haskutil: Organize Extension On Insert
- [x] [Organize extensions](#organize-language-extensions) when [adding missing LANGUAGE extensions](#add-missing-language-extension)

#### Haskutil: Supported Extensions
Haskell `LANGUAGE` extensions specified in GHC's error messages which triggers QuickFix prompt for [adding missing LANGUAGE extensions](#add-missing-language-extension)

### Haskutil › Feature: Add Signature
- [x] Enable [Add top-level signature](#add-top-level-signature) feature

### Haskutil › Feature: Fill TypeHole
- [x] Enable [Fill type hole](#fill-typed-hole) feature

## Dependencies

 * Automatic dependency (auto install) [hoogle-vscode](https://marketplace.visualstudio.com/items?itemName=jcanero.hoogle-vscode)
