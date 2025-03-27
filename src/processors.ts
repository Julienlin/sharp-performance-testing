import sharp from 'sharp';
import fs from 'fs';
import { createReadStream } from 'fs';
import { ProcessOptions, ProcessResult } from './types';
import { DEFAULT_CONFIG } from './config';
import { getMemoryUsage, sampleMemory } from './utils';

export async function processWithBuffer({ inputPath, width, fit, withoutEnlargement }: ProcessOptions): Promise<ProcessResult> {
    const startTime = process.hrtime.bigint();
    const memoryStartTime = Date.now();
    const samples: ProcessResult['samples'] = [];

    await (global.gc as (() => void))();
    
    const baselineMemory = {
        timestamp: memoryStartTime,
        ...await getMemoryUsage(),
    }

    // Start memory sampling
    const samplingInterval = setInterval(() => {
        sampleMemory(samples, memoryStartTime, baselineMemory);
    }, DEFAULT_CONFIG.MEMORY_SAMPLE_INTERVAL);

    try {
        // Read the entire file into memory
        const inputBuffer = await fs.promises.readFile(inputPath);

        // Process the image without saving
        await sharp(inputBuffer)
            .resize(width, null, { fit, withoutEnlargement })
            .toBuffer();

        const endTime = process.hrtime.bigint();
        return {
            time: Number(endTime - startTime) / 1_000_000, // Convert to milliseconds
            samples,
        };
    } finally {
        clearInterval(samplingInterval);
    }
}

export async function processWithStream({ inputPath, width, fit, withoutEnlargement }: ProcessOptions): Promise<ProcessResult> {
    const startTime = process.hrtime.bigint();
    const memoryStartTime = Date.now();
    const samples: ProcessResult['samples'] = [];

    await (global.gc as (() => void))();
    const baselineMemory = {
        timestamp: memoryStartTime,
        ...await getMemoryUsage(),
    }

    // Start memory sampling
    const samplingInterval = setInterval(() => {
        sampleMemory(samples, memoryStartTime, baselineMemory);
    }, DEFAULT_CONFIG.MEMORY_SAMPLE_INTERVAL);

    try {
        // Create read stream
        const readStream = createReadStream(inputPath);

        // Process the image using streams without saving
        await new Promise<void>((resolve, reject) => {
            readStream
                .pipe(
                    sharp().resize(width, null, {
                        fit,
                        withoutEnlargement,
                    })
                )
                .toBuffer(err => {
                    if (err) reject(err);
                    else resolve();
                });
        });

        const endTime = process.hrtime.bigint();
        return {
            time: Number(endTime - startTime) / 1_000_000, // Convert to milliseconds
            samples,
        };
    } finally {
        clearInterval(samplingInterval);
    }
}

export async function processWithPath({ inputPath, outputPath, width, fit, withoutEnlargement }: ProcessOptions): Promise<ProcessResult> {
    const startTime = process.hrtime.bigint();
    const memoryStartTime = Date.now();
    const samples: ProcessResult['samples'] = [];

    await (global.gc as (() => void))();
    const baselineMemory = {
        timestamp: memoryStartTime,
        ...await getMemoryUsage(),
    }

    // Start memory sampling
    const samplingInterval = setInterval(() => {
        sampleMemory(samples, memoryStartTime, baselineMemory);
    }, DEFAULT_CONFIG.MEMORY_SAMPLE_INTERVAL);

    try {
        // Process the image using direct path access
        await sharp(inputPath)
            .resize(width, null, { fit, withoutEnlargement })
            .toFile(outputPath!);

        const endTime = process.hrtime.bigint();
        return {
            time: Number(endTime - startTime) / 1_000_000, // Convert to milliseconds
            samples,
        };
    } finally {
        clearInterval(samplingInterval);
    }
}

export async function processWithSequentialStream({ inputPath, width, fit, withoutEnlargement }: ProcessOptions): Promise<ProcessResult> {
    const startTime = process.hrtime.bigint();
    const memoryStartTime = Date.now();
    const samples: ProcessResult['samples'] = [];

    await (global.gc as (() => void))();
    const baselineMemory = {
        timestamp: memoryStartTime,
        ...await getMemoryUsage(),
    }

    // Start memory sampling
    const samplingInterval = setInterval(() => {
        sampleMemory(samples, memoryStartTime, baselineMemory);
    }, DEFAULT_CONFIG.MEMORY_SAMPLE_INTERVAL);

    try {
        // Process the image using Sharp's sequential reading mode
        await sharp(inputPath, { sequentialRead: true })
            .resize(width, null, { fit, withoutEnlargement })
            .toBuffer();

        const endTime = process.hrtime.bigint();
        return {
            time: Number(endTime - startTime) / 1_000_000, // Convert to milliseconds
            samples,
        };
    } finally {
        clearInterval(samplingInterval);
    }
} 