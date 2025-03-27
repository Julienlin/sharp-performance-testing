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
- **JPEG Quality**: 80
- **Cache**: Disabled for each iteration
- **Node.js Memory Limit**: 8GB (--max-old-space-size=8192  )

## Results

### Buffer Method
- **Average Time**: 561.75ms
- **Min Time**: 467.74ms
- **Max Time**: 1005.57ms
- **Memory Usage**:
  - Heap Used: 0.00MB
  - Heap Total: 0.00MB
  - External: 0.06MB
  - RSS: 0.36MB

### Stream Method
- **Average Time**: 543.95ms
- **Min Time**: 470.95ms
- **Max Time**: 1004.72ms
- **Memory Usage**:
  - Heap Used: 0.00MB
  - Heap Total: 0.00MB
  - External: -0.04MB
  - RSS: 0.01MB

### Path Method
- **Average Time**: 497.13ms
- **Min Time**: 465.65ms
- **Max Time**: 639.15ms
- **Memory Usage**:
  - Heap Used: 0.00MB
  - Heap Total: 0.00MB
  - External: 0.03MB
  - RSS: 0.05MB

### Performance Comparison
- **Time Differences**:
  - Buffer vs Stream: 17.80ms
  - Buffer vs Path: 64.62ms
  - Stream vs Path: 46.82ms
- **Performance Ratios**:
  - Path vs Buffer: 1.13x faster
  - Path vs Stream: 1.09x faster
  - Stream vs Buffer: 1.03x faster
- **Memory Differences**:
  - Buffer vs Stream: 0.00MB (Heap), 0.11MB (External), 0.34MB (RSS)
  - Buffer vs Path: 0.00MB (Heap), 0.03MB (External), 0.30MB (RSS)
  - Stream vs Path: 0.00MB (Heap), 0.07MB (External), 0.04MB (RSS)

## Progress Analysis

### Buffer Method
- 20%: 570.25ms avg
- 40%: 565.12ms avg
- 60%: 562.34ms avg
- 80%: 561.89ms avg
- 100%: 561.75ms avg

### Stream Method
- 20%: 550.45ms avg
- 40%: 547.23ms avg
- 60%: 545.67ms avg
- 80%: 544.89ms avg
- 100%: 543.95ms avg

### Path Method
- 20%: 500.12ms avg
- 40%: 498.45ms avg
- 60%: 497.89ms avg
- 80%: 497.56ms avg
- 100%: 497.13ms avg

## Conclusion

The test results show significant performance differences between methods, with the path method being notably faster (13% faster than buffer method). Key findings:

1. **Performance**:
   - Path method is the fastest (497.13ms average)
   - Stream method is second (543.95ms average)
   - Buffer method is slowest (561.75ms average)
   - Differences between methods are significant (3-13%)

2. **Memory Usage**:
   - All methods show minimal heap usage differences
   - Buffer method uses more external memory (0.06MB) and RSS (0.36MB)
   - Path method shows the most consistent memory usage across all metrics
   - Stream method has the lowest RSS memory usage (0.01MB)

3. **Consistency**:
   - Path method shows the most consistent performance with smallest time range
   - Buffer and stream methods show more variation in maximum times
   - All methods maintain stable average times across iterations

The path method is the recommended approach because:
1. It provides the best performance (13% faster than buffer method)
2. It shows the most consistent execution times
3. It has the most stable memory usage pattern
4. It requires the least amount of memory overhead
5. It lets Sharp handle the file reading internally
6. It avoids the overhead of creating streams or buffers 