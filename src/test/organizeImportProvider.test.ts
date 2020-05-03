import * as path from 'path';
import { runQuickfixTest } from './utils';


suite("OrganizeImportProvider", function () {
  test("Organize imports", async () => {
    const before = path.join(__dirname, '../../input/OrganizeImportProvider.hs');
    const after = path.join(__dirname, '../../input/OrganizeImportProvider_after.hs');
    await runQuickfixTest(before, after, 1);
  });
});
