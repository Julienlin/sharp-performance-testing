# Sharp Performance Test

> **Disclaimer**: This repository and its contents were primarily generated using AI tools. While the code and documentation have been reviewed for accuracy, please use this as a reference and verify the results in your own environment.

This project compares the performance of different methods for image processing using the Sharp library in Node.js. It specifically tests three approaches:
1. Buffer-based processing
2. Stream-based processing
3. Path-based processing

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
| Buffer | 498.12 | 471.87 | 596.93 | 32.36 |
| Stream | 492.36 | 477.39 | 537.65 | 13.86 |
| Path | 482.81 | 468.51 | 563.38 | 17.46 |
| Sequential Stream | 483.17 | 467.09 | 525.78 | 13.06 |

### Memory Usage (MB)

| Method | Total Memory | Heap Used | External | RSS |
|--------|--------------|-----------|----------|-----|
| Buffer | 235.26 | 5.25 (2.2%) | 17.70 (7.5%) | 212.31 (90.2%) |
| Stream | 241.29 | 5.51 (2.3%) | 20.26 (8.4%) | 215.52 (89.3%) |
| Path | 193.04 | 5.30 (2.7%) | 2.00 (1.0%) | 185.74 (96.2%) |
| Sequential Stream | 203.64 | 5.37 (2.6%) | 7.64 (3.8%) | 190.63 (93.6%) |

### Memory Usage Comparison (vs Path Method)

| Method | Processing Time | Total Memory | Heap Usage | External Memory | RSS |
|--------|----------------|--------------|------------|-----------------|-----|
| Buffer | +3.17% | +21.87% | -0.99% | +784.92% | +14.31% |
| Stream | +1.98% | +25.00% | +3.87% | +913.22% | +16.03% |
| Sequential Stream | +0.07% | +5.49% | +1.21% | +281.96% | +2.63% |

## Overall Memory Usage Analysis

### Total Memory Footprint
- Buffer Method: 235.26 MB
- Stream Method: 241.29 MB
- Path Method: 193.04 MB
- Sequential Stream Method: 203.64 MB

### Memory Efficiency
- Path method remains the most memory-efficient overall
- Sequential Stream method shows improved efficiency compared to Buffer and Stream methods
- Stream method uses the most memory among all methods

### Memory Distribution
- Heap Usage: All methods use similar amounts (5.25-5.51 MB)
- External Memory: Path method has lowest (2.00 MB), Stream highest (20.26 MB)
- RSS: Path method has lowest (185.74 MB), Stream highest (215.52 MB)

### Memory Stability
- Path method shows most stable memory usage (External memory stdDev: 0.00)
- Sequential Stream method demonstrates good stability (External memory stdDev: 5.75)
- Buffer and Stream methods show higher memory variability (External memory stdDev: 13.48 and 14.70)

## Conclusion

The test results show that all four methods perform similarly in terms of processing time (within 3.2% of each other), but exhibit significant differences in memory usage patterns:

1. **Path Method**:
   - Most memory-efficient overall (193.04 MB)
   - Lowest external memory usage (2.00 MB)
   - Most stable memory footprint
   - Best choice for memory-constrained environments

2. **Sequential Stream Method**:
   - Second most memory-efficient (203.64 MB)
   - Moderate external memory usage (7.64 MB)
   - Good stability
   - Best processing time performance
   - Good balance between performance and memory usage

3. **Buffer Method**:
   - Moderate memory usage (235.26 MB)
   - High external memory usage (17.70 MB)
   - Good processing time
   - Suitable when memory is not a primary concern

4. **Stream Method**:
   - Highest memory usage (241.29 MB)
   - Highest external memory usage (20.26 MB)
   - Similar processing time
   - Best avoided in memory-constrained environments

The choice between methods should be based on your specific requirements:
- For memory efficiency: Use the Path method
- For balanced performance: Use the Sequential Stream method
- For maximum processing speed: Use the Buffer method
- Avoid the Stream method unless specific streaming requirements exist

## Running the Tests

To run all tests and generate a comparison:

```bash
npm run compare:all
```

This will:
1. Build the project
2. Run all three test methods
3. Generate a detailed comparison
4. Save results to JSON files in the `results` directory 