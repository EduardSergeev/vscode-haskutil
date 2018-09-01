'use strict';

import * as path from 'path';
import * as cp from 'child_process';
import ChildProcess = cp.ChildProcess;
import { CodeActionProvider, Disposable, DiagnosticCollection, TextDocument, Range, CodeActionContext, CancellationToken, CodeAction, WorkspaceEdit, Diagnostic, CodeActionKind, Command } from 'vscode';
import * as vscode from 'vscode';


export default class ImportProvider implements CodeActionProvider
{
	private static commandId: string = 'haskell.addImport';
	private command: Disposable;
	private hoogleSearch: (name: string, results) => void;

	public activate(subscriptions: Disposable[])
	{
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

	private search(name: string): Promise<SearchResult[]>
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

	public async provideCodeActions(document: TextDocument, range: Range, context: CodeActionContext, token: CancellationToken): Promise<any>
	{
		let codeActions = [];
		for (let diagnostic of context.diagnostics)
		{
			let patterns = [
				/Variable not in scope:\s+(\S+)/,
				/Not in scope: type constructor or class `(\S+)'/
			];
			var name = "";
			for (let pattern of patterns)
			{
				let match = pattern.exec(diagnostic.message);
				if (match === null)
				{
					continue;
				}
				name = match[1];

				let results = await this.search(name);
				codeActions = codeActions.concat(this.addImportForVariable(document, name, results));
				codeActions.forEach(action =>
				{
					action.diagnostics = [diagnostic];
				});
			}
		}
		return codeActions;
	}

	private addImportForVariable(document: TextDocument, variableName: string, searchResults: SearchResult[]): CodeAction[]
	{
		let codeActions = [];
		for (let result of searchResults)
		{
			{
				let title = `Add "import ${result.module}" (for ${result.result})`;
				let codeAction = new CodeAction(title, CodeActionKind.QuickFix);
				codeAction.command = {
					title: title,
					command: ImportProvider.commandId,
					arguments: [
						document,
						{
							module: result.module,
						}						
					]
				};
				codeActions.push(codeAction);
			}
			{
				let title = `Add "import ${result.module} ( ${variableName} )" (for ${result.result})`;
				let codeAction = new CodeAction(title, CodeActionKind.QuickFix);
				codeAction.command = {
					title: title,
					command: ImportProvider.commandId,
					arguments: [
						document,
						{
							module: result.module,
							importElements: [variableName]
						}						
					]
				};
				codeActions.push(codeAction);
			}
		}
		return codeActions;
	}

	private runCodeAction(document: TextDocument, importDeclaration: ImportDeclaration): Thenable<boolean>
	{
		function afterMatch(offset)
		{
			let position = document.positionAt(offset);
			return document.offsetAt(position.with(position.line + 1, 0));
		}

		function importToText(importDeclaration: ImportDeclaration)
		{
			let importList = importDeclaration.importElements ? ` (${importDeclaration.importElements.join(", ")})` : "";
			return `import ${importDeclaration.module}${importList}`;
		}

		let text = document.getText();
		var position = 0;

		let modulePattern = /^module(.|\n)+?where/gm;
		let moduleMatch = modulePattern.exec(text);
		if (moduleMatch !== null)
		{
			position = afterMatch(moduleMatch.index + moduleMatch[0].length);
		}

		let edit = new WorkspaceEdit();

		let oldImports = this.getImports(text);
		let oldImport = oldImports.get(importDeclaration.module);
		if (oldImport)
		{
			let oldElements = oldImport.importElements;
			for (let newElem of importDeclaration.importElements)
			{
				let index = oldElements.findIndex(oldElem =>
				{
					return newElem < oldElem;
				});
				index = index === -1 ? oldElements.length + 1 : index;
				oldElements.splice(index, 0, newElem);
			}
			let oldRange = new Range(
				document.positionAt(oldImport.offset),
				document.positionAt(oldImport.offset + oldImport.length));
			edit.replace(document.uri, oldRange, importToText(oldImport));
		}
		else
		{
			for (let importInfo of oldImports.values())
			{
				if (importInfo.module > importDeclaration.module)
				{
					position = importInfo.offset;
					break;
				}
				position = afterMatch(importInfo.offset + importInfo.length);
			}
			edit.insert(document.uri, document.positionAt(position), importToText(importDeclaration) + "\n");
		}

		return vscode.workspace.applyEdit(edit);
	}


	private getImports(text: string): Map<string, ImportDeclaration>
	{
		const imports = new Map();
		const importPattern = /^import\s+(?:qualified\s)?(\S+)(?:\sas\s(\S+))?(?:\s*?\(((?:(?:\(.{1,3}?\))|.|\n)*?)\))?/gm;
		const functionPattern = /(?:\d|\w(\((?:\.\.|(?:\d|\w|\,)*)\))?|(?:\(.+\)))+/gm;
		for (let match; match = importPattern.exec(text);)
		{
			let moduleName = match[1];
			imports.set(moduleName, {
				module: moduleName,
				alias: match[2],
				importList: match[3],
				importElements: match[3] ? match[3].match(functionPattern): null,
				offset: match.index,
				length: match[0].length
			});
		}
		return imports;
	}
}

interface SearchResult
{
	package: string;
	module: string;
	result: string;
}

interface ImportDeclaration
{
	module: string;
	alias?: string;
	importList?: string;
	importElements?: string[];
	offset?: number;
	length?: number;
}

