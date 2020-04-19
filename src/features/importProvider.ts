'use strict';

import { CodeActionProvider, TextDocument, Range, CodeActionContext, CancellationToken, CodeAction, CodeActionKind } from 'vscode';
import * as vscode from 'vscode';
import ImportProviderBase, { SearchResult } from './importProvider/importProviderBase';
import { documentInScope } from './utils';


export default class ImportProvider extends ImportProviderBase implements CodeActionProvider {
  constructor() {
    super('haskell.addImport');
  }

  public async provideCodeActions(document: TextDocument, range: Range, context: CodeActionContext, token: CancellationToken): Promise<any> {
    if (! documentInScope(document)) {
      return;
    }

    let codeActions = [];
    for (const diagnostic of context.diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error)) {
      const patterns = [
        /Variable not in scope:\s+(\S+)/,
        /Not in scope: type constructor or class [`‘](\S+)['’]/
      ];
      for (const pattern of patterns) {
        const match = pattern.exec(diagnostic.message);
        if (match === null) {
          continue;
        }
        const name = match[1];

        const results = await this.search(name);
        codeActions = codeActions.concat(this.addImportForVariable(document, name, results));
        codeActions.forEach(action => {
          action.diagnostics = [diagnostic];
        });
      }
    }
    return codeActions;
  }

  private addImportForVariable(document: TextDocument, variableName: string, searchResults: SearchResult[]): CodeAction[] {
    const codeActions = [];
    for (const result of searchResults) {
      let title = `Add: "import ${result.module}"`;
      let codeAction = new CodeAction(title, CodeActionKind.QuickFix);
      codeAction.command = {
        title: title,
        command: this.commandId,
        arguments: [
          document,
          result.module,
        ]
      };
      codeActions.push(codeAction);

      title = `Add: "import ${result.module} (${variableName})"`;
      codeAction = new CodeAction(title, CodeActionKind.QuickFix);
      codeAction.command = {
        title: title,
        command: this.commandId,
        arguments: [
          document,
          result.module,
          {
            elementName: variableName
          }
        ]
      };
      codeActions.push(codeAction);
    }
    return codeActions;
  }
}
