'use strict';

import { CodeActionProvider, Disposable, TextDocument, Range, CodeActionContext, CancellationToken, CodeAction, WorkspaceEdit, CodeActionKind, Diagnostic, DiagnosticSeverity, WorkspaceConfiguration, TextDocumentWillSaveEvent } from 'vscode';
import * as vscode from 'vscode';
import ImportDeclaration from './importProvider/importDeclaration';


export default class SortImportProvider implements CodeActionProvider
{
	public static commandId: string = 'haskell.sortImports';
  private command: Disposable;
  private diagnosticCollection: vscode.DiagnosticCollection;
  private static diagnosticCode: string = "unsortedImports";

  
  private static get shouldAlignImports(): boolean
  {
    return SortImportProvider.configuration.get("alignImports");
  }

  private static get shouldPadImports(): boolean
  {
    return SortImportProvider.configuration.get("alwaysPadImports");
  }

  private static get shouldSortImports(): boolean
  {
    return SortImportProvider.configuration.get("sortImports");
  }

  private static get shouldOrganizeImportsOnSave(): boolean
  {
    return SortImportProvider.configuration.get("organiseImportsOnSave");
  }

  private static get configuration(): WorkspaceConfiguration
  {
    return vscode.workspace.getConfiguration("haskutil");
  }  

  
	public activate(subscriptions: Disposable[])
	{
		this.command = vscode.commands.registerCommand(SortImportProvider.commandId, this.runCodeAction, this);
    subscriptions.push(this);

    this.diagnosticCollection = vscode.languages.createDiagnosticCollection();
		vscode.workspace.onDidOpenTextDocument(this.checkImports, this, subscriptions);
    vscode.workspace.onDidCloseTextDocument(doc => this.diagnosticCollection.delete(doc.uri), null, subscriptions);
    vscode.workspace.onDidSaveTextDocument(this.checkImports, this);
    vscode.workspace.onWillSaveTextDocument(this.ensureOrganized, this);
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
    let messages = [];
    
    const aligned =
      imports.length === 0 || (
        (SortImportProvider.shouldPadImports ||
          imports.some(imp => imp.qualified.trim() === "qualified")
        ) &&
        imports.every(imp => imp.qualified.length === " qualified ".length)
      ) || (
        !SortImportProvider.shouldPadImports &&
        imports.every(imp => imp.qualified.trim() === "") &&
        imports.every(imp => imp.qualified.length === " ".length)
      );
    if (!aligned && SortImportProvider.shouldAlignImports)
    {
      messages = ["not aligned"];
    }

    let pred = "";
    if (SortImportProvider.shouldSortImports)
    {
      for (const imp of imports)
      {
        const curr = imp.module + (imp.importList || "");
        if (curr < pred)
        {
          messages.unshift("unsorted");
          break;
        }
        pred = curr;
      }
    }

    if (messages.length > 0)
    {
      const lastImport = imports[imports.length - 1];
      const range = new Range(
        document.positionAt(imports[0].offset),
        document.positionAt(lastImport.offset + lastImport.length));
      const message = `Imports are ${messages.join(" and ")}`;
      const diagnostic = new Diagnostic(range, message, DiagnosticSeverity.Hint);
      diagnostic.code = SortImportProvider.diagnosticCode;
      this.diagnosticCollection.set(document.uri, [diagnostic]);
    }
    else
    {
      this.diagnosticCollection.delete(document.uri);
    }
  } 

	public async provideCodeActions(document: TextDocument, range: Range, context: CodeActionContext, token: CancellationToken): Promise<CodeAction[]>
  {
		let codeActions = [];
    for (let diagnostic of context.diagnostics.filter(d => d.code === SortImportProvider.diagnosticCode))
    {
      let title = "Organize imports";
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
    let newImports = oldImports.map(i => i);
    if (SortImportProvider.shouldSortImports)
    {
      newImports.sort((l, r) => (l.module + (l.importList || "")).localeCompare(r.module + (r.importList || "")));
    }
    if (SortImportProvider.shouldAlignImports)
    {
      newImports = SortImportProvider.alignImports(newImports);
    }

    var edit = new WorkspaceEdit();
    for (let i = oldImports.length - 1; i >= 0; i--)
    {
      edit.delete(document.uri, oldImports[i].getRange(document));
      edit.insert(document.uri, oldImports[i].getRange(document).start, newImports[i].text);
    }
    return vscode.workspace.applyEdit(edit);
  }

  private ensureOrganized(event: TextDocumentWillSaveEvent)
  {
    if (SortImportProvider.shouldOrganizeImportsOnSave)
    {
      event.waitUntil(this.runCodeAction(event.document));
    }
  }

  public static ensureAligned(newImport: ImportDeclaration, existingImports: ImportDeclaration[]): ImportDeclaration
  {
    if (SortImportProvider.shouldAlignImports)
    {
      let allImports = existingImports.map(imp => imp);
      allImports.unshift(newImport);
      SortImportProvider.alignImports(allImports);
    }
    return newImport;
  }

  private static alignImports(imports: ImportDeclaration[]): ImportDeclaration[]
  {
    const isQualified = imp => imp.qualified.trim() === "qualified";

    return SortImportProvider.shouldPadImports || imports.some(isQualified) ?
      imports.map(imp =>
      {
        if (isQualified(imp))
        {
          imp.qualified = " qualified ";
        }
        else
        {
          imp.qualified = "           ";
        }
        return imp;
      }) :
      imports.map(imp =>
      {
        imp.qualified = " ";
        return imp;
      });
  }
}
