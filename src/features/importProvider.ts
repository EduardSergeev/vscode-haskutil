import { CodeActionProvider, TextDocument, Range, CodeActionContext, CancellationToken, CodeAction, CodeActionKind, DiagnosticSeverity, Diagnostic } from 'vscode';
import ImportProviderBase, { SearchResult } from './importProvider/importProviderBase';


export default class ImportProvider extends ImportProviderBase implements CodeActionProvider {
  constructor() {
    super('haskell.addImport');
  }

  public async provideCodeActions(document: TextDocument, range: Range, context: CodeActionContext, token: CancellationToken): Promise<CodeAction[]> {
    const patterns = [
      /Variable not in scope:\s+(\S+)/,
      /Not in scope: type constructor or class [`‘](\S+)['’]/
    ];
    const codeActions = await Promise.all(context.diagnostics
      .filter(d => d.severity === DiagnosticSeverity.Error)
      .flatMap(diagnostic =>
        patterns.map(pattern => pattern.exec(diagnostic.message))
        .filter(match => match && !/\w\./.test(match[1]))
        .flatMap(async ([, name]) =>
          this.addImportForVariable(document, diagnostic, name, await this.search(name))
        )
      )
    );
    return codeActions.flat();
  }

  private addImportForVariable(document: TextDocument, diagnostic: Diagnostic, variableName: string, searchResults: SearchResult[]): CodeAction[] {
    const codeActions = new Map<string, CodeAction>();
    for (const result of searchResults) {
      let title = `Add: "import ${result.module}"`;
      let codeAction = new CodeAction(title, CodeActionKind.QuickFix);
      codeAction.command = {
        title: title,
        command: this.commandId,
        arguments: [
          document,
          result.module,
        ],
      };
      codeAction.diagnostics = [diagnostic];
      codeActions.set(title, codeAction);

      const element = variableName[0] === variableName[0].toLowerCase() ? variableName : `${variableName}(..)`;
      title = `Add: "import ${result.module} (${element})"`;
      codeAction = new CodeAction(title, CodeActionKind.QuickFix);
      codeAction.command = {
        title: title,
        command: this.commandId,
        arguments: [
          document,
          result.module,
          {
            elementName: element
          }
        ]
      };
      codeAction.diagnostics = [diagnostic];
      codeActions.set(title, codeAction);
    }
    return [...codeActions.values()];
  }
}
