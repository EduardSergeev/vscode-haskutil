import * as vscode from 'vscode';
import { Range, Position, CodeAction, TextDocument, Disposable } from 'vscode';
import { assert } from 'chai';


export async function runQuickfixTest(beforePath: string, afterPath: string, diagnosticCount: number, ...titles: string[]) {
  const doc = await didChangeDiagnostics(beforePath, diagnosticCount, async () => {
    const doc = await vscode.workspace.openTextDocument(beforePath);
    await vscode.window.showTextDocument(doc);
    return doc;
  });
  const quickFixes = await getQuickFixes(doc).then(qfs =>
    qfs.filter(qf => !titles.length || titles.includes(qf.title)));
  assert.isNotEmpty(quickFixes);

  await runQuickFixes(quickFixes);
  
  const after = await vscode.workspace.openTextDocument(afterPath);
  assert.strictEqual(doc.getText(), after.getText());
  await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
}

export async function getQuickFixes(doc : TextDocument): Promise<CodeAction[]> {
  return await vscode.commands.executeCommand(
    'vscode.executeCodeActionProvider',
    doc.uri,
    new Range(new Position(0,0), new Position(doc.lineCount - 1, 0))
  );
}

export async function runQuickFixes(quickFixes: CodeAction[]) {
  for(const quickFix of quickFixes) {
    console.log(`Executing: '${quickFix.title}'`);
    await vscode.commands.executeCommand(
      quickFix.command.command,
      ...quickFix.command.arguments
    );
  }
}

export async function didChangeDiagnostics<T>(fsPath: string, count: number, action: () => Thenable<T>): Promise<T> {
  return didEvent(
    vscode.languages.onDidChangeDiagnostics,
    e => {
      const uri = e.uris.find(uri => uri.fsPath === fsPath);
      return uri && vscode.languages.getDiagnostics(uri).length >= count;
    },
    action);
}


export async function didEvent<TResult, TEvent>(
  subscribe: (arg: (event: TEvent) => void) => Disposable, predicate: (event: TEvent) => Boolean,
  action: () => Thenable<TResult>): Promise<TResult> {
  return new Promise<TResult>(async (resolve, _) => {
    const result = action();
    const disposable = subscribe(async e => {
      if(predicate(e)) {
        disposable.dispose();
        resolve(await result);
      }
    });
  });
}

export async function outputGHCiLog() {
    vscode.window.onDidChangeVisibleTextEditors(editors => {
      for (const editor of editors) {
        if (editor.document.fileName.startsWith('extension-output')) {
          const firstLine = editor.document.lineAt(0).text;
          if (!firstLine || firstLine.startsWith('Starting GHCi with')) {
            console.log(`\nGHCi Output:\n\n${editor.document.getText()}`);
          }
        }
      }
    }, this);
    await vscode.commands.executeCommand('vscode-ghc-simple.openOutput');
}
