'use strict';

import { CodeActionProvider, TextDocument, Range, CodeActionContext, CancellationToken, CodeAction, CodeActionKind } from 'vscode';
import * as vscode from 'vscode';
import ImportProviderBase, { SearchResult } from './importProviderBase';


export default class QualifiedImportProvider extends ImportProviderBase implements CodeActionProvider
{
  constructor()
  {
    super('haskell.addQualifiedImport');
  }

	public async provideCodeActions(document: TextDocument, range: Range, context: CodeActionContext, token: CancellationToken): Promise<any>
	{
		let codeActions = [];
		for (let diagnostic of context.diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error))
		{
			let patterns = [
        /Not in scope:[^`]*`([^.]+)\.([^']+)'/
			];
			for (let pattern of patterns)
			{
				let match = pattern.exec(diagnostic.message);
				if (match === null)
				{
					continue;
				}
				let [,alias,name] = match;

				let results = await this.search(name);
				codeActions = codeActions.concat(this.addImportForVariable(document, ` as ${alias}`, results));
				codeActions.forEach(action =>
				{
					action.diagnostics = [diagnostic];
				});
			}
		}
		return codeActions;
	}

	private addImportForVariable(document: TextDocument, alias: string, searchResults: SearchResult[]): CodeAction[]
	{
		let codeActions = [];
		for (let result of searchResults)
		{
			let title = `Add: "import qualified ${result.module}${alias}"`;
			let codeAction = new CodeAction(title, CodeActionKind.QuickFix);
			codeAction.command = {
				title: title,
				command: this.commandId,
				arguments: [
					document,
          result.module,
          {
            alias: alias
          }
				]
			};
			codeActions.push(codeAction);
		}
		return codeActions;
	}
}
