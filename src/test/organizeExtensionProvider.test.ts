import * as path from 'path';
import { runQuickfixTest, outputGHCiLog } from './utils';


suite("OrganizeExtensionProvider", function () {
  test("Organize extensions", async () => {
    const before = path.join(__dirname, '../../input/OrganizeExtensionProvider.hs');
    const after = path.join(__dirname, '../../input/OrganizeExtensionProvider_after.hs');
    await runQuickfixTest(before, after, 1);
  });

  teardown(async () => {
    if(this.ctx.currentTest.isFailed()) {
      await outputGHCiLog();
    }
  });
});
