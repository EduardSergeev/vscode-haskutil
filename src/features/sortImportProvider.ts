'use strict';

import { CodeActionProvider, Disposable, TextDocument, Range, CodeActionContext, CancellationToken, CodeAction, WorkspaceEdit, CodeActionKind, Diagnostic, DiagnosticSeverity } from 'vscode';
import * as vscode from 'vscode';
import ImportDeclaration from './importProvider/importDeclaration';


export default class SortImportProvider implements CodeActionProvider
{
	private static commandId: string = 'haskell.sortImports';
  private command: Disposable;
  private diagnosticCollection: vscode.DiagnosticCollection;
  private static diagnosticCode: string = "unsortedImports";

	public activate(subscriptions: Disposable[])
	{
		this.command = vscode.commands.registerCommand(SortImportProvider.commandId, this.runCodeAction, this);
    subscriptions.push(this);

    this.diagnosticCollection = vscode.languages.createDiagnosticCollection();
		vscode.workspace.onDidOpenTextDocument(this.checkImports, this, subscriptions);
    vscode.workspace.onDidCloseTextDocument(doc => this.diagnosticCollection.delete(doc.uri), null, subscriptions);
		vscode.workspace.onDidSaveTextDocument(this.checkImports, this);
    vscode.workspace.textDocuments.forEach(this.checkImports, this);
  }

	public dispose(): void
	{
		this.diagnosticCollection.clear();
    this.diagnosticCollection.dispose();
    this.command.dispose();
  }
  
  private checkImports(document: TextDocument)
  {
    const imports = ImportDeclaration.getImports(document.getText());
    let pred = "";
    for (const imp of imports)
    {
      if (imp.module < pred)
      {
        const lastImport = imports[imports.length - 1];
        const range = new Range(
          document.positionAt(imports[0].offset),
          document.positionAt(lastImport.offset + lastImport.length));
        const message = "Unsorted imports";
        const diagnostic = new Diagnostic(range, message, DiagnosticSeverity.Hint);
        diagnostic.code = SortImportProvider.diagnosticCode;
        this.diagnosticCollection.set(document.uri, [diagnostic]);
        return;
      }
      pred = imp.module;
    }
    this.diagnosticCollection.delete(document.uri);
  } 

	public async provideCodeActions(document: TextDocument, range: Range, context: CodeActionContext, token: CancellationToken): Promise<CodeAction[]>
  {
		let codeActions = [];
    for (let diagnostic of context.diagnostics.filter(d => d.code === SortImportProvider.diagnosticCode))
    {
      let title = "Sort imports";
      let codeAction = new CodeAction(title, CodeActionKind.QuickFix);
      codeAction.command = {
        title: title,
        command: SortImportProvider.commandId,
        arguments: [
          document
        ]
      };
      codeAction.diagnostics = [diagnostic];
      codeActions.push(codeAction);
    }
    return codeActions;
	}

	private runCodeAction(document: TextDocument): Thenable<boolean>
  {
    const oldImports = ImportDeclaration.getImports(document.getText());
    const newImports = oldImports.map(i => i).sort((l, r) => l.module.localeCompare(r.module));
    var edit = new WorkspaceEdit();
    for (let i = oldImports.length - 1; i >= 0; i--)
    {
      edit.delete(document.uri, oldImports[i].getRange(document));
      edit.insert(document.uri, oldImports[i].getRange(document).start, newImports[i].text);
    }
    return vscode.workspace.applyEdit(edit);
	}
}
