import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import { Range, Position, CodeAction, TextDocument, Disposable } from 'vscode';
import { assert } from 'chai';
import { promisify } from 'util';


export async function runQuickfixTest(file: string, diagnosticCount: number, ...titles: string[]) {
  const before = path.join(__dirname, '../../input/before/', file);
  const after = path.join(__dirname, '../../input/after', file);
  const doc = await didChangeDiagnostics(before, diagnosticCount, async () => {
    const doc = await vscode.workspace.openTextDocument(before);
    await vscode.window.showTextDocument(doc);
    return doc;
  });
  const diagnostics = vscode.languages.getDiagnostics(doc.uri);
  const available = await getQuickFixes(doc);
  const applicable = available.filter(qf => !titles.length || titles.includes(qf.title));
  assert.isNotEmpty(applicable, `
    Could not find any applicable QuickFixes.
    Available: '${available.map(qf => qf.title).join(', ')}'
    Requested: '${titles.join(', ')}'
    Diagnostics: '${diagnostics.map(d => d.message).join('\n')}'
  `);

  await runQuickFixes(applicable);

  await doc.save();

  const expected = await util.promisify(fs.readFile)(after, { encoding: 'utf8' });
  assert.strictEqual(doc.getText(), expected);
  await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
}

export async function warmup() {
  const before = path.join(__dirname, '../../input/Welcome.hs');
  const doc = await didChangeDiagnostics(before, 3, async () => {
    const doc = await vscode.workspace.openTextDocument(before);
    await vscode.window.showTextDocument(doc);
    return doc;
  });
  await getQuickFixes(doc);
  await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
}

export async function getQuickFixes(doc : TextDocument): Promise<CodeAction[]> {
  return await vscode.commands.executeCommand(
    'vscode.executeCodeActionProvider',
    doc.uri,
    new Range(new Position(0, 0), new Position(doc.lineCount - 1, 0))
  );
}

export async function runQuickFixes(quickFixes: CodeAction[]) {
  for(const quickFix of quickFixes) {
    console.log(`
      Executing: '${quickFix.title}'`
    );
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
      return uri && vscode.languages.getDiagnostics(uri).length === count;
    },
    action);
}


export async function didEvent<TResult, TEvent>(
  subscribe: (arg: (event: TEvent) => void) => Disposable,
  predicate: (event: TEvent) => Boolean,
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
