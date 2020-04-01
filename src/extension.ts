import * as vscode from 'vscode'; 

import ImportProvider from './features/importProvider';
import QualifiedImportProvider from './features/qualifiedImportProvider';
import OrganizeImportProvider from './features/organizeImportProvider';
import ExtensionProvider from './features/extensionProvider';
import OrganizeExtensionProvider from './features/organizeExtensionProvider';
import TopLevelSignatureProvider from './features/topLevelSignatureProvider';
import TypedHoleProvider from './features/typedHoleProvider';
import TypeWildcardProvider from './features/typeWildcardProvider';

export function activate(context: vscode.ExtensionContext)
{
	const features = {
		addImport: new ImportProvider(),
		addQualifiedImport: new QualifiedImportProvider(),
		organizeImports: new OrganizeImportProvider(),
		addExtension: new ExtensionProvider(),
		organizeExtensions: new OrganizeExtensionProvider(),
		addSignature: new TopLevelSignatureProvider(),
		fillTypeHole: new TypedHoleProvider(),
		fillTypeWildcard: new TypeWildcardProvider(),
	};
	
	for (const feature in features)
	{
		if (vscode.workspace.getConfiguration('haskutil').feature[feature])
		{
			const provider = features[feature];
			provider.activate(context.subscriptions);
			vscode.languages.registerCodeActionsProvider('haskell', provider);
		}
	}
}
