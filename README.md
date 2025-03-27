# Sharp Performance Test

> **Disclaimer**: This repository and its contents were primarily generated using AI tools. While the code and documentation have been reviewed for accuracy, please use this as a reference and verify the results in your own environment.

This project compares the performance of Sharp image processing library using different methods: buffer, stream, and direct path access.

## Setup

### Prerequisites
- Node.js (v20 or higher)
- npm (comes with Node.js)

### Installation
1. Clone the repository:
```bash
git clone <repository-url>
cd sharp-performance-test
```

2. Install dependencies:
```bash
npm install
```

3. Build the TypeScript project:
```bash
npm run build
```

### Running the Test
To run the performance test:
```bash
npm start
```

The test will:
1. Create a test image if it doesn't exist
2. Run 500 iterations for each method (buffer, stream, and path)
3. Display progress every 100 iterations
4. Show final results with detailed statistics

## Test Configuration

- **Iterations**: 500
- **Input Image**: 3840x2160 (4K)
- **Output Width**: 1920px (maintaining aspect ratio)
- **Node.js Memory Limit**: 8GB (--max-old-space-size=8192)
- **Memory Sampling Interval**: 100ms
- **Cache**: Disabled for each iteration
- **Garbage Collection**: Explicitly called between methods

## Results

### Buffer Method
- **Average Time**: 500.52ms
- **Min Time**: 470.75ms
- **Max Time**: 672.34ms
- **Memory Usage**:
  - Heap Used: 5.97MB (min: 4.00MB, max: 7.00MB)
  - Heap Total: 7.25MB (min: 6.00MB, max: 10.00MB)
  - External: 20.45MB (min: 2.00MB, max: 35.00MB)
  - RSS: 228.50MB (min: 56.00MB, max: 234.00MB)

### Stream Method
- **Average Time**: 503.73ms
- **Min Time**: 473.89ms
- **Max Time**: 710.36ms
- **Memory Usage**:
  - Heap Used: 6.81MB (min: 5.00MB, max: 8.00MB)
  - Heap Total: 8.29MB (min: 8.00MB, max: 10.00MB)
  - External: 20.60MB (min: 6.00MB, max: 36.00MB)
  - RSS: 234.30MB (min: 233.00MB, max: 236.00MB)

### Path Method
- **Average Time**: 506.65ms
- **Min Time**: 470.02ms
- **Max Time**: 801.24ms
- **Memory Usage**:
  - Heap Used: 7.42MB (min: 6.00MB, max: 9.00MB)
  - Heap Total: 9.15MB (min: 9.00MB, max: 10.00MB)
  - External: 4.18MB (min: 2.00MB, max: 31.00MB)
  - RSS: 237.02MB (min: 235.00MB, max: 240.00MB)

### Performance Comparison
- **Time Differences**:
  - Buffer vs Stream: 3.21ms
  - Buffer vs Path: 6.13ms
  - Stream vs Path: 2.92ms
- **Performance Ratios**:
  - Path vs Buffer: Path is 0.99x faster
  - Path vs Stream: Path is 0.99x faster
  - Stream vs Buffer: Stream is 0.99x faster

### Memory Usage Comparison
- **Heap Used**:
  - Buffer vs Path: Buffer uses 0.80x more
  - Stream vs Path: Stream uses 0.92x more
  - Buffer vs Stream: Buffer uses 0.88x more
- **Heap Total**:
  - Buffer vs Path: Buffer uses 0.79x more
  - Stream vs Path: Stream uses 0.91x more
  - Buffer vs Stream: Buffer uses 0.88x more
- **External Memory**:
  - Buffer vs Path: Buffer uses 4.89x more
  - Stream vs Path: Stream uses 4.93x more
  - Buffer vs Stream: Buffer uses 0.99x more
- **RSS (Resident Set Size)**:
  - Buffer vs Path: Buffer uses 0.96x more
  - Stream vs Path: Stream uses 0.99x more
  - Buffer vs Stream: Buffer uses 0.98x more

## Conclusion

The test results show that all three methods perform very similarly in terms of processing time, with differences of less than 1% between them. However, there are notable differences in memory usage:

1. **Processing Time**:
   - All methods perform within 1% of each other
   - The buffer method is slightly faster (500.52ms) than the path method (506.65ms)
   - The stream method falls in between (503.73ms)

2. **Memory Usage**:
   - The path method uses the most heap memory (7.42MB) but the least external memory (4.18MB)
   - The buffer method uses the least heap memory (5.97MB) but the most external memory (20.45MB)
   - The stream method falls in between for both metrics
   - RSS is similar across all methods, with the path method using slightly more (237.02MB)

3. **Recommendations**:
   - For applications where memory usage is critical, the buffer method might be preferred as it uses the least heap memory
   - For applications where external memory usage is a concern, the path method is the most efficient
   - The stream method provides a good balance between heap and external memory usage
   - All methods are viable choices as they perform similarly in terms of processing time 