'use strict';

import { CodeActionProvider, TextDocument, Range, CodeActionContext, CancellationToken, CodeAction, CodeActionKind } from 'vscode';
import * as vscode from 'vscode';
import ImportProviderBase, { SearchResult } from './importProvider/importProviderBase';


export default class QualifiedImportProvider extends ImportProviderBase implements CodeActionProvider {
  constructor() {
    super('haskell.addQualifiedImport');
  }

  public async provideCodeActions(document: TextDocument, range: Range, context: CodeActionContext, token: CancellationToken): Promise<any> {
    const patterns = [
      /Not in scope:[^`]*[`‘]([^.]+)\.([^'’]+)['’]/,
      /Variable not in scope:\s+(?:(\S+)\.)?(\S+)/,
    ];
    let codeActions = [];
    const diagnostics = context.diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error);
    for (let diagnostic of diagnostics) {
      for (const pattern of patterns) {
        const match = pattern.exec(diagnostic.message);
        if (match === null) {
          continue;
        }

        let [, alias, name] = match;

        if (!alias) {
          const expressionMatch = /(\S+)\.(\S+)/.exec(document.getText(diagnostic.range));
          if (expressionMatch) {
            alias = expressionMatch[1];
          } else {
            continue;
          }
        }

        const results = await this.search(name);
        codeActions = codeActions.concat(this.addImportForVariable(document, alias, results));
        codeActions.forEach(action => {
          action.diagnostics = [diagnostic];
        });
      }
    }
    return codeActions;
  }

  private addImportForVariable(document: TextDocument, alias: string, searchResults: SearchResult[]): CodeAction[] {
    const codeActions = new Map<string, CodeAction>();
    for (const result of searchResults) {
      const title = `Add: "import qualified ${result.module}${result.module !== alias ? ` as ${alias}` : ''}"`;
      const codeAction = new CodeAction(title, CodeActionKind.QuickFix);
      codeAction.command = {
        title: title,
        command: this.commandId,
        arguments: [
          document,
          result.module,
          {
            qualified: true,
            alias: result.module !== alias ? ` as ${alias}` : null
          }
        ]
      };
      codeActions.set(title, codeAction);
    }
    return [...codeActions.values()];
  }
}
