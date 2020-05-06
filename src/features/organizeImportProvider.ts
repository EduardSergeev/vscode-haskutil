import { CodeActionProvider, Disposable, TextDocument, Range, CodeActionContext, CancellationToken, CodeAction, WorkspaceEdit, CodeActionKind, Diagnostic, DiagnosticSeverity, WorkspaceConfiguration, TextDocumentWillSaveEvent } from 'vscode';
import * as vscode from 'vscode';
import ImportDeclaration from './importProvider/importDeclaration';
import Configuration from '../configuration';


export default class OrganizeImportProvider implements CodeActionProvider {
  public static commandId: string = 'haskell.organizeImports';
  private diagnosticCollection: vscode.DiagnosticCollection;
  private static diagnosticCode: string = "haskutil.unorganizedImports";

  public activate(subscriptions: Disposable[]) {
    const command = vscode.commands.registerCommand(OrganizeImportProvider.commandId, this.runCodeAction, this);
    subscriptions.push(command);

    this.diagnosticCollection = vscode.languages.createDiagnosticCollection();
    subscriptions.push(this.diagnosticCollection);
    vscode.workspace.onDidOpenTextDocument(this.checkImports, this, subscriptions);
    vscode.workspace.onDidCloseTextDocument(doc => this.diagnosticCollection.delete(doc.uri), null, subscriptions);
    vscode.workspace.onDidSaveTextDocument(this.checkImports, this, subscriptions);
    vscode.workspace.onWillSaveTextDocument(this.ensureOrganized, this, subscriptions);
    vscode.workspace.textDocuments.filter(d => d.languageId === 'haskell').forEach(this.checkImports, this);
  }

  private checkImports(document: TextDocument) {
    // We subscribe to multiple events which can be fired for any language, not just `Haskell` 
    if (document.languageId !== 'haskell') {
      return;
    }
    const imports = ImportDeclaration.getImports(document.getText());
    let messages = [];

    const aligned =
      imports.length === 0 || (
        (Configuration.shouldPadImports ||
          imports.some(imp => imp.qualified.trim() === "qualified")
        ) &&
        imports.every(imp => imp.qualified.length === " qualified ".length)
      ) || (
        !Configuration.shouldPadImports &&
        imports.every(imp => imp.qualified.trim() === "") &&
        imports.every(imp => imp.qualified.length === " ".length)
      );
    if (!aligned && Configuration.shouldAlignImports) {
      messages = ["not aligned"];
    }

    let pred = "";
    if (Configuration.shouldSortImports) {
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
    if (Configuration.shouldSortImports) {
      newImports.sort((l, r) => {
        const ls = l.module + (l.importList || "");
        const rs = r.module + (r.importList || "");
        return ls < rs ? -1 : (ls === rs ? 0 : 1);
      });
    }
    if (Configuration.shouldAlignImports) {
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
    if (Configuration.shouldOrganizeImportsOnSave) {
      event.waitUntil(this.runCodeAction(event.document));
    }
  }

  public static ensureAligned(newImport: ImportDeclaration, existingImports: ImportDeclaration[]): ImportDeclaration {
    if (Configuration.shouldAlignImports) {
      let allImports = existingImports.map(imp => imp);
      allImports.unshift(newImport);
      OrganizeImportProvider.alignImports(allImports);
    }
    return newImport;
  }

  public static alignImports(imports: ImportDeclaration[]): ImportDeclaration[] {
    const isQualified = imp => imp.qualified.trim() === "qualified";

    return Configuration.shouldPadImports || imports.some(isQualified) ?
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
