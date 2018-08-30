'use strict';

import * as path from 'path';
import * as cp from 'child_process';
import ChildProcess = cp.ChildProcess;
import * as vscode from 'vscode';

export default class ImportProvider implements vscode.CodeActionProvider
{
	private static commandId: string = 'haskell.addImport';
	private command: vscode.Disposable;
	private diagnosticCollection: vscode.DiagnosticCollection;
	private hoogleSearch: (string, any) => any;

	public activate(subscriptions: vscode.Disposable[]) {
		this.command = vscode.commands.registerCommand(ImportProvider.commandId, this.runCodeAction, this);
		subscriptions.push(this);

		let hoogle = vscode.extensions.getExtension('jcanero.hoogle-vscode');
		let hoogleApi = hoogle.exports;
		this.hoogleSearch = hoogleApi.search;
	}

	public dispose(): void
	{
		this.command.dispose();
	}

	private search(name: string): Promise<any>
	{
		var result = new Promise<any>((resolve, reject) =>
		{
			this.hoogleSearch(name, results =>
			{
				resolve(results.results.map(result =>
				{
					return {
						package: result.getPackageName(),
						module: result.getModuleName().replace(/-/g, '.'),
						result: result.result 
					};
				}));
			});
		});
		return result;
	}

	public async provideCodeActions(document: vscode.TextDocument, range: vscode.Range, context: vscode.CodeActionContext, token: vscode.CancellationToken): Promise<any>
	{
		let diagnostic = context.diagnostics[0];
		let pattern = /Variable not in scope:\s+(\S+)\s/;
		let match: RegExpExecArray = pattern.exec(diagnostic.message);
	  if(match === null || match.length < 2)
		{
			return null;
		}
		let name = match[1];

		let results = await this.search(name);

		return results.map(result =>
		{
			return {
				title: "Add import " + result.module + " (for " + result.result + ")",
				tooltip: "Add missing import",
				command: ImportProvider.commandId,
				arguments: [document, name, result.module]
			};
		});
	}

	
	private runCodeAction(document: vscode.TextDocument, name: string, module:string): any {
		
		function AfterMatch(match)
		{
			let position = document.positionAt(match.index + match[0].length);
			return document.offsetAt(position.with(position.line + 1, 0));
		}

		let text = document.getText();
		var position = 0;

		let modulePattern = /^module\s+\w+\s*(?:\(.*\))?\s*where/gm;
		let moduleMatch = modulePattern.exec(text);
		if(moduleMatch !== null)
		{
			position = AfterMatch(moduleMatch);
		}

		let importPattern = /^import\s+(?:qualified\s+)*(.+)$/gm;
		do
		{
			let importMatch = importPattern.exec(text);
			if(importMatch === null)
			{
				break;
			}
			if(importMatch[1] > module)
			{
				position = importMatch.index;
				break;	
			}
			position = AfterMatch(importMatch);
		} while(true);

		let edit = new vscode.WorkspaceEdit();
		edit.insert(
			document.uri,
			document.positionAt(position),
			`import ${module}\n`); 
		return vscode.workspace.applyEdit(edit);
	}
}
