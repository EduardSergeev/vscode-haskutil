import * as vscode from 'vscode';
import ImportProvider from './features/importProvider';
import QualifiedImportProvider from './features/qualifiedImportProvider';
import OrganizeImportProvider from './features/organizeImportProvider';
import ExtensionProvider from './features/extensionProvider';
import OrganizeExtensionProvider from './features/organizeExtensionProvider';
import TopLevelSignatureProvider from './features/topLevelSignatureProvider';
import TypedHoleProvider from './features/typedHoleProvider';
import TypeWildcardProvider from './features/typeWildcardProvider';
import RemoveUnusedImportProvider from './features/removeUnusedImportProvider';


export function activate(context: vscode.ExtensionContext) {
  const features = {
    addImport: new ImportProvider(),
    addQualifiedImport: new QualifiedImportProvider(),
    organizeImports: new OrganizeImportProvider(),
    addExtension: new ExtensionProvider(),
    organizeExtensions: new OrganizeExtensionProvider(),
    addSignature: new TopLevelSignatureProvider(),
    fillTypeHole: new TypedHoleProvider(),
    fillTypeWildcard: new TypeWildcardProvider(),
    removeUnusedImport: new RemoveUnusedImportProvider(),
  };

  checkDependencies();

  for (const feature in features) {
    if (vscode.workspace.getConfiguration('haskutil').feature[feature]) {
      const provider = features[feature];
      provider.activate(context.subscriptions);
      vscode.languages.registerCodeActionsProvider('haskell', provider);
    }
  }
}

function checkDependencies() {
  const dependencies = [
    ['dramforever.vscode-ghc-simple', 'Simple GHC'],
    ['Vans.haskero', 'Haskero'],
    ['ndmitchell.haskell-ghcid', 'ghcid'],
    ['digitalassetholdingsllc.ghcide', 'ghcide']
  ];
  const installed = new Set(vscode.extensions.all.map(e => e.id));
  if(!dependencies.find(([id]) => installed.has(id))) {
    const ml = ([id, name]) => `[${name}](https://marketplace.visualstudio.com/items?itemName=${id})`;
    const items = dependencies.map(ml);
    vscode.window.showWarningMessage(`Dependency is not installed.
      Extension which populates diagnostics (Errors and Warnings) is not installed.
      Please install either ${items.slice(0, -1).join(', ')} or ${items.pop()}
      to get the full set of QuickFix actions provided by ${ml(['edka.haskutil','Haskutil'])}.
    `);
  }  
}
