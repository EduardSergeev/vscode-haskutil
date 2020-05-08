'use strict';

import { CodeActionProvider, TextDocument, Range, CodeActionContext, CancellationToken, CodeAction, CodeActionKind } from 'vscode';
import * as vscode from 'vscode';
import ImportProviderBase, { SearchResult } from './importProvider/importProviderBase';


export default class QualifiedImportProvider extends ImportProviderBase implements CodeActionProvider {
  constructor() {
    super('haskell.addQualifiedImport');
  }

  public async provideCodeActions(document: TextDocument, range: Range, context: CodeActionContext, token: CancellationToken): Promise<any> {
    const pattern = /Not in scope:[^`]*[`‘]([^.]+)\.([^'’]+)['’]/;
    let codeActions = [];
    const diagnostics = context.diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error);
    for (let diagnostic of diagnostics) {
      const match = pattern.exec(diagnostic.message);
      if (match === null) {
        continue;
      }
      const [, alias, name] = match;

      const results = await this.search(name);
      codeActions = codeActions.concat(this.addImportForVariable(document, ` as ${alias}`, results));
      codeActions.forEach(action => {
        action.diagnostics = [diagnostic];
      });
    }
    return codeActions;
  }

  private addImportForVariable(document: TextDocument, alias: string, searchResults: SearchResult[]): CodeAction[] {
    const codeActions = [];
    for (const result of searchResults) {
      const title = `Add: "import qualified ${result.module}${alias}"`;
      const codeAction = new CodeAction(title, CodeActionKind.QuickFix);
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
