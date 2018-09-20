'use strict';

import { Disposable, TextDocument, Range, WorkspaceEdit } from 'vscode';
import * as vscode from 'vscode';
import ExtensionProvider from './extensionProvider';
import ImportDeclaration from './importProvider/importDeclaration';
import SortImportProvider from './sortImportProvider';


export interface SearchResult
{
	package: string;
	module: string;
	result: string;
}

export default class ImportProviderBase
{
	private command: Disposable;
  private hoogleSearch: (name: string, resultCallback: HoogleSearchCallback) => void;

  constructor(protected commandId: string)
  {
  }

	public activate(subscriptions: Disposable[])
  {
		this.command = vscode.commands.registerCommand(this.commandId, this.runCodeAction, this);
    subscriptions.push(this);
    
		let hoogle = vscode.extensions.getExtension('jcanero.hoogle-vscode');
		let hoogleApi = hoogle.exports;
		this.hoogleSearch = hoogleApi.search;
	}

	public dispose(): void
	{
		this.command.dispose();
  }
  
  protected search(name: string): Promise<SearchResult[]>
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
							return (i >= 0) &&
								(i === 0 || r[i - 1] === " " || r[i - 1] === '(') &&
								(j === r.length || r[j] === " " || r[j] === ")");						}
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

  private runCodeAction(document: TextDocument, moduleName: string, options: { alias?: string, elementName?: string } = {}): Thenable<boolean>
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

		let oldImports = ImportDeclaration.getImports(text);
		let oldImport =
			oldImports.find(decl => decl.module === moduleName && decl.importList !== null) ||
			oldImports.find(decl => decl.module === moduleName);
		if (oldImport && options.elementName)
		{
			oldImport.addImportElement(options.elementName);
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
      if (options.alias)
      {
        importDeclaration.qualified = " qualified ";
        importDeclaration.alias = options.alias;
      }
			if (options.elementName)
			{
				importDeclaration.addImportElement(options.elementName);
			}

			// Align import if necessary
			SortImportProvider.ensureAligned(importDeclaration, oldImports);

			edit.insert(document.uri, document.positionAt(position), importDeclaration.text + "\n");
		}

		return vscode.workspace.applyEdit(edit);
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
