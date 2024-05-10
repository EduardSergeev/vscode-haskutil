import * as vscode from 'vscode';
import { CodeActionProvider, Disposable, TextDocument, Range, CodeActionContext, CancellationToken, CodeAction, WorkspaceEdit, CodeActionKind } from 'vscode';
import OrganizeExtensionProvider from './organizeExtensionProvider';
import Configuration from '../configuration';


export default class ExtensionProvider implements CodeActionProvider {
  private static commandId: string = 'haskell.addExtension';

  public static get extensionPattern() {
    return /^{-#\s+LANGUAGE\s+([^#]+)#-}/gm;
  }

  public activate(subscriptions: Disposable[]) {
    const command = vscode.commands.registerCommand(ExtensionProvider.commandId, this.runCodeAction, this);
    subscriptions.push(command);
  }

  public provideCodeActions(document: TextDocument, range: Range, context: CodeActionContext, token: CancellationToken): CodeAction[] {
    const codeActions = [];
    for (const diagnostic of context.diagnostics) {
      for (const extension of Configuration.supportedExtensions) {
        if (!diagnostic.message.includes(extension)) {
          continue;
        }

        const line = `{-# LANGUAGE ${extension} #-}`;
        const title = `Add: ${line}`;
        if (codeActions.findIndex(a => a.title === title) !== -1) {
          continue;
        }

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

    if (Configuration.shouldOrganiseExtensionOnInsert) {
      await vscode.commands.executeCommand(OrganizeExtensionProvider.commandId, document);
    }
  }
}
