import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { createReadStream } from 'fs';

// Configuration
const TEST_ITERATIONS = 500;
const IMAGE_SIZE = 1920; // Width in pixels
const QUALITY = 80;

async function processWithBuffer(inputPath: string): Promise<number> {
    const startTime = process.hrtime.bigint();
    
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
    return Number(endTime - startTime) / 1_000_000; // Convert to milliseconds
}

async function processWithStream(inputPath: string): Promise<number> {
    const startTime = process.hrtime.bigint();
    
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
    return Number(endTime - startTime) / 1_000_000; // Convert to milliseconds
}

async function runPerformanceTest() {
    // Create test directories if they don't exist
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
    const bufferTimes: number[] = [];
    for (let i = 0; i < TEST_ITERATIONS; i++) {
        // Clear Sharp's cache before each iteration
        sharp.cache(false);
        const time = await processWithBuffer(testImagePath);
        bufferTimes.push(time);
        
        // Show progress every 100 iterations
        if ((i + 1) % 100 === 0) {
            const progress = ((i + 1) / TEST_ITERATIONS * 100).toFixed(1);
            const avgTime = bufferTimes.slice(-100).reduce((a, b) => a + b, 0) / 100;
            console.log(`Progress: ${progress}% | Last 100 avg: ${avgTime.toFixed(2)}ms`);
        }
    }

    // Test with stream
    console.log('\nTesting with stream method:');
    const streamTimes: number[] = [];
    for (let i = 0; i < TEST_ITERATIONS; i++) {
        // Clear Sharp's cache before each iteration
        sharp.cache(false);
        const time = await processWithStream(testImagePath);
        streamTimes.push(time);
        
        // Show progress every 100 iterations
        if ((i + 1) % 100 === 0) {
            const progress = ((i + 1) / TEST_ITERATIONS * 100).toFixed(1);
            const avgTime = streamTimes.slice(-100).reduce((a, b) => a + b, 0) / 100;
            console.log(`Progress: ${progress}% | Last 100 avg: ${avgTime.toFixed(2)}ms`);
        }
    }

    // Calculate and display results
    const avgBufferTime = bufferTimes.reduce((a, b) => a + b, 0) / TEST_ITERATIONS;
    const avgStreamTime = streamTimes.reduce((a, b) => a + b, 0) / TEST_ITERATIONS;
    const minBufferTime = Math.min(...bufferTimes);
    const maxBufferTime = Math.max(...bufferTimes);
    const minStreamTime = Math.min(...streamTimes);
    const maxStreamTime = Math.max(...streamTimes);

    console.log('\nResults:');
    console.log('Buffer method:');
    console.log(`  Average time: ${avgBufferTime.toFixed(2)}ms`);
    console.log(`  Min time: ${minBufferTime.toFixed(2)}ms`);
    console.log(`  Max time: ${maxBufferTime.toFixed(2)}ms`);
    console.log('\nStream method:');
    console.log(`  Average time: ${avgStreamTime.toFixed(2)}ms`);
    console.log(`  Min time: ${minStreamTime.toFixed(2)}ms`);
    console.log(`  Max time: ${maxStreamTime.toFixed(2)}ms`);
    console.log('\nComparison:');
    console.log(`  Difference: ${Math.abs(avgBufferTime - avgStreamTime).toFixed(2)}ms`);
    console.log(`  Stream method is ${(avgBufferTime / avgStreamTime).toFixed(2)}x faster than buffer method`);
}

// Run the test
runPerformanceTest().catch(console.error); 