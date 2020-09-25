import * as vscode from 'vscode';
import { runQuickfixTest } from './utils';


suite('', () => {
  suiteSetup(async () => {
    await vscode.workspace.getConfiguration('ghcSimple').update('replCommand', 'ghci', true);
    await vscode.workspace.getConfiguration('ghcSimple').update('replScope', 'file', true);
  });
  
  test('Add missing import', () => {
    return runQuickfixTest('ImportProvider.hs', 3,
      'Add: "import Data.Maybe"',
      'Add: "import Data.List (tails)"',
      'Add: "import Data.List (sort)"',
    );
  });

  test('Add missing import qualified', () => {
    return runQuickfixTest('QualifiedImportProvider.hs', 1,
      'Add: "import qualified Data.ByteString as BS"'
    );
  });

  test('Organize imports', () => {
    return runQuickfixTest('OrganizeImportProvider.hs', 1);
  });  
  
  test('Remove unused imports', () => {
    return runQuickfixTest('UnusedImportProvider.hs', 3);
  });
  
  test('Add missing extension', () => {
    return runQuickfixTest('ExtensionProvider.hs', 2);
  });

  test('Organize extensions', () => {
    return runQuickfixTest('OrganizeExtensionProvider.hs', 1);
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
    await vscode.workspace.getConfiguration('ghcSimple').update('replScope', undefined, true);
    await vscode.workspace.getConfiguration('ghcSimple').update('replCommand', undefined, true);
  });
});
