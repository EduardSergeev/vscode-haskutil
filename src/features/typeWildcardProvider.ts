'use strict';

import { CodeActionProvider, Disposable, TextDocument, Range, CodeActionContext, CancellationToken, CodeAction, WorkspaceEdit, CodeActionKind } from 'vscode';
import * as vscode from 'vscode';


export default class TypeWildcardProvider implements CodeActionProvider
{
  private static commandId: string = 'haskell.fillTypeWildcard';
  private command: Disposable;
  
  public activate(subscriptions: Disposable[])
  {
    this.command = vscode.commands.registerCommand(TypeWildcardProvider.commandId, this.runCodeAction, this);
    subscriptions.push(this);
  }

  public dispose(): void
  {
    this.command.dispose();
  }

  public async provideCodeActions(document: TextDocument, range: Range, context: CodeActionContext, token: CancellationToken): Promise<any>
  {
    const errorPattern = / Found type wildcard `(.+?)'/;
    const fillPattern = /standing for `(.+?)'/;
    const codeActions = [];
    for (const diagnostic of context.diagnostics)
    {
      const match = errorPattern.exec(diagnostic.message);
      if (match === null)
      {
        continue;
      }
      const wildcard = match[1];

      let fillMatch = fillPattern.exec(diagnostic.message);
      if(fillMatch)
      {
        let fill = fillMatch[1];
        let offset = document.offsetAt(diagnostic.range.end);
        while (document.getText(new Range(document.positionAt(offset), document.positionAt(offset + 1))).match(/\s/))
        {
          offset++;
        }
        let next = document.getText(new Range(document.positionAt(offset), document.positionAt(offset + 2)));
        if (fill.indexOf(" -> ") > -1 && next === "->")
        {
          fill = `(${fill})`;
        }
        const title = `Replace \`${wildcard}' with: \`${fill}'`;
        const codeAction = new CodeAction(title, CodeActionKind.QuickFix);
        codeAction.command = {
          title: title,
          command: TypeWildcardProvider.commandId,
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

  private runCodeAction(document: TextDocument, fill: string, range: Range): Thenable<boolean>
  {
    const edit = new WorkspaceEdit();
    edit.replace(document.uri, range, fill);
    return vscode.workspace.applyEdit(edit);
  }
}

