# Change Log
All notable changes to the "haskutil" extension will be documented in this file.

## [0.2.0] - 2018-09-23
### Added
 * Configuration of the padding of `import` in `qualified` area
   (should we always pad with 9 spaces even if there is no `qualified` import)

## [0.1.0] - 2018-09-20
### Changed
 * Organise imports (sort and align) 
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
