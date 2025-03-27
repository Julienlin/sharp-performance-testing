import { MemorySample, MemoryStats, MemorySampleStats } from './types';

export function getMemoryUsage(): { heapUsed: number; heapTotal: number; external: number; rss: number } {
    const usage = process.memoryUsage();
    return {
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
        external: Math.round(usage.external / 1024 / 1024), // MB
        rss: Math.round(usage.rss / 1024 / 1024), // MB
    };
}

export async function sampleMemory(samples: MemorySample[], startTime: number, baselineMemory:MemorySample): Promise<void> {
    const memory = getMemoryUsage();
    samples.push({
        timestamp: Date.now() - startTime,
        heapUsed: memory.heapUsed - baselineMemory.heapUsed,
        heapTotal: memory.heapTotal - baselineMemory.heapTotal,
        external: memory.external - baselineMemory.external,
        rss: memory.rss - baselineMemory.rss,
    });
}

export function calculateStatsForASample(samplesArray: MemorySample[]): MemorySampleStats {
    if (samplesArray.length === 0) {
        return {
            heapUsed: { min: 0, max: 0, avg: 0 },
            heapTotal: { min: 0, max: 0, avg: 0 },
            external: { min: 0, max: 0, avg: 0 },
            rss: { min: 0, max: 0, avg: 0 },
        };
    }

    const values = {
        heapUsed: samplesArray.map(s => s.heapUsed),
        heapTotal: samplesArray.map(s => s.heapTotal),
        external: samplesArray.map(s => s.external),
        rss: samplesArray.map(s => s.rss),
    };

    return {
        heapUsed: calculateStats(values.heapUsed),
        heapTotal: calculateStats(values.heapTotal),
        external: calculateStats(values.external),
        rss: calculateStats(values.rss),
    };
}

export function calculateStats(values: number[]): MemoryStats {
    return {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
    };
} 