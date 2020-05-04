import * as path from 'path';
import { runQuickfixTest, outputGHCiLog } from './utils';


suite("QualifiedImportProvider", function () {
  // test("Add missing import qualified", async () => {
  //   const before = path.join(__dirname, '../../input/QualifiedImportProvider.hs');
  //   const after = path.join(__dirname, '../../input/QualifiedImportProvider_after.hs');
  //   await runQuickfixTest(before, after, 1, 'Add: "import qualified Data.ByteString as BS"');
  // });

  teardown(async () => {
    if(this.ctx.currentTest.isFailed()) {
      await outputGHCiLog();
    }
  });
});
