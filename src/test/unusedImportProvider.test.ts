import * as path from 'path';
import { runQuickfixTest, outputGHCiLog } from './utils';


suite("UnusedImportProvider", function () {
  test("Remove unused imports", async () => {
    const before = path.join(__dirname, '../../input/UnusedImportProvider.hs');
    const after = path.join(__dirname, '../../input/UnusedImportProvider_after.hs');
    await runQuickfixTest(before, after, 1);
  });

  teardown(async () => {
    if(this.ctx.currentTest.isFailed()) {
      await outputGHCiLog();
    }
  });
});
