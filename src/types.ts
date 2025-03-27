export interface MemorySample {
    timestamp: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
}

export interface MemoryStats {
    min: number;
    max: number;
    avg: number;
}

export interface MemorySampleStats {
    heapUsed: MemoryStats;
    heapTotal: MemoryStats;
    external: MemoryStats;
    rss: MemoryStats;
}

export interface ProcessResult {
    time: number;
    samples: MemorySample[];
}

export interface TestResults {
    avgTime: number;
    minTime: number;
    maxTime: number;
    memorySamples: MemorySampleStats;
    rawResults: ProcessResult[];
}

export interface ProcessOptions {
    inputPath: string;
    outputPath?: string;
    width: number;
    fit?: 'inside' | 'cover' | 'contain' | 'fill';
    withoutEnlargement?: boolean;
} 