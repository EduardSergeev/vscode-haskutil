import * as vscode from 'vscode'; 

import ImportProvider from './features/importProvider';
import QualifiedImportProvider from './features/qualifiedImportProvider';
import OrganizeImportProvider from './features/organizeImportProvider';
import ExtensionProvider from './features/extensionProvider';
import OrganizeExtensionProvider from './features/organizeExtensionProvider';
import TopLevelSignatureProvider from './features/topLevelSignatureProvider';

export function activate(context: vscode.ExtensionContext)
{
	const providers = [
		new ImportProvider(),
		new QualifiedImportProvider(),
		new OrganizeImportProvider(),
		new ExtensionProvider(),
		new OrganizeExtensionProvider(),
		new TopLevelSignatureProvider(),
	];
	for (const provider of providers)
	{
		provider.activate(context.subscriptions);
		vscode.languages.registerCodeActionsProvider('haskell', provider);
	}
}
