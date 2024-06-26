import * as vscode from 'vscode';
import Configuration from './configuration';
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

  if (Configuration.checkDiagnosticsExtension) {
    checkDependencies();
  }

  for (const feature in features) {
    if (Configuration.root.feature[feature]) {
      const provider = features[feature];
      provider.activate(context.subscriptions);
      vscode.languages.registerCodeActionsProvider('haskell', provider);
    }
  }
}

function checkDependencies() {
  const dependencies = Configuration.supportedDependencies;
  if(!dependencies.find(extension => vscode.extensions.getExtension(extension.id))) {
    const toLink = ({id, name}) => `[${name}](${vscode.Uri.parse(`command:workbench.extensions.search?["@id:${id}"]`)})`;
    const items = dependencies.map(toLink);
    const warningSetting = `${Configuration.rootSection}.${Configuration.checkDiagnosticsExtensionSection}`;
    const warningLink = `[${Configuration.checkDiagnosticsExtensionSection}](${vscode.Uri.parse(`command:workbench.action.openSettings?["${warningSetting}"]`)})`;
    const listSetting = `${Configuration.rootSection}.${Configuration.supportedDependenciesSection}`;
    const listLink = `[${Configuration.supportedDependenciesSection}](${vscode.Uri.parse(`command:workbench.action.openSettings?["${listSetting}"]`)})`;
    vscode.window.showWarningMessage(`No supported Haskell diagnostics extension was found.
To get QuickFix provided by ${toLink({ id: 'edka.haskutil', name: 'Haskutil' })} 
install one of the recommended extension: ${items.slice(0, -1).join(', ')} or ${items.pop()}. 
Otherwise to supress this warning either add any 3rd party Haskell diagnostics extension to ${listLink} or disable it in ${warningLink}.`);
  }  
}
