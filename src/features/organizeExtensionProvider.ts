'use strict';

import { CodeActionProvider, Disposable, TextDocument, Range, CodeActionContext, CancellationToken, CodeAction, WorkspaceEdit, CodeActionKind, Diagnostic, DiagnosticSeverity, WorkspaceConfiguration, TextDocumentWillSaveEvent } from 'vscode';
import * as vscode from 'vscode';
import ExtensionDeclaration from './extensionProvider/extensionDeclaration';
import { documentInScope } from './utils';


export default class OrganizeExtensionProvider implements CodeActionProvider {
  public static commandId: string = 'haskell.organizeExtensions';
  private command: Disposable;
  private diagnosticCollection: vscode.DiagnosticCollection;
  private static diagnosticCode: string = "haskutil.unorganizedExtensions";

  private static get shouldSplitExtensions(): boolean {
    return OrganizeExtensionProvider.configuration.get("splitExtensions");
  }

  private static get shouldAlignExtensions(): boolean {
    return OrganizeExtensionProvider.configuration.get("alignExtensions");
  }

  private static get shouldSortExtensions(): boolean {
    return OrganizeExtensionProvider.configuration.get("sortExtensions");
  }

  private static get shouldOrganizeExtensionsOnSave(): boolean {
    return OrganizeExtensionProvider.configuration.get("organiseExtensionOnSave");
  }

  private static get configuration(): WorkspaceConfiguration {
    return vscode.workspace.getConfiguration("haskutil");
  }


  public activate(subscriptions: Disposable[]) {
    this.command = vscode.commands.registerCommand(OrganizeExtensionProvider.commandId, this.runCodeAction, this);
    subscriptions.push(this);

    this.diagnosticCollection = vscode.languages.createDiagnosticCollection();
    vscode.workspace.onDidOpenTextDocument(this.checkExtensions, this, subscriptions);
    vscode.workspace.onDidCloseTextDocument(doc => this.diagnosticCollection.delete(doc.uri), null, subscriptions);
    vscode.workspace.onDidSaveTextDocument(this.checkExtensions, this);
    vscode.workspace.onWillSaveTextDocument(this.ensureOrganized, this);
    vscode.workspace.textDocuments.forEach(this.checkExtensions, this);
  }

  public dispose(): void {
    this.diagnosticCollection.clear();
    this.diagnosticCollection.dispose();
    this.command.dispose();
  }

  private checkExtensions(document: TextDocument) {
    if (! documentInScope(document)) {
      return;
    }

    const extensions = ExtensionDeclaration.getExtensions(document.getText());

    let unorganized =
      extensions.some(extension => extension.extensionNames.length > 1);

    const aligned =
      extensions.length === 0 ||
      extensions.every(extension => extension.extensions.length === extensions[0].extensions.length);
    unorganized = unorganized || OrganizeExtensionProvider.shouldAlignExtensions && !aligned;

    let pred = "";
    if (OrganizeExtensionProvider.shouldSortExtensions) {
      for (const extension of extensions) {
        const curr = extension.extensions;
        if (curr < pred) {
          unorganized = true;
          break;
        }
        pred = curr;
      }
    }

    if (unorganized) {
      const lastExtension = extensions[extensions.length - 1];
      const range = new Range(
        document.positionAt(extensions[0].offset),
        document.positionAt(lastExtension.offset + lastExtension.length));
      const message = `Extension are unorganised`;
      const diagnostic = new Diagnostic(range, message, DiagnosticSeverity.Hint);
      diagnostic.code = OrganizeExtensionProvider.diagnosticCode;
      this.diagnosticCollection.set(document.uri, [diagnostic]);
    }
    else {
      this.diagnosticCollection.delete(document.uri);
    }
  }

  public async provideCodeActions(document: TextDocument, range: Range, context: CodeActionContext, token: CancellationToken): Promise<CodeAction[]> {
    if (! documentInScope(document)) {
      return;
    }

    let codeActions = [];
    for (let diagnostic of context.diagnostics.filter(d => d.code === OrganizeExtensionProvider.diagnosticCode)) {
      let title = "Organize extensions";
      let codeAction = new CodeAction(title, CodeActionKind.QuickFix);
      codeAction.command = {
        title: title,
        command: OrganizeExtensionProvider.commandId,
        arguments: [
          document
        ]
      };
      codeAction.diagnostics = [diagnostic];
      codeActions.push(codeAction);
    }
    return codeActions;
  }

  private async runCodeAction(document: TextDocument) {
    if (OrganizeExtensionProvider.shouldSplitExtensions) {
      await this.splitExtensions(document);
    }
    if (OrganizeExtensionProvider.shouldAlignExtensions) {
      await this.alignExtensions(document);
    }
    if (OrganizeExtensionProvider.shouldSortExtensions) {
      await this.sortExtensions(document);
    }
  }

  private ensureOrganized(event: TextDocumentWillSaveEvent) {
    if (! documentInScope(event.document)) {
      return;
    }

    if (OrganizeExtensionProvider.shouldOrganizeExtensionsOnSave) {
      event.waitUntil(this.runCodeAction(event.document));
    }
  }

  private async splitExtensions(document: TextDocument) {
    for (const extension of ExtensionDeclaration.getExtensions(document.getText()).reverse()) {
      await this.splitExtension(extension, document);
    }
  }

  private async splitExtension(extension: ExtensionDeclaration, document: TextDocument) {
    if (extension.extensionNames.length > 1) {
      const edit = new WorkspaceEdit();
      const range = extension.getRange(document);
      edit.delete(document.uri, range.with({ end: range.end.with(range.end.line + 1, 0) }));

      const extensions = extension.extensionNames.map(name =>
        new ExtensionDeclaration(extension.header, `${name} `));
      extensions.sort((l, r) => r.text.localeCompare(l.text));
      for (const newExtension of extensions) {
        edit.insert(document.uri, range.start, newExtension.text + "\n");
      }
      await vscode.workspace.applyEdit(edit);
    }
  }

  private async alignExtensions(document: TextDocument) {
    const oldExtensions = ExtensionDeclaration.getExtensions(document.getText());
    const length = Math.max(...oldExtensions.map(extension => extension.extensions.length));
    const newExtensions = oldExtensions.map(extension =>
      new ExtensionDeclaration(extension.header, extension.extensions.concat(" ".repeat(length - extension.extensions.length))));

    var edit = new WorkspaceEdit();
    for (let i = oldExtensions.length - 1; i >= 0; i--) {
      edit.delete(document.uri, oldExtensions[i].getRange(document));
      edit.insert(document.uri, oldExtensions[i].getRange(document).start, newExtensions[i].text);
    }
    await vscode.workspace.applyEdit(edit);
  }

  private async sortExtensions(document: TextDocument) {
    const oldExtensions = ExtensionDeclaration.getExtensions(document.getText());
    let newExtensions = oldExtensions.map(i => i);
    newExtensions.sort((l, r) => l.text.localeCompare(r.text));

    var edit = new WorkspaceEdit();
    for (let i = oldExtensions.length - 1; i >= 0; i--) {
      edit.delete(document.uri, oldExtensions[i].getRange(document));
      edit.insert(document.uri, oldExtensions[i].getRange(document).start, newExtensions[i].text);
    }
    await vscode.workspace.applyEdit(edit);
  }
}
