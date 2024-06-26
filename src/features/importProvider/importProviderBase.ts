import * as vscode from 'vscode';
import { Disposable, TextDocument, Range, WorkspaceEdit } from 'vscode';
import ExtensionProvider from '../extensionProvider';
import ImportDeclaration from './importDeclaration';
import OrganizeImportProvider from '../organizeImportProvider';
import Configuration from '../../configuration';


export interface SearchResult {
  package: string;
  module: string;
  result: string;
}

export default class ImportProviderBase {
  private static modulePattern = /^module(.|\n)+?where/m;
  private hoogleSearch: (name: string, resultCallback: HoogleSearchCallback) => void;

  constructor(protected commandId: string) {
  }

  public activate(subscriptions: Disposable[]) {
    const command = vscode.commands.registerCommand(this.commandId, this.runCodeAction, this);
    subscriptions.push(command);

    const hoogle = vscode.extensions.getExtension('jcanero.hoogle-vscode');
    const hoogleApi = hoogle.exports;
    this.hoogleSearch = hoogleApi.search;
  }

  protected search(name: string): Promise<SearchResult[]> {
    const result = new Promise<SearchResult[]>(resolve => {
      this.hoogleSearch(name, searchResult => {
        resolve(searchResult.results
          .filter(result => {
            if (!result.isModule() && !result.isPackage()) {
              const r = this.decodeHtmlEntity(result.getQueryResult());
              const i = r.indexOf(name);
              const j = i + name.length;
              return (i >= 0) &&
                (i === 0 || r[i - 1] === " " || r[i - 1] === '(') &&
                (j === r.length || r[j] === " " || r[j] === ")");
            }
            else {
              return false;
            }
          }).map(result => {
            return {
              package: result.getPackageName(),
              module: result.getModuleName().replace(/-/g, '.'),
              result: result.getQueryResult()
            };
          })
        );
      });
    });
    return result;
  }

  private decodeHtmlEntity(str: string): string {
    return str.replace(/&#(\d+);/g, (_, dec) =>
      String.fromCharCode(dec));
  }

  private async runCodeAction(document: TextDocument, moduleName: string, options: { qualified?: Boolean, alias?: string, elementName?: string } = {}): Promise<void> {
    function afterMatch(offset) {
      const position = document.positionAt(offset);
      return document.offsetAt(position.with(position.line + 1, 0));
    }

    const text = document.getText();
    let position = 0;

    for (let match, pattern = ExtensionProvider.extensionPattern; match = pattern.exec(text);) {
      position = afterMatch(match.index + match[0].length);
    }

    const match = ImportProviderBase.modulePattern.exec(text);
    if (match !== null) {
      position = afterMatch(match.index + match[0].length);
    }

    const edit = new WorkspaceEdit();

    const oldImports = ImportDeclaration.getImports(text);
    const oldImport =
      oldImports.find(decl => decl.module === moduleName && decl.importList !== null) ||
      oldImports.find(decl => decl.module === moduleName);
    if (oldImport && options.elementName) {
      oldImport.addImportElement(options.elementName);
      const oldRange = new Range(
        document.positionAt(oldImport.offset),
        document.positionAt(oldImport.offset + oldImport.length));
      edit.replace(document.uri, oldRange, oldImport.text);
    }
    else {
      for (const importInfo of oldImports) {
        if (importInfo.module + (importInfo.importList || "") > moduleName) {
          position = importInfo.offset;
          break;
        }
        position = afterMatch(importInfo.offset + importInfo.length);
      }
      const importDeclaration = new ImportDeclaration(moduleName);
      if (options.qualified) {
        importDeclaration.qualified = " qualified ";
        if (options.alias) {
          importDeclaration.alias = options.alias;
        }
      }
      if (options.elementName) {
        importDeclaration.addImportElement(options.elementName);
      }

      // Align import if necessary
      OrganizeImportProvider.ensureAligned(importDeclaration, oldImports);

      edit.insert(document.uri, document.positionAt(position), importDeclaration.text + "\n");
    }

    await vscode.workspace.applyEdit(edit);
    if(Configuration.shouldOrganiseImportsOnInsert) {
      await vscode.commands.executeCommand(OrganizeImportProvider.commandId, document);
    }
  }
}

interface HoogleSearchCallback {
  (result: { results: HoogleResult[] }): void;
}

interface HoogleResult {
  isModule(): boolean;
  isPackage(): boolean;
  getPackageName(): string;
  getModuleName(): string;
  getQueryResult(): string;
}
