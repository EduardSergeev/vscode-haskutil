import * as path from 'path';
import { runQuickfixTest, outputGHCiLog } from './utils';


suite("TypeWildcardProvider", function () {
  test("Replace wildcard with suggested type", async () => {
    const before = path.join(__dirname, '../../input/TypeHoleProvider.hs');
    const after = path.join(__dirname, '../../input/TypeHoleProvider_after.hs');
    await runQuickfixTest(before, after, 3);
  });
  
  teardown(async () => {
    if(this.ctx.currentTest.isFailed()) {
      await outputGHCiLog();
    }
  });
});
