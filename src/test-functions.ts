import sharp from 'sharp';
import fs from 'fs';
import { createReadStream } from 'fs';

// Configuration
const TEST_ITERATIONS = 50;
const IMAGE_SIZE = 1920; // Width in pixels
const MEMORY_SAMPLE_INTERVAL = 100; // ms

interface MemorySample {
    timestamp: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
}

interface MemoryStats {
    min: number;
    max: number;
    avg: number;
}

interface MemorySampleStats {
    heapUsed: MemoryStats;
    heapTotal: MemoryStats;
    external: MemoryStats;
    rss: MemoryStats;
}

interface ProcessResult {
    time: number;
    samples: MemorySample[];
}

interface TestResults {
    avgTime: number;
    minTime: number;
    maxTime: number;
    memorySamples: MemorySampleStats;
    rawResults: ProcessResult[];
}

function getMemoryUsage(): { heapUsed: number; heapTotal: number; external: number; rss: number } {
    const usage = process.memoryUsage();
    return {
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
        external: Math.round(usage.external / 1024 / 1024), // MB
        rss: Math.round(usage.rss / 1024 / 1024), // MB
    };
}

async function sampleMemory(samples: MemorySample[], startTime: number) {
    const memory = getMemoryUsage();
    samples.push({
        timestamp: Date.now() - startTime,
        ...memory,
    });
}

async function processWithBuffer(inputPath: string): Promise<ProcessResult> {
    const startTime = process.hrtime.bigint();
    const memoryStartTime = Date.now();
    const samples: MemorySample[] = [];

    // Baseline memory usage
    sampleMemory(samples, memoryStartTime);

    // Start memory sampling
    const samplingInterval = setInterval(() => {
        sampleMemory(samples, memoryStartTime);
    }, MEMORY_SAMPLE_INTERVAL);

    // Read the entire file into memory
    const inputBuffer = await fs.promises.readFile(inputPath);

    // Process the image without saving
    await sharp(inputBuffer)
        .resize(IMAGE_SIZE, null, {
            fit: 'inside',
            withoutEnlargement: true,
        })
        .toBuffer();

    // Stop memory sampling
    clearInterval(samplingInterval);

    const endTime = process.hrtime.bigint();

    return {
        time: Number(endTime - startTime) / 1_000_000, // Convert to milliseconds
        samples,
    };
}

async function processWithStream(inputPath: string): Promise<ProcessResult> {
    const startTime = process.hrtime.bigint();
    const memoryStartTime = Date.now();
    const samples: MemorySample[] = [];

    // Baseline memory usage
    sampleMemory(samples, memoryStartTime);

    // Start memory sampling
    const samplingInterval = setInterval(() => {
        sampleMemory(samples, memoryStartTime);
    }, MEMORY_SAMPLE_INTERVAL);

    // Create read stream
    const readStream = createReadStream(inputPath);

    // Process the image using streams without saving
    await new Promise((resolve, reject) => {
        readStream
            .pipe(
                sharp().resize(IMAGE_SIZE, null, {
                    fit: 'inside',
                    withoutEnlargement: true,
                })
            )
            .toBuffer(err => {
                if (err) reject(err);
                else resolve(null);
            });
    });

    // Stop memory sampling
    clearInterval(samplingInterval);

    const endTime = process.hrtime.bigint();

    return {
        time: Number(endTime - startTime) / 1_000_000, // Convert to milliseconds
        samples,
    };
}

async function processWithPath(inputPath: string, outputPath: string): Promise<ProcessResult> {
    const startTime = process.hrtime.bigint();
    const memoryStartTime = Date.now();
    const samples: MemorySample[] = [];

    // Baseline memory usage
    sampleMemory(samples, memoryStartTime);

    // Start memory sampling
    const samplingInterval = setInterval(() => {
        sampleMemory(samples, memoryStartTime);
    }, MEMORY_SAMPLE_INTERVAL);

    // Process the image using direct path access
    await sharp(inputPath)
        .resize(IMAGE_SIZE, null, {
            fit: 'inside',
            withoutEnlargement: true,
        })
        .toFile(outputPath);

    // Stop memory sampling
    clearInterval(samplingInterval);

    const endTime = process.hrtime.bigint();

    return {
        time: Number(endTime - startTime) / 1_000_000, // Convert to milliseconds
        samples,
    };
}

function calculateStatsForASample(samplesArray: MemorySample[]): MemorySampleStats {
    if (samplesArray.length === 0) {
        return {
            heapUsed: { min: 0, max: 0, avg: 0 },
            heapTotal: { min: 0, max: 0, avg: 0 },
            external: { min: 0, max: 0, avg: 0 },
            rss: { min: 0, max: 0, avg: 0 },
        };
    }

    const heapUsedValues: number[] = [];
    const heapTotalValues: number[] = [];
    const externalValues: number[] = [];
    const rssValues: number[] = [];

    for (const sample of samplesArray) {
        heapUsedValues.push(sample.heapUsed);
        heapTotalValues.push(sample.heapTotal);
        externalValues.push(sample.external);
        rssValues.push(sample.rss);
    }

    return {
        heapUsed: {
            min: Math.min(...heapUsedValues),
            max: Math.max(...heapUsedValues),
            avg: heapUsedValues.reduce((a, b) => a + b, 0) / heapUsedValues.length,
        },
        heapTotal: {
            min: Math.min(...heapTotalValues),
            max: Math.max(...heapTotalValues),
            avg: heapTotalValues.reduce((a, b) => a + b, 0) / heapTotalValues.length,
        },
        external: {
            min: Math.min(...externalValues),
            max: Math.max(...externalValues),
            avg: externalValues.reduce((a, b) => a + b, 0) / externalValues.length,
        },
        rss: {
            min: Math.min(...rssValues),
            max: Math.max(...rssValues),
            avg: rssValues.reduce((a, b) => a + b, 0) / rssValues.length,
        },
    };
}

async function runTestIterations(
    processFn: () => Promise<ProcessResult>,
    methodName: string,
    iterations: number
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

export async function runBufferTest(inputPath: string): Promise<TestResults> {
    return runTestIterations(() => processWithBuffer(inputPath), 'buffer', TEST_ITERATIONS);
}

export async function runStreamTest(inputPath: string): Promise<TestResults> {
    return runTestIterations(() => processWithStream(inputPath), 'stream', TEST_ITERATIONS);
}

export async function runPathTest(inputPath: string, outputPath: string): Promise<TestResults> {
    return runTestIterations(() => processWithPath(inputPath, outputPath), 'path', TEST_ITERATIONS);
}

export type { TestResults, ProcessResult, MemorySample, MemoryStats, MemorySampleStats };
