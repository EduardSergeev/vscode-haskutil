'use strict';

import { CodeActionProvider, Disposable, TextDocument, Range, CodeActionContext, CancellationToken, CodeAction, WorkspaceEdit, CodeActionKind, Diagnostic, DiagnosticSeverity, DiagnosticChangeEvent } from 'vscode';
import * as vscode from 'vscode';
import ImportDeclaration from './importProvider/importDeclaration';


export default class RemoveUnusedImportProvider implements CodeActionProvider {
  public static commandId: string = 'haskell.removeUnusedImports';
  private command: Disposable;
  private diagnosticCollection: vscode.DiagnosticCollection;
  private static diagnosticCode: string = "haskutil.unusedImports";

  public activate(subscriptions: Disposable[]) {
    this.command = vscode.commands.registerCommand(RemoveUnusedImportProvider.commandId, this.runCodeAction, this);
    subscriptions.push(this);
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection();
    vscode.languages.onDidChangeDiagnostics(this.didChangeDiagnostics, this, subscriptions);
  }

  public dispose(): void {
    this.diagnosticCollection.clear();
    this.diagnosticCollection.dispose();
    this.command.dispose();
  }

  private async didChangeDiagnostics(e: DiagnosticChangeEvent) {
    for (const uri of e.uris) {
      const document = await vscode.workspace.openTextDocument(uri);
      const unusedImports = this.getUnusedImports(document);
      if (unusedImports.length > 0 && !this.diagnosticCollection.has(uri)) {
        const imports = ImportDeclaration.getImports(document.getText());
        const lastImport = imports[imports.length - 1];
        const range = new Range(
          document.positionAt(imports[0].offset),
          document.positionAt(lastImport.offset + lastImport.length));
        const message = "There are unused imports which can be deleted";
        const diagnostic = new Diagnostic(range, message, DiagnosticSeverity.Hint);
        diagnostic.code = RemoveUnusedImportProvider.diagnosticCode;
        this.diagnosticCollection.set(document.uri, [diagnostic]);
      }
      else if (unusedImports.length === 0 && this.diagnosticCollection.has(uri)) {
        this.diagnosticCollection.delete(document.uri);
      }
    }
  }

  public async provideCodeActions(document: TextDocument, range: Range, context: CodeActionContext, token: CancellationToken): Promise<CodeAction[]> {
    let codeActions = [];
    for (let diagnostic of context.diagnostics.filter(d => d.code === RemoveUnusedImportProvider.diagnosticCode)) {
      let title = "Remove unused imports";
      let codeAction = new CodeAction(title, CodeActionKind.QuickFix);
      codeAction.command = {
        title: title,
        command: RemoveUnusedImportProvider.commandId,
        arguments: [
          document
        ]
      };
      codeAction.diagnostics = [diagnostic];
      codeActions.push(codeAction);
    }
    return codeActions;
  }

  private runCodeAction(document: TextDocument): Thenable<boolean> {
    const edit = new WorkspaceEdit();
    const imports = ImportDeclaration.getImports(document.getText());
    for (const [range, start,,, list] of this.getUnusedImports(document)) {
      let oldImport = imports.find(i => i.offset === start);
      if(list) {
        list.split(",").forEach(e => oldImport.removeElement(e.trim()));
        const oldRange = new Range(
          document.positionAt(oldImport.offset),
          document.positionAt(oldImport.offset + oldImport.length));
        edit.replace(document.uri, oldRange, oldImport.text);
      } else {
        edit.delete(document.uri, range.with({ end: range.end.with(range.end.line + 1, 0) }));
      }
    }
    return vscode.workspace.applyEdit(edit);
  }

  private getUnusedImports(document: TextDocument): [Range, number, ...string[]][] {
    const diagnostics = vscode.languages.getDiagnostics(document.uri);
    return diagnostics
      .map(d => [
        d.range,
        d.message.match(/The (qualified )?import of (?:[`‘](.+?)['’]\s+from module )?[`‘](.+?)['’] is redundant/m)
      ] as const)
      .filter(([,m]) => m)
      .map(([range, match]) => [
        range,
        document.offsetAt(range.start),
        ...match
      ]);
  }
}
