import * as path from 'path';
import { runQuickfixTest, outputGHCiLog } from './utils';


suite("OrganizeImportProvider", function () {
  test("Organize imports", async () => {
    const before = path.join(__dirname, '../../input/OrganizeImportProvider.hs');
    const after = path.join(__dirname, '../../input/OrganizeImportProvider_after.hs');
    await runQuickfixTest(before, after, 1);
  });

  teardown(async () => {
    if(this.ctx.currentTest.isFailed()) {
      await outputGHCiLog();
    }
  });
});
