import * as vscode from 'vscode'; 

import ImportProvider from './features/importProvider';

export function activate(context: vscode.ExtensionContext) {
	let importProvider = new ImportProvider();	
	importProvider.activate(context.subscriptions);
	vscode.languages.registerCodeActionsProvider('haskell', importProvider);
}
