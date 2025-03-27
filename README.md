# Sharp Performance Test

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
| Buffer | 488.30 | 469.58 | 563.52 | 18.09 |
| Stream | 494.45 | 477.22 | 567.65 | 18.40 |
| Path | 484.88 | 472.08 | 516.20 | 11.33 |
| Sequential Stream | 485.99 | 470.54 | 535.27 | 15.34 |

### Memory Usage (MB)

| Method | Total Memory | Heap Used | External | RSS |
|--------|--------------|-----------|----------|-----|
| Buffer | 2.69 | 0.72 (26.8%) | 0.05 (1.8%) | 1.92 (71.4%) |
| Stream | 1.40 | 0.06 (4.4%) | -0.88 (-62.9%) | 2.22 (158.5%) |
| Path | 3.37 | 0.51 (15.3%) | 0.00 (0.0%) | 2.85 (84.7%) |
| Sequential Stream | 3.77 | 0.38 (10.1%) | 0.00 (0.0%) | 3.39 (89.9%) |

### Memory Usage Comparison (vs Stream Method)

| Method | Processing Time | Total Memory | Heap Usage | External Memory | RSS |
|--------|----------------|--------------|------------|-----------------|-----|
| Buffer | -1.24% | +91.86% | +1062.76% | -105.48% | -13.57% |
| Path | -1.94% | +140.55% | +731.45% | -100.00% | +28.57% |
| Sequential Stream | -1.71% | +168.99% | +514.63% | -100.00% | +52.56% |

## Overall Memory Usage Analysis

### Total Memory Footprint
- Buffer Method: 2.69 MB
- Stream Method: 1.40 MB
- Path Method: 3.37 MB
- Sequential Stream Method: 3.77 MB

### Memory Efficiency
- Stream method is the most memory-efficient overall
- Buffer method shows moderate memory usage
- Path and Sequential Stream methods use more memory but have more stable patterns

### Memory Distribution
- Heap Usage: All methods use relatively small amounts (0.06-0.72 MB)
- External Memory: Stream method shows negative values due to memory cleanup
- RSS: Stream method has highest (2.22 MB), Sequential Stream second (3.39 MB)

### Memory Stability
- Path method shows most stable memory usage (External memory stdDev: 0.00)
- Sequential Stream method demonstrates good stability (External memory stdDev: 0.00)
- Stream method shows highest variability in External memory (stdDev: 2.33)

## Conclusion

The test results show that all four methods perform similarly in terms of processing time (within 2% of each other), but exhibit significant differences in memory usage patterns:

1. **Stream Method**:
   - Most memory-efficient overall (1.40 MB)
   - Lowest heap usage (0.06 MB)
   - Negative external memory due to cleanup
   - Best choice for memory-constrained environments

2. **Buffer Method**:
   - Moderate memory usage (2.69 MB)
   - Highest heap usage (0.72 MB)
   - Small external memory footprint
   - Good processing time performance

3. **Path Method**:
   - Higher memory usage (3.37 MB)
   - Moderate heap usage (0.51 MB)
   - No external memory usage
   - Most stable memory pattern

4. **Sequential Stream Method**:
   - Highest memory usage (3.77 MB)
   - Lowest heap usage (0.38 MB)
   - No external memory usage
   - Good processing time performance

The choice between methods should be based on your specific requirements:
- For memory efficiency: Use the Stream method
- For processing speed: Use the Path method
- For balanced performance: Use the Buffer method
- For stable memory patterns: Use the Path or Sequential Stream method

## Running the Tests

To run all tests and generate a comparison:

```bash
npm run compare:all
```