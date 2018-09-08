import * as vscode from 'vscode'; 

import ImportProvider from './features/importProvider';
import ExtensionProvider from './features/extensionProvider';

export function activate(context: vscode.ExtensionContext) {
	let importProvider = new ImportProvider();	
	importProvider.activate(context.subscriptions);
	vscode.languages.registerCodeActionsProvider('haskell', importProvider);

	let extensionProvider = new ExtensionProvider();	
	extensionProvider.activate(context.subscriptions);
	vscode.languages.registerCodeActionsProvider('haskell', extensionProvider);

}
