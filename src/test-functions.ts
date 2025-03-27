import sharp from 'sharp';
import { TestResults, ProcessResult } from './types';
import { DEFAULT_CONFIG } from './config';
import { calculateStatsForASample } from './utils';
import { processWithBuffer, processWithStream, processWithPath } from './processors';

// Test Runner
async function runTestIterations(
    processFn: () => Promise<ProcessResult>,
    methodName: string,
    iterations: number = DEFAULT_CONFIG.TEST_ITERATIONS
): Promise<TestResults> {
    console.log(`\nTesting with ${methodName} method:`);
    const results: ProcessResult[] = [];

    for (let i = 0; i < iterations; i++) {
        // Clear Sharp's cache before each iteration
        sharp.cache(false);
        const result = await processFn();
        results.push(result);

        // Show progress every 100 iterations
        if ((i + 1) % 100 === 0) {
            const progress = (((i + 1) / iterations) * 100).toFixed(1);
            const avgTime = results.slice(-100).reduce((a, b) => a + b.time, 0) / 100;
            console.log(`Progress: ${progress}% | Last 100 avg: ${avgTime.toFixed(2)}ms`);
        }
    }

    const times = results.map(r => r.time);
    return {
        avgTime: times.reduce((a, b) => a + b, 0) / iterations,
        minTime: Math.min(...times),
        maxTime: Math.max(...times),
        memorySamples: calculateStatsForASample(results.flatMap(r => r.samples)),
        rawResults: results,
    };
}

// Public API
export async function runBufferTest(inputPath: string): Promise<TestResults> {
    return runTestIterations(
        () => processWithBuffer({
            inputPath,
            width: DEFAULT_CONFIG.IMAGE_SIZE,
            fit: DEFAULT_CONFIG.FIT,
            withoutEnlargement: DEFAULT_CONFIG.WITHOUT_ENLARGEMENT,
        }),
        'buffer'
    );
}

export async function runStreamTest(inputPath: string): Promise<TestResults> {
    return runTestIterations(
        () => processWithStream({
            inputPath,
            width: DEFAULT_CONFIG.IMAGE_SIZE,
            fit: DEFAULT_CONFIG.FIT,
            withoutEnlargement: DEFAULT_CONFIG.WITHOUT_ENLARGEMENT,
        }),
        'stream'
    );
}

export async function runPathTest(inputPath: string, outputPath: string): Promise<TestResults> {
    return runTestIterations(
        () => processWithPath({
            inputPath,
            outputPath,
            width: DEFAULT_CONFIG.IMAGE_SIZE,
            fit: DEFAULT_CONFIG.FIT,
            withoutEnlargement: DEFAULT_CONFIG.WITHOUT_ENLARGEMENT,
        }),
        'path'
    );
}

