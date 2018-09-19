import * as vscode from 'vscode'; 

import ImportProvider from './features/importProvider';
import SortImportProvider from './features/sortImportProvider';
import ExtensionProvider from './features/extensionProvider';
import TopLevelSignatureProvider from './features/topLevelSignatureProvider';

export function activate(context: vscode.ExtensionContext) {
	let importProvider = new ImportProvider();	
	importProvider.activate(context.subscriptions);
	vscode.languages.registerCodeActionsProvider('haskell', importProvider);

	let sortImportProvider = new SortImportProvider();	
	sortImportProvider.activate(context.subscriptions);
	vscode.languages.registerCodeActionsProvider('haskell', sortImportProvider);	
	
	let extensionProvider = new ExtensionProvider();	
	extensionProvider.activate(context.subscriptions);
	vscode.languages.registerCodeActionsProvider('haskell', extensionProvider);

	let signatureProvider = new TopLevelSignatureProvider();	
	signatureProvider.activate(context.subscriptions);
	vscode.languages.registerCodeActionsProvider('haskell', signatureProvider);	
}
