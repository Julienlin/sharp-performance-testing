import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { createReadStream } from 'fs';

// Configuration
const TEST_ITERATIONS = 500;
const IMAGE_SIZE = 1920; // Width in pixels
const QUALITY = 80;

function getMemoryUsage(): { heapUsed: number; heapTotal: number; external: number } {
    const usage = process.memoryUsage();
    return {
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
        external: Math.round(usage.external / 1024 / 1024) // MB
    };
}

async function processWithBuffer(inputPath: string): Promise<{ time: number; memory: { heapUsed: number; heapTotal: number; external: number } }> {
    const startTime = process.hrtime.bigint();
    const startMemory = getMemoryUsage();
    
    // Read the entire file into memory
    const inputBuffer = await fs.promises.readFile(inputPath);
    
    // Process the image without saving
    await sharp(inputBuffer)
        .resize(IMAGE_SIZE, null, {
            fit: 'inside',
            withoutEnlargement: true
        })
        .jpeg({ quality: QUALITY })
        .toBuffer();
    
    const endTime = process.hrtime.bigint();
    const endMemory = getMemoryUsage();
    
    return {
        time: Number(endTime - startTime) / 1_000_000, // Convert to milliseconds
        memory: {
            heapUsed: endMemory.heapUsed - startMemory.heapUsed,
            heapTotal: endMemory.heapTotal - startMemory.heapTotal,
            external: endMemory.external - startMemory.external
        }
    };
}

async function processWithStream(inputPath: string): Promise<{ time: number; memory: { heapUsed: number; heapTotal: number; external: number } }> {
    const startTime = process.hrtime.bigint();
    const startMemory = getMemoryUsage();
    
    // Create read stream
    const readStream = createReadStream(inputPath);
    
    // Process the image using streams without saving
    await new Promise((resolve, reject) => {
        readStream
            .pipe(sharp()
                .resize(IMAGE_SIZE, null, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ quality: QUALITY }))
            .toBuffer((err) => {
                if (err) reject(err);
                else resolve(null);
            });
    });
    
    const endTime = process.hrtime.bigint();
    const endMemory = getMemoryUsage();
    
    return {
        time: Number(endTime - startTime) / 1_000_000, // Convert to milliseconds
        memory: {
            heapUsed: endMemory.heapUsed - startMemory.heapUsed,
            heapTotal: endMemory.heapTotal - startMemory.heapTotal,
            external: endMemory.external - startMemory.external
        }
    };
}

async function processWithPath(inputPath: string): Promise<{ time: number; memory: { heapUsed: number; heapTotal: number; external: number } }> {
    const startTime = process.hrtime.bigint();
    const startMemory = getMemoryUsage();
    
    // Process the image using direct path access
    await sharp(inputPath)
        .resize(IMAGE_SIZE, null, {
            fit: 'inside',
            withoutEnlargement: true
        })
        .jpeg({ quality: QUALITY })
        .toBuffer();
    
    const endTime = process.hrtime.bigint();
    const endMemory = getMemoryUsage();
    
    return {
        time: Number(endTime - startTime) / 1_000_000, // Convert to milliseconds
        memory: {
            heapUsed: endMemory.heapUsed - startMemory.heapUsed,
            heapTotal: endMemory.heapTotal - startMemory.heapTotal,
            external: endMemory.external - startMemory.external
        }
    };
}

async function runPerformanceTest() {
    // Create test directory if it doesn't exist
    const testDir = path.join(__dirname, '..', 'test-images');
    await fs.promises.mkdir(testDir, { recursive: true });

    // Create a test image if it doesn't exist
    const testImagePath = path.join(testDir, 'bigger-image.jpg');

    console.log('Starting performance test...\n');
    console.log(`Test configuration:`);
    console.log(`- Iterations: ${TEST_ITERATIONS}`);
    console.log(`- Input image: 3840x2160`);
    console.log(`- Output width: ${IMAGE_SIZE}px`);
    console.log(`- JPEG quality: ${QUALITY}\n`);

    // Test with buffer
    console.log('Testing with buffer method:');
    const bufferResults: { time: number; memory: { heapUsed: number; heapTotal: number; external: number } }[] = [];
    for (let i = 0; i < TEST_ITERATIONS; i++) {
        // Clear Sharp's cache before each iteration
        sharp.cache(false);
        const result = await processWithBuffer(testImagePath);
        bufferResults.push(result);
        
        // Show progress every 100 iterations
        if ((i + 1) % 100 === 0) {
            const progress = ((i + 1) / TEST_ITERATIONS * 100).toFixed(1);
            const avgTime = bufferResults.slice(-100).reduce((a, b) => a + b.time, 0) / 100;
            console.log(`Progress: ${progress}% | Last 100 avg: ${avgTime.toFixed(2)}ms`);
        }
    }

    // Test with stream
    console.log('\nTesting with stream method:');
    const streamResults: { time: number; memory: { heapUsed: number; heapTotal: number; external: number } }[] = [];
    for (let i = 0; i < TEST_ITERATIONS; i++) {
        // Clear Sharp's cache before each iteration
        sharp.cache(false);
        const result = await processWithStream(testImagePath);
        streamResults.push(result);
        
        // Show progress every 100 iterations
        if ((i + 1) % 100 === 0) {
            const progress = ((i + 1) / TEST_ITERATIONS * 100).toFixed(1);
            const avgTime = streamResults.slice(-100).reduce((a, b) => a + b.time, 0) / 100;
            console.log(`Progress: ${progress}% | Last 100 avg: ${avgTime.toFixed(2)}ms`);
        }
    }

    // Test with path
    console.log('\nTesting with path method:');
    const pathResults: { time: number; memory: { heapUsed: number; heapTotal: number; external: number } }[] = [];
    for (let i = 0; i < TEST_ITERATIONS; i++) {
        // Clear Sharp's cache before each iteration
        sharp.cache(false);
        const result = await processWithPath(testImagePath);
        pathResults.push(result);
        
        // Show progress every 100 iterations
        if ((i + 1) % 100 === 0) {
            const progress = ((i + 1) / TEST_ITERATIONS * 100).toFixed(1);
            const avgTime = pathResults.slice(-100).reduce((a, b) => a + b.time, 0) / 100;
            console.log(`Progress: ${progress}% | Last 100 avg: ${avgTime.toFixed(2)}ms`);
        }
    }

    // Calculate and display results
    const avgBufferTime = bufferResults.reduce((a, b) => a + b.time, 0) / TEST_ITERATIONS;
    const avgStreamTime = streamResults.reduce((a, b) => a + b.time, 0) / TEST_ITERATIONS;
    const avgPathTime = pathResults.reduce((a, b) => a + b.time, 0) / TEST_ITERATIONS;
    
    const minBufferTime = Math.min(...bufferResults.map(r => r.time));
    const maxBufferTime = Math.max(...bufferResults.map(r => r.time));
    const minStreamTime = Math.min(...streamResults.map(r => r.time));
    const maxStreamTime = Math.max(...streamResults.map(r => r.time));
    const minPathTime = Math.min(...pathResults.map(r => r.time));
    const maxPathTime = Math.max(...pathResults.map(r => r.time));

    // Calculate average memory usage
    const avgBufferMemory = {
        heapUsed: bufferResults.reduce((a, b) => a + b.memory.heapUsed, 0) / TEST_ITERATIONS,
        heapTotal: bufferResults.reduce((a, b) => a + b.memory.heapTotal, 0) / TEST_ITERATIONS,
        external: bufferResults.reduce((a, b) => a + b.memory.external, 0) / TEST_ITERATIONS
    };
    const avgStreamMemory = {
        heapUsed: streamResults.reduce((a, b) => a + b.memory.heapUsed, 0) / TEST_ITERATIONS,
        heapTotal: streamResults.reduce((a, b) => a + b.memory.heapTotal, 0) / TEST_ITERATIONS,
        external: streamResults.reduce((a, b) => a + b.memory.external, 0) / TEST_ITERATIONS
    };
    const avgPathMemory = {
        heapUsed: pathResults.reduce((a, b) => a + b.memory.heapUsed, 0) / TEST_ITERATIONS,
        heapTotal: pathResults.reduce((a, b) => a + b.memory.heapTotal, 0) / TEST_ITERATIONS,
        external: pathResults.reduce((a, b) => a + b.memory.external, 0) / TEST_ITERATIONS
    };

    console.log('\nResults:');
    console.log('Buffer method:');
    console.log(`  Average time: ${avgBufferTime.toFixed(2)}ms`);
    console.log(`  Min time: ${minBufferTime.toFixed(2)}ms`);
    console.log(`  Max time: ${maxBufferTime.toFixed(2)}ms`);
    console.log(`  Memory usage:`);
    console.log(`    Heap Used: ${avgBufferMemory.heapUsed.toFixed(2)}MB`);
    console.log(`    Heap Total: ${avgBufferMemory.heapTotal.toFixed(2)}MB`);
    console.log(`    External: ${avgBufferMemory.external.toFixed(2)}MB`);
    
    console.log('\nStream method:');
    console.log(`  Average time: ${avgStreamTime.toFixed(2)}ms`);
    console.log(`  Min time: ${minStreamTime.toFixed(2)}ms`);
    console.log(`  Max time: ${maxStreamTime.toFixed(2)}ms`);
    console.log(`  Memory usage:`);
    console.log(`    Heap Used: ${avgStreamMemory.heapUsed.toFixed(2)}MB`);
    console.log(`    Heap Total: ${avgStreamMemory.heapTotal.toFixed(2)}MB`);
    console.log(`    External: ${avgStreamMemory.external.toFixed(2)}MB`);

    console.log('\nPath method:');
    console.log(`  Average time: ${avgPathTime.toFixed(2)}ms`);
    console.log(`  Min time: ${minPathTime.toFixed(2)}ms`);
    console.log(`  Max time: ${maxPathTime.toFixed(2)}ms`);
    console.log(`  Memory usage:`);
    console.log(`    Heap Used: ${avgPathMemory.heapUsed.toFixed(2)}MB`);
    console.log(`    Heap Total: ${avgPathMemory.heapTotal.toFixed(2)}MB`);
    console.log(`    External: ${avgPathMemory.external.toFixed(2)}MB`);
    
    console.log('\nComparison:');
    console.log(`  Time Difference (Buffer vs Stream): ${Math.abs(avgBufferTime - avgStreamTime).toFixed(2)}ms`);
    console.log(`  Time Difference (Buffer vs Path): ${Math.abs(avgBufferTime - avgPathTime).toFixed(2)}ms`);
    console.log(`  Time Difference (Stream vs Path): ${Math.abs(avgStreamTime - avgPathTime).toFixed(2)}ms`);
    console.log('\n  Performance Ratios:');
    console.log(`    Stream vs Buffer: ${(avgBufferTime / avgStreamTime).toFixed(2)}x`);
    console.log(`    Path vs Buffer: ${(avgBufferTime / avgPathTime).toFixed(2)}x`);
    console.log(`    Path vs Stream: ${(avgStreamTime / avgPathTime).toFixed(2)}x`);
    
    console.log('\n  Memory Differences:');
    console.log(`    Heap Used (Buffer vs Stream): ${Math.abs(avgBufferMemory.heapUsed - avgStreamMemory.heapUsed).toFixed(2)}MB`);
    console.log(`    Heap Used (Buffer vs Path): ${Math.abs(avgBufferMemory.heapUsed - avgPathMemory.heapUsed).toFixed(2)}MB`);
    console.log(`    Heap Used (Stream vs Path): ${Math.abs(avgStreamMemory.heapUsed - avgPathMemory.heapUsed).toFixed(2)}MB`);
}

// Run the test
runPerformanceTest().catch(console.error); 