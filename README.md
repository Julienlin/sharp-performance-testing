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

### Processing Time

| Method | Average (ms) | Min (ms) | Max (ms) | StdDev |
|--------|-------------|----------|----------|---------|
| Buffer | 500.02      | 476.19   | 570.53   | 19.20   |
| Stream | 507.49      | 480.02   | 595.96   | 25.26   |
| Path   | 498.35      | 475.24   | 603.67   | 27.23   |

### Memory Usage

#### Buffer Method
- Total Memory Footprint: 234.42 MB
- Memory Distribution:
  - Heap Used: 5.15 MB (2.2%)
  - External: 17.27 MB (7.4%)
  - RSS: 211.99 MB (90.4%)
- Detailed Stats:
  - Heap Used: 5.15 MB (min: 4.00 MB, max: 6.00 MB)
  - Heap Total: 6.90 MB (min: 6.00 MB, max: 10.00 MB)
  - External: 17.27 MB (min: 2.00 MB, max: 35.00 MB)
  - RSS: 211.99 MB (min: 56.00 MB, max: 230.00 MB)

#### Stream Method
- Total Memory Footprint: 242.01 MB
- Memory Distribution:
  - Heap Used: 5.37 MB (2.2%)
  - External: 20.82 MB (8.6%)
  - RSS: 215.82 MB (89.2%)
- Detailed Stats:
  - Heap Used: 5.37 MB (min: 5.00 MB, max: 6.00 MB)
  - Heap Total: 7.35 MB (min: 6.00 MB, max: 10.00 MB)
  - External: 20.82 MB (min: 2.00 MB, max: 38.00 MB)
  - RSS: 215.82 MB (min: 57.00 MB, max: 229.00 MB)

#### Path Method
- Total Memory Footprint: 193.22 MB
- Memory Distribution:
  - Heap Used: 5.19 MB (2.7%)
  - External: 2.00 MB (1.0%)
  - RSS: 186.04 MB (96.3%)
- Detailed Stats:
  - Heap Used: 5.19 MB (min: 4.00 MB, max: 6.00 MB)
  - Heap Total: 7.00 MB (min: 6.00 MB, max: 10.00 MB)
  - External: 2.00 MB (min: 2.00 MB, max: 2.00 MB)
  - RSS: 186.04 MB (min: 57.00 MB, max: 196.00 MB)

### Relative Performance (vs Path Method)

| Metric | Buffer | Stream |
|--------|---------|---------|
| Processing Time | +0.33% | +1.83% |
| Total Memory | +21.32% | +25.25% |
| Heap Usage | -0.62% | +3.56% |
| External Memory | +763.67% | +941.03% |
| RSS | +13.95% | +16.01% |

## Analysis

### Processing Time
- All three methods perform similarly, with processing times within 2% of each other
- The Path method shows the lowest average processing time (498.35ms)
- The Stream method has the highest standard deviation (25.26ms), indicating less consistent performance

### Memory Usage
1. **Total Memory Footprint**
   - Path method is most efficient: 193.22 MB
   - Buffer method uses 21.32% more memory
   - Stream method uses 25.25% more memory

2. **Memory Distribution**
   - Path method has the most efficient memory distribution
   - External memory usage is significantly lower in Path method (2.00 MB vs 17.27 MB/20.82 MB)
   - RSS memory is most stable in Path method (stdDev: 63.31 MB vs 78.13 MB/78.16 MB)

3. **Memory Stability**
   - Path method shows the most stable memory usage
   - External memory is constant in Path method (2.00 MB)
   - Stream method has the highest external memory variability

## Conclusion

The Path method emerges as the most efficient approach overall:
1. Fastest average processing time (498.35ms)
2. Lowest total memory footprint (193.22 MB)
3. Most stable memory usage patterns
4. Significantly lower external memory usage

While the Buffer and Stream methods show similar processing times, they use significantly more memory, particularly in external memory allocation. The Path method's consistent and efficient memory usage makes it the recommended choice for production environments where memory efficiency is important.

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