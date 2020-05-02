import * as vscode from 'vscode';
import * as assert from 'assert';
import * as path from 'path';


suite("OrganizeImportProvider", function () {
  test("Organize imports", async () => {
    const doc = await vscode.workspace.openTextDocument(
      path.join(__dirname, '../../input/OrganizeImportProvider.hs')
    );
    await vscode.window.showTextDocument(doc);

    await new Promise<void>((resolve, _) =>
      setTimeout(_ => resolve(), 2000)
    );

    await vscode.commands.executeCommand('haskell.organizeImports', doc);
    
    const after = await vscode.workspace.openTextDocument(
      path.join(__dirname, '../../input/OrganizeImportProvider_after.hs')
    );
    assert.strictEqual(doc.getText(), after.getText());
  });
});
