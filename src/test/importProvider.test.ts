import * as path from 'path';
import { runQuickfixTest, outputGHCiLog } from './utils';


suite("ImportProvider", function () {
  test("Add missing import", async () => {
    const before = path.join(__dirname, '../../input/ImportProvider.hs');
    const after = path.join(__dirname, '../../input/ImportProvider_after.hs');
    await runQuickfixTest(before, after, 1,
      'Add: "import Data.List (sort)"',
      'Add: "import Data.Maybe"');
  });

  teardown(async () => {
    if(this.ctx.currentTest.isFailed()) {
      await outputGHCiLog();
    }
  });
});
