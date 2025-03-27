import fs from 'fs';
import path from 'path';
import { runBufferTest, runStreamTest, runPathTest, runSequentialStreamTest } from './test-functions';
import { TestResults } from './types';

async function saveResults(method: string, results: TestResults) {
    const outputDir = path.join(__dirname, '..', 'results');
    await fs.promises.mkdir(outputDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputPath = path.join(outputDir, `${method}-${timestamp}.json`);

    await fs.promises.writeFile(outputPath, JSON.stringify(results, null, 2));

    console.log(`\nResults saved to: ${outputPath}`);
}

async function main() {
    const testDir = path.join(__dirname, '..', 'test-images');
    const outputDir = path.join(__dirname, '..', 'output');
    const testImagePath = path.join(testDir, 'bigger-image.jpg');

    // Create directories if they don't exist
    await fs.promises.mkdir(testDir, { recursive: true });
    await fs.promises.mkdir(outputDir, { recursive: true });

    // Get method from command line argument
    const method = process.argv[2];
    if (!method || !['buffer', 'stream', 'path', 'sequential-stream'].includes(method)) {
        console.error('Please specify a method: buffer, stream, path, or sequential-stream');
        process.exit(1);
    }

    console.log(`Running ${method} test...`);
    console.log(`Input image: ${testImagePath}`);

    let results: TestResults;
    switch (method) {
        case 'buffer':
            results = await runBufferTest(testImagePath);
            break;
        case 'stream':
            results = await runStreamTest(testImagePath);
            break;
        case 'path':
            results = await runPathTest(testImagePath, path.join(outputDir, 'output.jpg'));
            break;
        case 'sequential-stream':
            results = await runSequentialStreamTest(testImagePath);
            break;
        default:
            throw new Error(`Unknown method: ${method}`);
    }

    // Save results
    await saveResults(method, results);

    // Print summary
    console.log('\nTest Summary:');
    console.log(`Average Time: ${results.avgTime.toFixed(2)}ms`);
    console.log(`Min Time: ${results.minTime.toFixed(2)}ms`);
    console.log(`Max Time: ${results.maxTime.toFixed(2)}ms`);
    console.log('\nMemory Usage:');
    console.log(
        `Heap Used: ${results.memorySamples.heapUsed.avg.toFixed(2)}MB (min: ${results.memorySamples.heapUsed.min.toFixed(2)}MB, max: ${results.memorySamples.heapUsed.max.toFixed(2)}MB)`
    );
    console.log(
        `Heap Total: ${results.memorySamples.heapTotal.avg.toFixed(2)}MB (min: ${results.memorySamples.heapTotal.min.toFixed(2)}MB, max: ${results.memorySamples.heapTotal.max.toFixed(2)}MB)`
    );
    console.log(
        `External: ${results.memorySamples.external.avg.toFixed(2)}MB (min: ${results.memorySamples.external.min.toFixed(2)}MB, max: ${results.memorySamples.external.max.toFixed(2)}MB)`
    );
    console.log(
        `RSS: ${results.memorySamples.rss.avg.toFixed(2)}MB (min: ${results.memorySamples.rss.min.toFixed(2)}MB, max: ${results.memorySamples.rss.max.toFixed(2)}MB)`
    );
}

main().catch(console.error);
