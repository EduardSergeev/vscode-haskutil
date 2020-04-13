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
  const dependency =
    vscode.extensions.getExtension('dramforever.vscode-ghc-simple') ||
    vscode.extensions.getExtension('Vans.haskero') ||
    vscode.extensions.getExtension('ndmitchell.haskell-ghcid');
  if(!dependency) {
    vscode.window.showWarningMessage(
      "Dependent extension which populates diagnostics (Errors and Warnings) is not installed.\n" +
      "Please install [Simple GHC](https://marketplace.visualstudio.com/items?itemName=dramforever.vscode-ghc-simple), " +
      "[Haskero](https://marketplace.visualstudio.com/items?itemName=Vans.haskero), " +
      "or [ghcid](https://marketplace.visualstudio.com/items?itemName=ndmitchell.haskell-ghcid)");
  }

  const features = {
    addImport: [new ImportProvider(), new QualifiedImportProvider()],
    organizeImports: [new OrganizeImportProvider()],
    removeUnusedImports: [new RemoveUnusedImportProvider()],
    addExtension: [new ExtensionProvider()],
    organizeExtensions: [new OrganizeExtensionProvider()],
    addSignature: [new TopLevelSignatureProvider()],
    fillTypeHole: [new TypedHoleProvider(), new TypeWildcardProvider()],
  };

  for (const feature in features) {
    if (vscode.workspace.getConfiguration('haskutil').feature[feature]) {
      for(const provider of features[feature]) {
        provider.activate(context.subscriptions);
        vscode.languages.registerCodeActionsProvider('haskell', provider);
      }
    }
  }
}
