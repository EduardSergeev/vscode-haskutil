import * as path from 'path';
import { runQuickfixTest, outputGHCiLog } from './utils';


suite("TypeHoleProvider", function () {
  test("Replace type hole with suggested type", async () => {
    const before = path.join(__dirname, '../../input/TypeHoleProvider.hs');
    const after = path.join(__dirname, '../../input/TypeHoleProvider_after.hs');
    await runQuickfixTest(before, after, 2,
      "Fill `_' with: `True'",
      "Fill `_' with: `init'"
    );
  });
  
  teardown(async () => {
    if(this.ctx.currentTest.isFailed()) {
      await outputGHCiLog();
    }
  });
});
