import * as vscode from 'vscode';
import { runQuickfixTest } from './utils';
import { DiagnosticSeverity } from 'vscode';

const configs = {
  'telemetry.enableTelemetry': false,
  'ghcSimple.replCommand': 'stack exec ghci',
  'ghcSimple.replScope': 'file',
};

suite('', () => {
  suiteSetup(async () => {
    const config = vscode.workspace.getConfiguration();
    for (const setting in configs) { 
      await config.update(setting, configs[setting], true);
    }
  });
  
  test('Add missing import', () => {
    return runQuickfixTest('ImportProvider.hs', 4,
      'Add: "import Control.Arrow ((>>>))"',
      'Add: "import Data.Maybe"',
      'Add: "import Data.List (tails)"',
      'Add: "import Data.List (sort)"',
    );
  });

  test('Add missing import qualified', () => {
    return runQuickfixTest('QualifiedImportProvider.hs', [DiagnosticSeverity.Error, 2],
      'Add: "import qualified Data.ByteString as BS"',
      'Add: "import qualified Numeric"'
    );
  });

  test('Add missing constructor import', () => {
    return runQuickfixTest('ImportProviderConstructor.hs', [DiagnosticSeverity.Error, 1],
      'Add: "import Data.Proxy (Proxy(..))"'
    );
  });

  test('Organize imports', () => {
    return runQuickfixTest('OrganizeImportProvider.hs', 0);
  });  
  
  test('Remove unused imports', () => {
    return runQuickfixTest('UnusedImportProvider.hs', 2);
  });
  
  test('Add missing extension', () => {
    return runQuickfixTest('ExtensionProvider.hs', 2);
  });

  test('Organize extensions', () => {
    return runQuickfixTest('OrganizeExtensionProvider.hs', 0);
  });

  test('Replace wildcard with suggested type', () => {
    return runQuickfixTest('TypeWildcardProvider.hs', 3);
  });

  test('Replace type hole with suggested type', () => {
    return runQuickfixTest('TypeHoleProvider.hs', 2,
      "Fill `_' with: `True'",
      "Fill `_' with: `init'"
    );
  }); 
   
  test('Add top-level signature', () => {
    return runQuickfixTest('TopLevelSignatureProvider.hs', 1);
  });  

  suiteTeardown(async () => {
    const config = vscode.workspace.getConfiguration();
    for (const setting in configs) { 
      await config.update(setting, undefined, true);
    }
  });
});
