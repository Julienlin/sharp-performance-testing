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

function calculateSamplesStats(samplesArray: MemorySample[][]): MemorySampleStats {
    if (samplesArray.length === 0) {
        return {
            heapUsed: { min: 0, max: 0, avg: 0 },
            heapTotal: { min: 0, max: 0, avg: 0 },
            external: { min: 0, max: 0, avg: 0 },
            rss: { min: 0, max: 0, avg: 0 }
        };
    }

    // Collect all values across all iterations and time points
    let heapUsedValues: number[] = [];
    let heapTotalValues: number[] = [];
    let externalValues: number[] = [];
    let rssValues: number[] = [];

    // Collect values from all iterations and all time points
    for (const samples of samplesArray) {
        for (const sample of samples) {
            heapUsedValues.push(sample.heapUsed);
            heapTotalValues.push(sample.heapTotal);
            externalValues.push(sample.external);
            rssValues.push(sample.rss);
        }
    }

    // Calculate overall stats
    return {
        heapUsed: {
            min: Math.min(...heapUsedValues),
            max: Math.max(...heapUsedValues),
            avg: heapUsedValues.reduce((a, b) => a + b, 0) / heapUsedValues.length
        },
        heapTotal: {
            min: Math.min(...heapTotalValues),
            max: Math.max(...heapTotalValues),
            avg: heapTotalValues.reduce((a, b) => a + b, 0) / heapTotalValues.length
        },
        external: {
            min: Math.min(...externalValues),
            max: Math.max(...externalValues),
            avg: externalValues.reduce((a, b) => a + b, 0) / externalValues.length
        },
        rss: {
            min: Math.min(...rssValues),
            max: Math.max(...rssValues),
            avg: rssValues.reduce((a, b) => a + b, 0) / rssValues.length
        }
    };
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
    console.log(`  Memory samples: ${avgBufferSamples.heapUsed.avg.toFixed(2)}MB (min: ${avgBufferSamples.heapUsed.min.toFixed(2)}MB, max: ${avgBufferSamples.heapUsed.max.toFixed(2)}MB)`);
    console.log(`    Heap Total: ${avgBufferSamples.heapTotal.avg.toFixed(2)}MB (min: ${avgBufferSamples.heapTotal.min.toFixed(2)}MB, max: ${avgBufferSamples.heapTotal.max.toFixed(2)}MB)`);
    console.log(`    External: ${avgBufferSamples.external.avg.toFixed(2)}MB (min: ${avgBufferSamples.external.min.toFixed(2)}MB, max: ${avgBufferSamples.external.max.toFixed(2)}MB)`);
    console.log(`    RSS: ${avgBufferSamples.rss.avg.toFixed(2)}MB (min: ${avgBufferSamples.rss.min.toFixed(2)}MB, max: ${avgBufferSamples.rss.max.toFixed(2)}MB)`);

    console.log('\nStream method:');
    console.log(`  Average time: ${avgStreamTime.toFixed(2)}ms`);
    console.log(`  Min time: ${minStreamTime.toFixed(2)}ms`);
    console.log(`  Max time: ${maxStreamTime.toFixed(2)}ms`);
    console.log(`  Memory samples: ${avgStreamSamples.heapUsed.avg.toFixed(2)}MB (min: ${avgStreamSamples.heapUsed.min.toFixed(2)}MB, max: ${avgStreamSamples.heapUsed.max.toFixed(2)}MB)`);
    console.log(`    Heap Total: ${avgStreamSamples.heapTotal.avg.toFixed(2)}MB (min: ${avgStreamSamples.heapTotal.min.toFixed(2)}MB, max: ${avgStreamSamples.heapTotal.max.toFixed(2)}MB)`);
    console.log(`    External: ${avgStreamSamples.external.avg.toFixed(2)}MB (min: ${avgStreamSamples.external.min.toFixed(2)}MB, max: ${avgStreamSamples.external.max.toFixed(2)}MB)`);
    console.log(`    RSS: ${avgStreamSamples.rss.avg.toFixed(2)}MB (min: ${avgStreamSamples.rss.min.toFixed(2)}MB, max: ${avgStreamSamples.rss.max.toFixed(2)}MB)`);

    console.log('\nPath method:');
    console.log(`  Average time: ${avgPathTime.toFixed(2)}ms`);
    console.log(`  Min time: ${minPathTime.toFixed(2)}ms`);
    console.log(`  Max time: ${maxPathTime.toFixed(2)}ms`);
    console.log(`  Memory samples: ${avgPathSamples.heapUsed.avg.toFixed(2)}MB (min: ${avgPathSamples.heapUsed.min.toFixed(2)}MB, max: ${avgPathSamples.heapUsed.max.toFixed(2)}MB)`);
    console.log(`    Heap Total: ${avgPathSamples.heapTotal.avg.toFixed(2)}MB (min: ${avgPathSamples.heapTotal.min.toFixed(2)}MB, max: ${avgPathSamples.heapTotal.max.toFixed(2)}MB)`);
    console.log(`    External: ${avgPathSamples.external.avg.toFixed(2)}MB (min: ${avgPathSamples.external.min.toFixed(2)}MB, max: ${avgPathSamples.external.max.toFixed(2)}MB)`);
    console.log(`    RSS: ${avgPathSamples.rss.avg.toFixed(2)}MB (min: ${avgPathSamples.rss.min.toFixed(2)}MB, max: ${avgPathSamples.rss.max.toFixed(2)}MB)`);

    console.log('\nComparison:');
    console.log(`  Time Differences:`);
    console.log(`    Buffer vs Stream: ${Math.abs(avgBufferTime - avgStreamTime).toFixed(2)}ms`);
    console.log(`    Buffer vs Path: ${Math.abs(avgBufferTime - avgPathTime).toFixed(2)}ms`);
    console.log(`    Stream vs Path: ${Math.abs(avgStreamTime - avgPathTime).toFixed(2)}ms`);

    console.log(`\n  Performance Ratios:`);
    console.log(`    Path vs Buffer: Path is ${(avgBufferTime / avgPathTime).toFixed(2)}x faster`);
    console.log(`    Path vs Stream: Path is ${(avgStreamTime / avgPathTime).toFixed(2)}x faster`);
    console.log(`    Stream vs Buffer: Stream is ${(avgBufferTime / avgStreamTime).toFixed(2)}x faster`);

    if (avgBufferSamples.heapUsed.avg > 0 && avgStreamSamples.heapUsed.avg > 0 && avgPathSamples.heapUsed.avg > 0) {
        console.log('\n  Memory Usage Comparison:');
        console.log('    Heap Used:');
        console.log(`      Buffer: ${avgBufferSamples.heapUsed.avg.toFixed(2)}MB`);
        console.log(`      Stream: ${avgStreamSamples.heapUsed.avg.toFixed(2)}MB`);
        console.log(`      Path: ${avgPathSamples.heapUsed.avg.toFixed(2)}MB`);
        console.log('    Heap Total:');
        console.log(`      Buffer: ${avgBufferSamples.heapTotal.avg.toFixed(2)}MB`);
        console.log(`      Stream: ${avgStreamSamples.heapTotal.avg.toFixed(2)}MB`);
        console.log(`      Path: ${avgPathSamples.heapTotal.avg.toFixed(2)}MB`);
        console.log('    External:');
        console.log(`      Buffer: ${avgBufferSamples.external.avg.toFixed(2)}MB`);
        console.log(`      Stream: ${avgStreamSamples.external.avg.toFixed(2)}MB`);
        console.log(`      Path: ${avgPathSamples.external.avg.toFixed(2)}MB`);
        console.log('    RSS:');
        console.log(`      Buffer: ${avgBufferSamples.rss.avg.toFixed(2)}MB`);
        console.log(`      Stream: ${avgStreamSamples.rss.avg.toFixed(2)}MB`);
        console.log(`      Path: ${avgPathSamples.rss.avg.toFixed(2)}MB`);

        console.log('\n  Memory Usage Ratios:');
        console.log('    Heap Used:');
        console.log(`      Buffer vs Path: Buffer uses ${(avgBufferSamples.heapUsed.avg / avgPathSamples.heapUsed.avg).toFixed(2)}x more`);
        console.log(`      Stream vs Path: Stream uses ${(avgStreamSamples.heapUsed.avg / avgPathSamples.heapUsed.avg).toFixed(2)}x more`);
        console.log(`      Buffer vs Stream: Buffer uses ${(avgBufferSamples.heapUsed.avg / avgStreamSamples.heapUsed.avg).toFixed(2)}x more`);
        console.log('    Heap Total:');
        console.log(`      Buffer vs Path: Buffer uses ${(avgBufferSamples.heapTotal.avg / avgPathSamples.heapTotal.avg).toFixed(2)}x more`);
        console.log(`      Stream vs Path: Stream uses ${(avgStreamSamples.heapTotal.avg / avgPathSamples.heapTotal.avg).toFixed(2)}x more`);
        console.log(`      Buffer vs Stream: Buffer uses ${(avgBufferSamples.heapTotal.avg / avgStreamSamples.heapTotal.avg).toFixed(2)}x more`);
        console.log('    External:');
        console.log(`      Buffer vs Path: Buffer uses ${(avgBufferSamples.external.avg / avgPathSamples.external.avg).toFixed(2)}x more`);
        console.log(`      Stream vs Path: Stream uses ${(avgStreamSamples.external.avg / avgPathSamples.external.avg).toFixed(2)}x more`);
        console.log(`      Buffer vs Stream: Buffer uses ${(avgBufferSamples.external.avg / avgStreamSamples.external.avg).toFixed(2)}x more`);
        console.log('    RSS:');
        console.log(`      Buffer vs Path: Buffer uses ${(avgBufferSamples.rss.avg / avgPathSamples.rss.avg).toFixed(2)}x more`);
        console.log(`      Stream vs Path: Stream uses ${(avgStreamSamples.rss.avg / avgPathSamples.rss.avg).toFixed(2)}x more`);
        console.log(`      Buffer vs Stream: Buffer uses ${(avgBufferSamples.rss.avg / avgStreamSamples.rss.avg).toFixed(2)}x more`);
    }
}

// Run the test
runPerformanceTest().catch(console.error);
