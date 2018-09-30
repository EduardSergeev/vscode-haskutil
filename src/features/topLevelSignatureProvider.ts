'use strict';

import { CodeActionProvider, Disposable, TextDocument, Range, CodeActionContext, CancellationToken, CodeAction, WorkspaceEdit, CodeActionKind } from 'vscode';
import * as vscode from 'vscode';


export default class TopLevelSignatureProvider implements CodeActionProvider
{
  private static commandId: string = 'haskell.addTopLevelSignature';
  private command: Disposable;
  
  public activate(subscriptions: Disposable[])
  {
    this.command = vscode.commands.registerCommand(TopLevelSignatureProvider.commandId, this.runCodeAction, this);
    subscriptions.push(this);
  }

  public dispose(): void
  {
    this.command.dispose();
  }

  public async provideCodeActions(document: TextDocument, range: Range, context: CodeActionContext, token: CancellationToken): Promise<any>
  {
    const pattern = /Top-level binding with no type signature:\s+([^]+)/;
    const codeActions = [];
    for (const diagnostic of context.diagnostics)
    {
      const match = pattern.exec(diagnostic.message);
      if (match === null)
      {
        continue;
      }

      const signature = match[1].trim();
      const title = `Add: ${signature}`;
      const codeAction = new CodeAction(title, CodeActionKind.QuickFix);
      codeAction.command = {
        title: title,
        command: TopLevelSignatureProvider.commandId,
        arguments: [
          document,
          signature,
          diagnostic.range
        ]
      };
      codeAction.diagnostics = [diagnostic];
      codeActions.push(codeAction);
    }
    return codeActions;
  }

  private runCodeAction(document: TextDocument, signature: string, range: Range): Thenable<boolean>
  {
    const edit = new WorkspaceEdit();
    edit.insert(document.uri, range.start, `${signature}\n`);
    return vscode.workspace.applyEdit(edit);
  }
}

