# Change Log
All notable changes to the "Haskutil" extension will be documented in this file.

## [0.7.1] - 2020-04-13
### Fixed
 * Adjust Unused imports diagnostic range when imports are edited/moved

## [0.7.0] - 2020-04-12
### Added
 * Add `Remove unused imports` feature

## [0.6.0] - 2020-04-10
### Added
 * Add [ghcid](https://marketplace.visualstudio.com/items?itemName=ndmitchell.haskell-ghcid) as an option for base extension populating PROBLEMS 

## [0.5.3] - 2020-04-09
### Fixed
 * Background color of Marketplace banner

## [0.5.2] - 2020-04-09
### Fixed
 * Fix detection of missing qualified import on Linux

## [0.5.1] - 2020-04-09
### Fixed
 * Fix wildcard replacement under GHC 8.8
 * Better handling of wildcards (nested parenthesis and `()` as replacement)

## [0.5.0] - 2020-04-01
### Added
 * Settings for turning on/off individual features
### Fixed
 * Fix 'Not in scope' error detection (different platforms)
 * Make LANGUAGE pragma handling case insencitive 

## [0.4.5] - 2019-07-26
### Fixed
 * Fix type wildcard error detection on Linux

## [0.4.4] - 2019-07-26
### Fixed
 * Fix type hole error detection on Linux

## [0.4.3] - 2019-05-21
### Fixed
 * Upgrade dependent packages to fix security vulnerabilities

## [0.4.2] - 2019-03-27
### Fixed
 * Rolling back version 0.4.1. This version is identical to 0.4.0

## [0.4.0] - 2019-03-26
### Added
 * Replace type wildcard with GHC suggestion

## [0.3.1] - 2019-03-25
### Changed
 * Minor fix: remove redundant workaround

## [0.3.0] - 2019-03-24
### Added
 * Fill typed hole with GHC suggestion

## [0.2.2] - 2019-03-10
### Fixed
 * Bump dependencies to fix security warning in `node.extend`

## [0.2.1] - 2018-09-30
### Added
 * Check if dependent extension is installed

## [0.2.0] - 2018-09-30
### Added
 * Organize LANGUAGE extensions (split, align and sort)
 * Configuration of the padding of `import` in `qualified` area
   (should we always pad with 9 spaces even if there is no `qualified` import)

## [0.1.0] - 2018-09-20
### Changed
 * Organize imports (sort and align) 
 * Add top-level signature (documented)

## [0.0.4] - 2018-09-19
### Added
 * Sort `import` statements
 * Add top-level signature (undocumented)

## [0.0.3] - 2018-09-15
### Added
 * Additional supported `LANGUAGE` extensions
### Changed
 * Removed dependency on `Haskero`
### Fixed:
 * Broken ordering on `LANGUAGE` pragma insert
 

## [0.0.2] - 2018-09-14
### Fixed:
 * Insert imports after all `LANGUAGE` pragmas
 * Show only exactly matched suggestion in `Add import`  
   (previously `runErrorT`'s module would be included for `runE` variable)

## [0.0.1] - 2018-09-13 
### Added:
 * Add missing `import` statement
 * Add missing `LANGUAGE` pragma
