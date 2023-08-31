import * as vscode from 'vscode';
import { runQuickfixTest, withTestDocument } from './utils';
import { DiagnosticSeverity } from 'vscode';

const configs = {
  'haskutil.supportedDependencies': [{
    id: 'invalid.id',
    name: 'Some name'
  }],
};

suite('', () => {
  suiteSetup(async () => {
    const config = vscode.workspace.getConfiguration();
    for (const setting in configs) { 
      await config.update(setting, configs[setting], true);
    }
  });
  
  test('Supported dependent extension check', () => {
    return withTestDocument('OK.hs', [DiagnosticSeverity.Hint, 0], async doc => {
      const d = doc;
    });
  });

  suiteTeardown(async () => {
    const config = vscode.workspace.getConfiguration();
    for (const setting in configs) { 
      await config.update(setting, undefined, true);
    }
  });
});
