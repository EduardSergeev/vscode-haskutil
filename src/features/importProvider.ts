'use strict';

import { CodeActionProvider, Disposable, TextDocument, Range, CodeActionContext, CancellationToken, CodeAction, WorkspaceEdit, CodeActionKind } from 'vscode';
import * as vscode from 'vscode';
import ExtensionProvider from './extensionProvider';


export default class ImportProvider implements CodeActionProvider
{
	private static commandId: string = 'haskell.addImport';
	private command: Disposable;
	private hoogleSearch: (name: string, resultCallback: HoogleSearchCallback) => void;

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
		let result = new Promise<SearchResult[]>(resolve =>
		{
			this.hoogleSearch(name, searchResult =>
			{
				resolve(searchResult.results
					.filter(result =>
					{
						if (!result.isModule() && !result.isPackage())
						{
							let r = result.getQueryResult();
							let i = r.indexOf(name);
							let j = i + name.length;
							return (i >= 0) && (i === 0 || r[i - 1] === " ") && (j === r.length || r[j] === " ");
						}
						else
						{
							return false;
						}
					}).map(result =>
					{
						return {
							package: result.getPackageName(),
							module: result.getModuleName().replace(/-/g, '.'),
							result: result.getQueryResult()
						};
					})
				);
			});
		});
		return result;
	}

	public async provideCodeActions(document: TextDocument, range: Range, context: CodeActionContext, token: CancellationToken): Promise<any>
	{
		let codeActions = [];
		for (let diagnostic of context.diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error))
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
			let title = `Add "import ${result.module}"`;
			let codeAction = new CodeAction(title, CodeActionKind.QuickFix);
			codeAction.command = {
				title: title,
				command: ImportProvider.commandId,
				arguments: [
					document,
					result.module,
				]
			};
			codeActions.push(codeAction);

			title = `Add "import ${result.module} (${variableName})"`;
			codeAction = new CodeAction(title, CodeActionKind.QuickFix);
			codeAction.command = {
				title: title,
				command: ImportProvider.commandId,
				arguments: [
					document,
					result.module,
					variableName
				]
			};
			codeActions.push(codeAction);
		}
		return codeActions;
	}

	private runCodeAction(document: TextDocument, moduleName: string, elementName?: string): Thenable<boolean>
	{
		function afterMatch(offset)
		{
			let position = document.positionAt(offset);
			return document.offsetAt(position.with(position.line + 1, 0));
		}

		let text = document.getText();
		var position = 0;

		for (let match, pattern = ExtensionProvider.extensionPattern; match = pattern.exec(text);)
		{
			position = afterMatch(match.index + match[0].length);
		}

		let modulePattern = /^module(.|\n)+?where/gm;
		let match = modulePattern.exec(text);
		if (match !== null)
		{
			position = afterMatch(match.index + match[0].length);
		}

		let edit = new WorkspaceEdit();

		let oldImports = this.getImports(text);
		let oldImport =
			oldImports.find(decl => decl.module === moduleName && decl.importList !== null) ||
			oldImports.find(decl => decl.module === moduleName);
		if (oldImport && elementName)
		{
			oldImport.addImportElement(elementName);
			let oldRange = new Range(
				document.positionAt(oldImport.offset),
				document.positionAt(oldImport.offset + oldImport.length));
			edit.replace(document.uri, oldRange, oldImport.text);
		}
		else
		{
			for (let importInfo of oldImports)
			{
				if (importInfo.module > moduleName)
				{
					position = importInfo.offset;
					break;
				}
				position = afterMatch(importInfo.offset + importInfo.length);
			}
			let importDeclaration = new ImportDeclaration(moduleName);
			if (elementName)
			{
				importDeclaration.addImportElement(elementName);
			}
			edit.insert(document.uri, document.positionAt(position), importDeclaration.text + "\n");
		}

		return vscode.workspace.applyEdit(edit);
	}


	private getImports(text: string): ImportDeclaration[]
	{
		let imports = [];
		const importPattern = /^import((?:\s+qualified\s+)|\s+)(\S+)(\s+as\s+(\S+))?(\s*?\(((?:(?:\(.*?\))|.|\n)*?)\))?(\s+hiding\s+\(((?:(?:\(.*?\))|.|\n)*?)\))?/gm;
		for (let match; match = importPattern.exec(text);)
		{
			imports.push(new ImportDeclaration(
				match[2],
				{
					qualified: match[1],
					alias: match[3],
					importList: match[5],
					importElements: match[6],
					hidingList: match[7],
					offset: match.index,
					length: match[0].length
				}));
		}
		return imports;
	}
}

interface HoogleSearchCallback
{
	(result: { results: HoogleResult[] }): void;
}

interface HoogleResult
{
	isModule(): boolean;
	isPackage(): boolean;
	getPackageName(): string;
	getModuleName(): string;
	getQueryResult(): string;
}

interface SearchResult
{
	package: string;
	module: string;
	result: string;
}

class ImportDeclaration
{
	private _importElements?: string[] = [];
	qualified: string = " ";
	alias?: string;
	importList?: string;
	hidingList?: string;
	offset?: number;
	length?: number;

	constructor(
		public module: string,
		optional?: {
			qualified?: string,
			alias?: string,
			importList?: string,
			importElements?: string,
			hidingList?: string,
			offset?: number,
			length?: number
		})
	{
		if (optional)
		{
			this.qualified = optional.qualified;
			this.alias = optional.alias;
			this.importList = optional.importList;
			this.importElements = optional.importElements;
			this.hidingList = optional.hidingList;
			this.offset = optional.offset;
			this.length = optional.length;
		}
	}

	public get importElements()
	{
		return this._importElements ? this._importElements.join(',') : null;
	}

	public set importElements(elementsString: string)
	{
		this._importElements = elementsString ? elementsString.split(',') : [];
	}

	public get importNames()
	{
		return this._importElements.map(e => e.trim());
	}

	public addImportElement(newElem: string)
	{
		let before = this.importElements;
		if (this.importNames.length === 0 || this.importNames[0] === "")
		{
			this.importList = " (I)";
			before = "I";
			this._importElements = [];
		}

		let index = this.importNames.findIndex(oldElem =>
		{
			return newElem < oldElem;
		});
		index = index === -1 ? this.importNames.length : index;
		if (index === 0)
		{
			if (this.importElements.length > 0)
			{
				this._importElements.splice(index, 1, `${newElem}, ${this._importElements[0]}`);
			}
			else
			{
				this._importElements.push(newElem);
			}
		}
		else
		{
			this._importElements.splice(index, 0, ` ${newElem}`);
		}

		this.importList = this.importList.replace(before, this.importElements);
	}

	public get text()
	{
		return `import${this.qualified || ""}${this.module}${this.alias || ""}${this.importList || ""}${this.hidingList || ""}`;
	}
}

