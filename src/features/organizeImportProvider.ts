'use strict';

import { CodeActionProvider, Disposable, TextDocument, Range, CodeActionContext, CancellationToken, CodeAction, WorkspaceEdit, CodeActionKind, Diagnostic, DiagnosticSeverity, WorkspaceConfiguration, TextDocumentWillSaveEvent } from 'vscode';
import * as vscode from 'vscode';
import ImportDeclaration from './importProvider/importDeclaration';


export default class OrganizeImportProvider implements CodeActionProvider {
  public static commandId: string = 'haskell.organizeImports';
  private command: Disposable;
  private diagnosticCollection: vscode.DiagnosticCollection;
  private static diagnosticCode: string = "haskutil.unorganizedImports";


  private static get shouldAlignImports(): boolean {
    return OrganizeImportProvider.configuration.get("alignImports");
  }

  private static get shouldPadImports(): boolean {
    return OrganizeImportProvider.configuration.get("alwaysPadImports");
  }

  private static get shouldSortImports(): boolean {
    return OrganizeImportProvider.configuration.get("sortImports");
  }

  private static get shouldOrganizeImportsOnSave(): boolean {
    return OrganizeImportProvider.configuration.get("organiseImportsOnSave");
  }

  private static get configuration(): WorkspaceConfiguration {
    return vscode.workspace.getConfiguration("haskutil");
  }


  public activate(subscriptions: Disposable[]) {
    this.command = vscode.commands.registerCommand(OrganizeImportProvider.commandId, this.runCodeAction, this);
    subscriptions.push(this);

    this.diagnosticCollection = vscode.languages.createDiagnosticCollection();
    vscode.workspace.onDidOpenTextDocument(this.checkImports, this, subscriptions);
    vscode.workspace.onDidCloseTextDocument(doc => this.diagnosticCollection.delete(doc.uri), null, subscriptions);
    vscode.workspace.onDidSaveTextDocument(this.checkImports, this);
    vscode.workspace.onWillSaveTextDocument(this.ensureOrganized, this);
    vscode.workspace.textDocuments.forEach(this.checkImports, this);

    if (!this.checkDependencyInstalled()) {
      vscode.window.showWarningMessage(
        "Dependent extension which populates diagnostics (Errors and Warnings) is not installed.\n" +
        "Please install either [Simple GHC](https://marketplace.visualstudio.com/items?itemName=dramforever.vscode-ghc-simple) " +
        "or [Haskero](https://marketplace.visualstudio.com/items?itemName=Vans.haskero) ");
    }
  }

  public dispose(): void {
    this.diagnosticCollection.clear();
    this.diagnosticCollection.dispose();
    this.command.dispose();
  }

  private checkDependencyInstalled() {
    const dependency =
      vscode.extensions.getExtension('dramforever.vscode-ghc-simple') ||
      vscode.extensions.getExtension('Vans.haskero');
    return dependency !== undefined;
  }

  private checkImports(document: TextDocument) {
    const imports = ImportDeclaration.getImports(document.getText());
    let messages = [];

    const aligned =
      imports.length === 0 || (
        (OrganizeImportProvider.shouldPadImports ||
          imports.some(imp => imp.qualified.trim() === "qualified")
        ) &&
        imports.every(imp => imp.qualified.length === " qualified ".length)
      ) || (
        !OrganizeImportProvider.shouldPadImports &&
        imports.every(imp => imp.qualified.trim() === "") &&
        imports.every(imp => imp.qualified.length === " ".length)
      );
    if (!aligned && OrganizeImportProvider.shouldAlignImports) {
      messages = ["not aligned"];
    }

    let pred = "";
    if (OrganizeImportProvider.shouldSortImports) {
      for (const imp of imports) {
        const curr = imp.module + (imp.importList || "");
        if (curr < pred) {
          messages.unshift("unsorted");
          break;
        }
        pred = curr;
      }
    }

    if (messages.length > 0) {
      const lastImport = imports[imports.length - 1];
      const range = new Range(
        document.positionAt(imports[0].offset),
        document.positionAt(lastImport.offset + lastImport.length));
      const message = `Imports are ${messages.join(" and ")}`;
      const diagnostic = new Diagnostic(range, message, DiagnosticSeverity.Hint);
      diagnostic.code = OrganizeImportProvider.diagnosticCode;
      this.diagnosticCollection.set(document.uri, [diagnostic]);
    }
    else {
      this.diagnosticCollection.delete(document.uri);
    }
  }

  public async provideCodeActions(document: TextDocument, range: Range, context: CodeActionContext, token: CancellationToken): Promise<CodeAction[]> {
    let codeActions = [];
    for (let diagnostic of context.diagnostics.filter(d => d.code === OrganizeImportProvider.diagnosticCode)) {
      let title = "Organize imports";
      let codeAction = new CodeAction(title, CodeActionKind.QuickFix);
      codeAction.command = {
        title: title,
        command: OrganizeImportProvider.commandId,
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
    const oldImports = ImportDeclaration.getImports(document.getText());
    let newImports = oldImports.map(i => i);
    if (OrganizeImportProvider.shouldSortImports) {
      newImports.sort((l, r) => (l.module + (l.importList || "")).localeCompare(r.module + (r.importList || "")));
    }
    if (OrganizeImportProvider.shouldAlignImports) {
      newImports = OrganizeImportProvider.alignImports(newImports);
    }

    var edit = new WorkspaceEdit();
    for (let i = oldImports.length - 1; i >= 0; i--) {
      edit.delete(document.uri, oldImports[i].getRange(document));
      edit.insert(document.uri, oldImports[i].getRange(document).start, newImports[i].text);
    }
    return vscode.workspace.applyEdit(edit);
  }

  private ensureOrganized(event: TextDocumentWillSaveEvent) {
    if (OrganizeImportProvider.shouldOrganizeImportsOnSave) {
      event.waitUntil(this.runCodeAction(event.document));
    }
  }

  public static ensureAligned(newImport: ImportDeclaration, existingImports: ImportDeclaration[]): ImportDeclaration {
    if (OrganizeImportProvider.shouldAlignImports) {
      let allImports = existingImports.map(imp => imp);
      allImports.unshift(newImport);
      OrganizeImportProvider.alignImports(allImports);
    }
    return newImport;
  }

  private static alignImports(imports: ImportDeclaration[]): ImportDeclaration[] {
    const isQualified = imp => imp.qualified.trim() === "qualified";

    return OrganizeImportProvider.shouldPadImports || imports.some(isQualified) ?
      imports.map(imp => {
        if (isQualified(imp)) {
          imp.qualified = " qualified ";
        }
        else {
          imp.qualified = "           ";
        }
        return imp;
      }) :
      imports.map(imp => {
        imp.qualified = " ";
        return imp;
      });
  }
}
