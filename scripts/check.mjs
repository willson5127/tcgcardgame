import { spawnSync } from 'node:child_process';
import { requireTool, repoRoot } from './toolchain.mjs';

const result = spawnSync(process.execPath, [requireTool.resolve('typescript/bin/tsc'), '--project', 'jsconfig.json'], {
  cwd: repoRoot, stdio: 'inherit',
});
process.exitCode = result.status ?? 1;
