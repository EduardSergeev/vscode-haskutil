'use strict';

import { CodeActionProvider, Disposable, TextDocument, Range, CodeActionContext, CancellationToken, CodeAction, WorkspaceEdit, CodeActionKind, WorkspaceConfiguration } from 'vscode';
import * as vscode from 'vscode';
import OrganizeExtensionProvider from './organizeExtensionProvider';


export default class ExtensionProvider implements CodeActionProvider {
  private static commandId: string = 'haskell.addExtension';
  private command: Disposable;

  public static get extensionPattern() {
    return /^{-#\s+LANGUAGE\s+([^#]+)#-}/gm;
  }

  public activate(subscriptions: Disposable[]) {
    this.command = vscode.commands.registerCommand(ExtensionProvider.commandId, this.runCodeAction, this);
    subscriptions.push(this);
  }

  public dispose(): void {
    this.command.dispose();
  }

  private static get shouldOrganizeExtensionsOnInsert(): boolean {
    return ExtensionProvider.configuration.get("organiseExtensionOnInsert");
  }

  private static get extensions(): string[] {
    return ExtensionProvider.configuration.get("supportedExtensions");
  }

  private static get configuration(): WorkspaceConfiguration {
    return vscode.workspace.getConfiguration("haskutil");
  }

  public async provideCodeActions(document: TextDocument, range: Range, context: CodeActionContext, token: CancellationToken): Promise<any> {
    const codeActions = [];
    for (const diagnostic of context.diagnostics) {
      for (const extension of ExtensionProvider.extensions) {
        if (!diagnostic.message.includes(extension)) {
          continue;
        }

        const line = `{-# LANGUAGE ${extension} #-}`;
        const title = `Add: ${line}`;
        const codeAction = new CodeAction(title, CodeActionKind.QuickFix);
        codeAction.command = {
          title: title,
          command: ExtensionProvider.commandId,
          arguments: [
            document,
            extension,
            line
          ]
        };
        codeAction.diagnostics = [diagnostic];
        codeActions.push(codeAction);
      }
    }
    return codeActions;
  }

  private async runCodeAction(document: TextDocument, newExtension: string, extensionLine: string) {
    function afterMatch(offset) {
      const position = document.positionAt(offset);
      return document.offsetAt(position.with(position.line + 1, 0));
    }

    const text = document.getText();
    let position = 0;

    for (let match, pattern = ExtensionProvider.extensionPattern; match = pattern.exec(text);) {
      const oldExtension = match[1];
      if (oldExtension > newExtension) {
        position = match.index;
        break;
      }
      position = afterMatch(match.index + match[0].length);
    }

    const edit = new WorkspaceEdit();
    edit.insert(document.uri, document.positionAt(position), extensionLine + "\n");
    await vscode.workspace.applyEdit(edit);

    if (ExtensionProvider.shouldOrganizeExtensionsOnInsert) {
      vscode.commands.executeCommand(OrganizeExtensionProvider.commandId, document);
    }
  }
}
