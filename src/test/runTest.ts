import * as cp from 'child_process';
import * as path from 'path';

import {
  runTests,
  downloadAndUnzipVSCode,
  resolveCliPathFromVSCodeExecutablePath
} from 'vscode-test';

async function main() {
  try {
    // The folder containing the Extension Manifest package.json
    // Passed to `--extensionDevelopmentPath`
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');

    // The path to the extension test runner script
    // Passed to --extensionTestsPath
    const extensionTestsPath = __dirname;

    const vscodeExecutablePath = await downloadAndUnzipVSCode('1.48.0');
    const cliPath = resolveCliPathFromVSCodeExecutablePath(vscodeExecutablePath);

    // Install dependent extensions
    const dependencies = [
      'jcanero.hoogle-vscode',
      'dramforever.vscode-ghc-simple'
    ];

    const extensionsDir = path.resolve(path.dirname(cliPath), '..', 'extensions');

    for(const extension of dependencies) {
      cp.spawnSync(cliPath, ['--extensions-dir', extensionsDir, '--install-extension', extension], {
        encoding: 'utf-8',
        stdio: 'inherit'
      });
    }
    
    // Download VS Code, unzip it and run the integration test
    const result = await runTests({
      vscodeExecutablePath,
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [
        '--new-window',
        '--disable-gpu',
        '--disable-updates',
        '--extensions-dir', extensionsDir,
        '--logExtensionHostCommunication',
        '--skip-getting-started',
        '--skip-release-notes',
        '--disable-restore-windows',
        '--disable-telemetry',
      ]
    });
    return result;
  } catch (err) {
    console.error(err);
    console.error('Failed to run tests');
    return 1;
  }
}

main();
