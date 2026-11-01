import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

export const requireTool = createRequire(new URL('../../../Tools/tcgcardgame/package.json', import.meta.url));
export const repoRoot = fileURLToPath(new URL('../', import.meta.url));
