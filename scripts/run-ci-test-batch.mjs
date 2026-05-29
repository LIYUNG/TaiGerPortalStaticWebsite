import { execFileSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const VITEST_BIN = join(ROOT, 'node_modules', 'vitest', 'vitest.mjs');
const TOTAL_BATCHES = Number(process.argv[3] ?? 18);
const batchIndex = Number(process.argv[2]);

function collectTestFiles(dir, files = []) {
    for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        const stat = statSync(full);

        if (stat.isDirectory()) {
            if (name === 'node_modules' || name === 'i18n') {
                continue;
            }
            collectTestFiles(full, files);
            continue;
        }

        if (/\.(test|spec)\.[cm]?[tj]sx?$/.test(name)) {
            files.push(relative(ROOT, full).replace(/\\/g, '/'));
        }
    }

    return files;
}

if (
    !Number.isInteger(batchIndex) ||
    batchIndex < 1 ||
    batchIndex > TOTAL_BATCHES
) {
    console.error(
        `Usage: node scripts/run-ci-test-batch.mjs <batch 1-${TOTAL_BATCHES}> [totalBatches]`
    );
    process.exit(1);
}

const allFiles = collectTestFiles(join(ROOT, 'src')).sort();
const batchSize = Math.ceil(allFiles.length / TOTAL_BATCHES);
const start = (batchIndex - 1) * batchSize;
const batchFiles = allFiles.slice(start, start + batchSize);

if (batchFiles.length === 0) {
    console.log(`Batch ${batchIndex}/${TOTAL_BATCHES}: no files, skipping`);
    process.exit(0);
}

console.log(
    `Batch ${batchIndex}/${TOTAL_BATCHES}: running ${batchFiles.length} of ${allFiles.length} test files`
);

execFileSync(
    process.execPath,
    [
        VITEST_BIN,
        'run',
        ...batchFiles,
        '--passWithNoTests',
        '--no-file-parallelism',
        '--maxWorkers=1',
        '--reporter=dot'
    ],
    {
        stdio: 'inherit',
        env: process.env,
        cwd: ROOT
    }
);
