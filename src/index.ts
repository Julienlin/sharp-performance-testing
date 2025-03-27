import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { createReadStream } from 'fs';

// Configuration
const TEST_ITERATIONS = 500;
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
    timestamp: number;
    heapUsed: MemoryStats;
    heapTotal: MemoryStats;
    external: MemoryStats;
    rss: MemoryStats;
}

interface ProcessResult {
    time: number;
    samples: MemorySample[];
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

function calculateSamplesStats(samplesArray: MemorySample[][]): MemorySampleStats[] {
    if (samplesArray.length === 0) return [];

    // Find the maximum number of samples across all iterations
    const maxSamples = Math.max(...samplesArray.map(samples => samples.length));

    // Initialize result array
    const result: MemorySampleStats[] = [];

    // For each time point, calculate the stats across all iterations
    for (let i = 0; i < maxSamples; i++) {
        let heapUsedValues: number[] = [];
        let heapTotalValues: number[] = [];
        let externalValues: number[] = [];
        let rssValues: number[] = [];

        // Collect values from all iterations that have this sample point
        for (const samples of samplesArray) {
            if (i < samples.length) {
                heapUsedValues.push(samples[i].heapUsed);
                heapTotalValues.push(samples[i].heapTotal);
                externalValues.push(samples[i].external);
                rssValues.push(samples[i].rss);
            }
        }

        // Calculate stats if we have any samples
        if (heapUsedValues.length > 0) {
            result.push({
                timestamp: samplesArray[0][i].timestamp,
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
            });
        }
    }

    return result;
}

async function runPerformanceTest() {
    // Create test directory if it doesn't exist
    const testDir = path.join(__dirname, '..', 'test-images');
    await fs.promises.mkdir(testDir, { recursive: true });

    // Create a test image if it doesn't exist
    const testImagePath = path.join(testDir, 'bigger-image.jpg');

    // Create a output directory if it doesn't exist
    const outputDir = path.join(__dirname, '..', 'output');
    await fs.promises.rm(outputDir, { recursive: true, force: true });
    await fs.promises.mkdir(outputDir, { recursive: true });

    console.log('Starting performance test...\n');
    console.log(`Test configuration:`);
    console.log(`- Iterations: ${TEST_ITERATIONS}`);
    console.log(`- Input image: 3840x2160`);
    console.log(`- Output width: ${IMAGE_SIZE}px`);
    console.log(`- Node.js memory limit: ${process.env.NODE_OPTIONS || 'default'}`);
    console.log(`- Memory sampling interval: ${MEMORY_SAMPLE_INTERVAL}ms\n`);

    // Test with buffer
    console.log('Testing with buffer method:');
    const bufferResults: ProcessResult[] = [];
    for (let i = 0; i < TEST_ITERATIONS; i++) {
        // Clear Sharp's cache before each iteration
        sharp.cache(false);
        const result = await processWithBuffer(testImagePath);
        bufferResults.push(result);

        // Show progress every 100 iterations
        if ((i + 1) % 100 === 0) {
            const progress = (((i + 1) / TEST_ITERATIONS) * 100).toFixed(1);
            const avgTime = bufferResults.slice(-100).reduce((a, b) => a + b.time, 0) / 100;
            console.log(`Progress: ${progress}% | Last 100 avg: ${avgTime.toFixed(2)}ms`);
        }
    }

    // Force garbage collection before starting stream method
    if (global.gc) {
        global.gc();
        console.log('\nGarbage collection performed before stream method');
    }

    // Test with stream
    console.log('\nTesting with stream method:');
    const streamResults: ProcessResult[] = [];
    for (let i = 0; i < TEST_ITERATIONS; i++) {
        // Clear Sharp's cache before each iteration
        sharp.cache(false);
        const result = await processWithStream(testImagePath);
        streamResults.push(result);

        // Show progress every 100 iterations
        if ((i + 1) % 100 === 0) {
            const progress = (((i + 1) / TEST_ITERATIONS) * 100).toFixed(1);
            const avgTime = streamResults.slice(-100).reduce((a, b) => a + b.time, 0) / 100;
            console.log(`Progress: ${progress}% | Last 100 avg: ${avgTime.toFixed(2)}ms`);
        }
    }

    // Force garbage collection before starting path method
    if (global.gc) {
        global.gc();
        console.log('\nGarbage collection performed before path method');
    }

    // Test with path
    console.log('\nTesting with path method:');
    const pathResults: ProcessResult[] = [];
    for (let i = 0; i < TEST_ITERATIONS; i++) {
        // Clear Sharp's cache before each iteration
        sharp.cache(false);
        const result = await processWithPath(testImagePath, path.join(outputDir, `output-${i}.jpg`));
        pathResults.push(result);

        // Show progress every 100 iterations
        if ((i + 1) % 100 === 0) {
            const progress = (((i + 1) / TEST_ITERATIONS) * 100).toFixed(1);
            const avgTime = pathResults.slice(-100).reduce((a, b) => a + b.time, 0) / 100;
            console.log(`Progress: ${progress}% | Last 100 avg: ${avgTime.toFixed(2)}ms`);
        }
    }

    // Calculate average time
    const avgBufferTime = bufferResults.reduce((a, b) => a + b.time, 0) / TEST_ITERATIONS;
    const avgStreamTime = streamResults.reduce((a, b) => a + b.time, 0) / TEST_ITERATIONS;
    const avgPathTime = pathResults.reduce((a, b) => a + b.time, 0) / TEST_ITERATIONS;

    // Calculate min and max times
    const minBufferTime = Math.min(...bufferResults.map(r => r.time));
    const maxBufferTime = Math.max(...bufferResults.map(r => r.time));
    const minStreamTime = Math.min(...streamResults.map(r => r.time));
    const maxStreamTime = Math.max(...streamResults.map(r => r.time));
    const minPathTime = Math.min(...pathResults.map(r => r.time));
    const maxPathTime = Math.max(...pathResults.map(r => r.time));

    // Calculate average memory samples
    const avgBufferSamples = calculateSamplesStats(bufferResults.map(r => r.samples));
    const avgStreamSamples = calculateSamplesStats(streamResults.map(r => r.samples));
    const avgPathSamples = calculateSamplesStats(pathResults.map(r => r.samples));

    console.log('\nResults:');
    console.log('Buffer method:');
    console.log(`  Average time: ${avgBufferTime.toFixed(2)}ms`);
    console.log(`  Min time: ${minBufferTime.toFixed(2)}ms`);
    console.log(`  Max time: ${maxBufferTime.toFixed(2)}ms`);
    console.log(`  Memory samples: ${avgBufferSamples.length} points`);

    console.log('\nStream method:');
    console.log(`  Average time: ${avgStreamTime.toFixed(2)}ms`);
    console.log(`  Min time: ${minStreamTime.toFixed(2)}ms`);
    console.log(`  Max time: ${maxStreamTime.toFixed(2)}ms`);
    console.log(`  Memory samples: ${avgStreamSamples.length} points`);

    console.log('\nPath method:');
    console.log(`  Average time: ${avgPathTime.toFixed(2)}ms`);
    console.log(`  Min time: ${minPathTime.toFixed(2)}ms`);
    console.log(`  Max time: ${maxPathTime.toFixed(2)}ms`);
    console.log(`  Memory samples: ${avgPathSamples.length} points`);

    console.log('\nComparison:');
    console.log(`  Time Differences:`);
    console.log(`    Buffer vs Stream: ${Math.abs(avgBufferTime - avgStreamTime).toFixed(2)}ms`);
    console.log(`    Buffer vs Path: ${Math.abs(avgBufferTime - avgPathTime).toFixed(2)}ms`);
    console.log(`    Stream vs Path: ${Math.abs(avgStreamTime - avgPathTime).toFixed(2)}ms`);

    console.log(`\n  Performance Ratios:`);
    console.log(`    Path vs Buffer: ${(avgBufferTime / avgPathTime).toFixed(2)}x faster`);
    console.log(`    Path vs Stream: ${(avgStreamTime / avgPathTime).toFixed(2)}x faster`);
    console.log(`    Stream vs Buffer: ${(avgBufferTime / avgStreamTime).toFixed(2)}x faster`);
}

// Run the test
runPerformanceTest().catch(console.error);
