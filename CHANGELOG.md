# Change Log
All notable changes to the "haskutil" extension will be documented in this file.

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
