import fs from 'fs';
import path from 'path';
import { TestResults } from './types';

interface ComparisonResult {
    method: string;
    processingTime: {
        average: number;
        min: number;
        max: number;
        stdDev: number;
    };
    memoryUsage: {
        heapUsed: {
            average: number;
            min: number;
            max: number;
            stdDev: number;
        };
        heapTotal: {
            average: number;
            min: number;
            max: number;
            stdDev: number;
        };
        external: {
            average: number;
            min: number;
            max: number;
            stdDev: number;
        };
        rss: {
            average: number;
            min: number;
            max: number;
            stdDev: number;
        };
    };
}

function calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map(value => {
        const diff = value - mean;
        return diff * diff;
    });
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(avgSquareDiff);
}

function analyzeMemorySamples(samples: TestResults['memorySamples']): ComparisonResult['memoryUsage'] {
    return {
        heapUsed: {
            average: samples.heapUsed.avg,
            min: samples.heapUsed.min,
            max: samples.heapUsed.max,
            stdDev: calculateStandardDeviation([samples.heapUsed.min, samples.heapUsed.max, samples.heapUsed.avg]),
        },
        heapTotal: {
            average: samples.heapTotal.avg,
            min: samples.heapTotal.min,
            max: samples.heapTotal.max,
            stdDev: calculateStandardDeviation([samples.heapTotal.min, samples.heapTotal.max, samples.heapTotal.avg]),
        },
        external: {
            average: samples.external.avg,
            min: samples.external.min,
            max: samples.external.max,
            stdDev: calculateStandardDeviation([samples.external.min, samples.external.max, samples.external.avg]),
        },
        rss: {
            average: samples.rss.avg,
            min: samples.rss.min,
            max: samples.rss.max,
            stdDev: calculateStandardDeviation([samples.rss.min, samples.rss.max, samples.rss.avg]),
        },
    };
}

function compareResults(results: { [key: string]: TestResults }): { [key: string]: ComparisonResult } {
    const comparison: { [key: string]: ComparisonResult } = {};

    for (const [method, result] of Object.entries(results)) {
        const times = result.rawResults.map(r => r.time);
        comparison[method] = {
            method,
            processingTime: {
                average: result.avgTime,
                min: result.minTime,
                max: result.maxTime,
                stdDev: calculateStandardDeviation(times),
            },
            memoryUsage: analyzeMemorySamples(result.memorySamples),
        };
    }

    return comparison;
}

function printComparison(comparison: { [key: string]: ComparisonResult }) {
    console.log('\nPerformance Comparison Results:');
    console.log('================================\n');

    // Print processing time comparison
    console.log('Processing Time (ms):');
    console.log('---------------------');
    for (const [method, data] of Object.entries(comparison)) {
        console.log(`\n${method.toUpperCase()} Method:`);
        console.log(`  Average: ${data.processingTime.average.toFixed(2)}`);
        console.log(`  Min:     ${data.processingTime.min.toFixed(2)}`);
        console.log(`  Max:     ${data.processingTime.max.toFixed(2)}`);
        console.log(`  StdDev:  ${data.processingTime.stdDev.toFixed(2)}`);
    }

    // Print memory usage comparison
    console.log('\nMemory Usage (MB):');
    console.log('------------------');
    for (const [method, data] of Object.entries(comparison)) {
        const totalMemory = data.memoryUsage.heapUsed.average + 
                          data.memoryUsage.external.average + 
                          data.memoryUsage.rss.average;
        
        console.log(`\n${method.toUpperCase()} Method:`);
        console.log(`  Total Memory Footprint: ${totalMemory.toFixed(2)} MB`);
        console.log('  Memory Distribution:');
        console.log(`    Heap Used:    ${data.memoryUsage.heapUsed.average.toFixed(2)} MB (${((data.memoryUsage.heapUsed.average / totalMemory) * 100).toFixed(1)}%)`);
        console.log(`    External:     ${data.memoryUsage.external.average.toFixed(2)} MB (${((data.memoryUsage.external.average / totalMemory) * 100).toFixed(1)}%)`);
        console.log(`    RSS:          ${data.memoryUsage.rss.average.toFixed(2)} MB (${((data.memoryUsage.rss.average / totalMemory) * 100).toFixed(1)}%)`);
        
        console.log('\n  Detailed Memory Stats:');
        console.log('  Heap Used:');
        console.log(`    Average: ${data.memoryUsage.heapUsed.average.toFixed(2)}`);
        console.log(`    Min:     ${data.memoryUsage.heapUsed.min.toFixed(2)}`);
        console.log(`    Max:     ${data.memoryUsage.heapUsed.max.toFixed(2)}`);
        console.log(`    StdDev:  ${data.memoryUsage.heapUsed.stdDev.toFixed(2)}`);
        
        console.log('  Heap Total:');
        console.log(`    Average: ${data.memoryUsage.heapTotal.average.toFixed(2)}`);
        console.log(`    Min:     ${data.memoryUsage.heapTotal.min.toFixed(2)}`);
        console.log(`    Max:     ${data.memoryUsage.heapTotal.max.toFixed(2)}`);
        console.log(`    StdDev:  ${data.memoryUsage.heapTotal.stdDev.toFixed(2)}`);
        
        console.log('  External:');
        console.log(`    Average: ${data.memoryUsage.external.average.toFixed(2)}`);
        console.log(`    Min:     ${data.memoryUsage.external.min.toFixed(2)}`);
        console.log(`    Max:     ${data.memoryUsage.external.max.toFixed(2)}`);
        console.log(`    StdDev:  ${data.memoryUsage.external.stdDev.toFixed(2)}`);
        
        console.log('  RSS:');
        console.log(`    Average: ${data.memoryUsage.rss.average.toFixed(2)}`);
        console.log(`    Min:     ${data.memoryUsage.rss.min.toFixed(2)}`);
        console.log(`    Max:     ${data.memoryUsage.rss.max.toFixed(2)}`);
        console.log(`    StdDev:  ${data.memoryUsage.rss.stdDev.toFixed(2)}`);
    }

    // Find the most efficient method (lowest overall memory usage)
    const methods = Object.keys(comparison);
    const baselineMethod = methods.reduce((best, current) => {
        const bestMemory = comparison[best].memoryUsage.heapUsed.average + 
                          comparison[best].memoryUsage.external.average + 
                          comparison[best].memoryUsage.rss.average;
        const currentMemory = comparison[current].memoryUsage.heapUsed.average + 
                            comparison[current].memoryUsage.external.average + 
                            comparison[current].memoryUsage.rss.average;
        return currentMemory < bestMemory ? current : best;
    });

    // Calculate and print relative performance
    console.log('\nRelative Performance:');
    console.log('--------------------');
    console.log(`Baseline Method (lowest memory usage): ${baselineMethod.toUpperCase()}`);
    
    for (const method of methods) {
        if (method === baselineMethod) continue;
        
        const currentMethod = comparison[method];
        const baselineMethodData = comparison[baselineMethod];
        
        const currentTotalMemory = currentMethod.memoryUsage.heapUsed.average + 
                                 currentMethod.memoryUsage.external.average + 
                                 currentMethod.memoryUsage.rss.average;
        const baselineTotalMemory = baselineMethodData.memoryUsage.heapUsed.average + 
                                  baselineMethodData.memoryUsage.external.average + 
                                  baselineMethodData.memoryUsage.rss.average;
        
        const timeDiff = ((currentMethod.processingTime.average - baselineMethodData.processingTime.average) / baselineMethodData.processingTime.average) * 100;
        const totalMemoryDiff = ((currentTotalMemory - baselineTotalMemory) / baselineTotalMemory) * 100;
        const heapDiff = ((currentMethod.memoryUsage.heapUsed.average - baselineMethodData.memoryUsage.heapUsed.average) / baselineMethodData.memoryUsage.heapUsed.average) * 100;
        const externalDiff = ((currentMethod.memoryUsage.external.average - baselineMethodData.memoryUsage.external.average) / baselineMethodData.memoryUsage.external.average) * 100;
        const rssDiff = ((currentMethod.memoryUsage.rss.average - baselineMethodData.memoryUsage.rss.average) / baselineMethodData.memoryUsage.rss.average) * 100;
        
        console.log(`\n${method.toUpperCase()} vs ${baselineMethod.toUpperCase()}:`);
        console.log(`  Processing Time: ${timeDiff > 0 ? '+' : ''}${timeDiff.toFixed(2)}%`);
        console.log(`  Total Memory: ${totalMemoryDiff > 0 ? '+' : ''}${totalMemoryDiff.toFixed(2)}%`);
        console.log(`  Heap Usage: ${heapDiff > 0 ? '+' : ''}${heapDiff.toFixed(2)}%`);
        console.log(`  External Memory: ${externalDiff > 0 ? '+' : ''}${externalDiff.toFixed(2)}%`);
        console.log(`  RSS: ${rssDiff > 0 ? '+' : ''}${rssDiff.toFixed(2)}%`);
    }
}

async function main() {
    const resultsDir = path.join(__dirname, '..', 'results');
    const files = await fs.promises.readdir(resultsDir);
    
    // Group files by method
    const methodFiles: { [key: string]: string[] } = {
        buffer: [],
        stream: [],
        path: [],
        'sequential-stream': [],
    };

    for (const file of files) {
        if (file.endsWith('.json')) {
            for (const method of Object.keys(methodFiles)) {
                if (file.startsWith(method)) {
                    methodFiles[method].push(path.join(resultsDir, file));
                }
            }
        }
    }

    // Read and combine results for each method
    const results: { [key: string]: TestResults } = {};
    
    for (const [method, files] of Object.entries(methodFiles)) {
        if (files.length === 0) {
            console.warn(`No results found for ${method} method`);
            continue;
        }

        // Use the most recent file for each method
        const latestFile = files.sort().pop()!;
        const content = await fs.promises.readFile(latestFile, 'utf-8');
        results[method] = JSON.parse(content);
    }

    if (Object.keys(results).length === 0) {
        console.error('No results found in the results directory');
        process.exit(1);
    }

    const comparison = compareResults(results);
    printComparison(comparison);

    // Save comparison results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const comparisonPath = path.join(resultsDir, `comparison-${timestamp}.json`);
    await fs.promises.writeFile(comparisonPath, JSON.stringify(comparison, null, 2));
    console.log(`\nComparison results saved to: ${comparisonPath}`);
}

main().catch(console.error); 