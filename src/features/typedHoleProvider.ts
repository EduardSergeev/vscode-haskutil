'use strict';

import { CodeActionProvider, Disposable, TextDocument, Range, CodeActionContext, CancellationToken, CodeAction, WorkspaceEdit, CodeActionKind } from 'vscode';
import * as vscode from 'vscode';


export default class TypedHoleProvider implements CodeActionProvider {
  private static commandId: string = 'haskell.fillTypeHoleSignature';

  public activate(subscriptions: Disposable[]) {
    const command = vscode.commands.registerCommand(TypedHoleProvider.commandId, this.runCodeAction, this);
    subscriptions.push(command);
  }

  public async provideCodeActions(document: TextDocument, range: Range, context: CodeActionContext, token: CancellationToken): Promise<any> {
    const errorPattern = / Found hole: ([^\s]+?) ::/;
    const fillPattern = /^\s+([^\s]+)\s::/gm;
    const codeActions = [];
    for (const diagnostic of context.diagnostics) {
      const match = errorPattern.exec(diagnostic.message);
      if (match === null) {
        continue;
      }
      const hole = match[1];

      for (let fillMatch; fillMatch = fillPattern.exec(diagnostic.message);) {
        const fill = fillMatch[1];
        const title = `Fill \`${hole}' with: \`${fill}'`;
        const codeAction = new CodeAction(title, CodeActionKind.QuickFix);
        codeAction.command = {
          title: title,
          command: TypedHoleProvider.commandId,
          arguments: [
            document,
            fill,
            diagnostic.range
          ]
        };
        codeAction.diagnostics = [diagnostic];
        codeActions.push(codeAction);
      }
    }
    return codeActions;
  }

  private runCodeAction(document: TextDocument, fill: string, range: Range): Thenable<boolean> {
    const edit = new WorkspaceEdit();
    edit.replace(document.uri, range, fill);
    return vscode.workspace.applyEdit(edit);
  }
}
