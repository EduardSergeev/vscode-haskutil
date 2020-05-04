import * as vscode from 'vscode';
import { Range, Position, CodeAction, TextDocument } from 'vscode';
import { assert } from 'chai';


export async function runQuickfixTest(beforePath: string, afterPath: string, diagnosticCount: number) {
  const doc = await didChangeDiagnostics(beforePath, diagnosticCount, async () => {
    const doc = await vscode.workspace.openTextDocument(beforePath);
    await vscode.window.showTextDocument(doc);
    return doc;
  });
  const quickFixes = await getQuickFixes(doc);
  assert.isNotEmpty(quickFixes);

  await runQuickFixes(quickFixes);
  
  const after = await vscode.workspace.openTextDocument(afterPath);
  assert.strictEqual(doc.getText(), after.getText());
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
    console.log(`Executing: ${quickFix.title}`);
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


export async function didEvent<T, E>(
  event: (arg0: (e: E) => void) => any, predicate: (e: E) => Boolean,
  action: () => Thenable<T>): Promise<T> {
  return new Promise<T>(async (resolve, _) => {
    let result: T;
    const disposable = event(e => {
      if(predicate(e)) {
        disposable.dispose();
        resolve(result);
      }
    });
    result = await action();
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
