# Sharp Image Processing Performance Test

> **Disclaimer**: This repository and its contents were primarily generated using AI tools. While the code and documentation have been reviewed for accuracy, please use this as a reference and verify the results in your own environment.

## Overview

This project tests different methods of image processing using the Sharp library in Node.js, focusing on memory usage and performance characteristics.

## Test Configuration

- Image Size: 3840x2160 pixels
- Test Iterations: 100
- Memory Sampling Interval: 100ms
- Garbage Collection: Explicitly called between methods
- Node.js Options: `--max-old-space-size=8192 --expose-gc`

## Performance Results

### Processing Time (ms)

| Method | Average | Min | Max | StdDev |
|--------|---------|-----|-----|---------|
| Buffer | 501.83 | 477.52 | 582.34 | 19.66 |
| Stream | 505.99 | 485.76 | 562.90 | 16.85 |
| Path | 492.11 | 479.59 | 523.23 | 9.27 |
| Sequential Stream | 496.20 | 477.45 | 543.04 | 14.88 |

### Memory Usage (MB)

| Method | Total Memory | Heap Used | External | RSS |
|--------|--------------|-----------|----------|-----|
| Buffer | 4.51 | 0.25 (5.7%) | 2.00 (44.3%) | 2.25 (50.0%) |
| Stream | 4.91 | 0.04 (0.9%) | 2.47 (50.3%) | 2.40 (48.9%) |
| Path | 3.21 | 0.11 (3.4%) | 0.00 (0.0%) | 3.10 (96.6%) |
| Sequential Stream | 3.16 | 0.15 (4.7%) | 0.00 (0.0%) | 3.01 (95.3%) |

### Memory Usage Comparison (vs Sequential Stream Method)

| Method | Processing Time | Total Memory | Heap Usage | External Memory | RSS |
|--------|----------------|--------------|------------|-----------------|-----|
| Buffer | +1.14% | +42.59% | +71.79% | +Infinity% | -25.20% |
| Stream | +1.97% | +55.14% | -71.65% | +Infinity% | -20.47% |
| Path | -0.82% | +1.43% | -26.57% | NaN% | +2.81% |

## Overall Memory Usage Analysis

### Total Memory Footprint
- Buffer Method: 4.51 MB
- Stream Method: 4.91 MB
- Path Method: 3.21 MB
- Sequential Stream Method: 3.16 MB

### Memory Efficiency
- Sequential Stream method is the most memory-efficient overall
- Path method shows similar efficiency
- Buffer and Stream methods use significantly more memory

### Memory Distribution
- Heap Usage: All methods use small amounts (0.04-0.25 MB)
- External Memory: Path and Sequential Stream have none, Buffer and Stream use significant amounts
- RSS: Path method has highest (3.10 MB), Sequential Stream second (3.01 MB)

### Memory Stability
- Path method shows most stable memory usage (External memory stdDev: 0.00)
- Sequential Stream method demonstrates good stability (External memory stdDev: 0.00)
- Stream method shows highest variability in External memory (stdDev: 0.85)

## Conclusion

The test results show that all four methods perform similarly in terms of processing time (within 2% of each other), but exhibit significant differences in memory usage patterns:

1. **Sequential Stream Method**:
   - Most memory-efficient overall (3.16 MB)
   - Moderate heap usage (0.15 MB)
   - No external memory usage
   - Most stable memory pattern
   - Best choice for memory-constrained environments

2. **Path Method**:
   - Second most memory-efficient (3.21 MB)
   - Low heap usage (0.11 MB)
   - No external memory usage
   - Most stable memory pattern
   - Fastest processing time

3. **Buffer Method**:
   - Higher memory usage (4.51 MB)
   - Highest heap usage (0.25 MB)
   - Significant external memory (2.00 MB)
   - Good processing time performance

4. **Stream Method**:
   - Highest memory usage (4.91 MB)
   - Lowest heap usage (0.04 MB)
   - Highest external memory (2.47 MB)
   - Most variable memory pattern

The choice between methods should be based on your specific requirements:
- For memory efficiency: Use the Sequential Stream method
- For processing speed: Use the Path method
- For balanced performance: Use the Buffer method
- Avoid the Stream method unless specific streaming requirements exist

## Running the Tests

To run all tests and generate a comparison:

```bash
npm run compare:all
```