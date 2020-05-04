import * as path from 'path';
import { runQuickfixTest, outputGHCiLog } from './utils';


suite("ExtensionProvider", function () {
  test("Add missing extension", async () => {
    const before = path.join(__dirname, '../../input/TopLevelSignatureProvider.hs');
    const after = path.join(__dirname, '../../input/TopLevelSignatureProvider_after.hs');
    await runQuickfixTest(before, after, 1);
  });

  teardown(async () => {
    if(this.ctx.currentTest.isFailed()) {
      await outputGHCiLog();
    }
  });
});
