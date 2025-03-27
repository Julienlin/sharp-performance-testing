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

## Results

### Buffer Method
- **Average Time**: 509.34ms
- **Min Time**: 473.74ms
- **Max Time**: 696.95ms
- **Memory Usage**:
  - Heap Used: 0.00MB
  - Heap Total: -0.00MB
  - External: 0.02MB

### Stream Method
- **Average Time**: 507.78ms
- **Min Time**: 473.62ms
- **Max Time**: 650.74ms
- **Memory Usage**:
  - Heap Used: 0.00MB
  - Heap Total: 0.00MB
  - External: 0.03MB

### Path Method
- **Average Time**: 498.63ms
- **Min Time**: 469.77ms
- **Max Time**: 627.06ms
- **Memory Usage**:
  - Heap Used: 0.00MB
  - Heap Total: 0.00MB
  - External: -0.04MB

### Performance Comparison
- **Time Differences**:
  - Buffer vs Stream: 1.56ms
  - Buffer vs Path: 10.71ms
  - Stream vs Path: 9.15ms
- **Performance Ratios**:
  - Stream vs Buffer: 1.00x
  - Path vs Buffer: 1.02x
  - Path vs Stream: 1.02x
- **Memory Differences**:
  - Heap Used (Buffer vs Stream): 0.00MB
  - Heap Used (Buffer vs Path): 0.00MB
  - Heap Used (Stream vs Path): 0.00MB

## Progress Analysis

### Buffer Method
- 20%: 515.70ms avg
- 40%: 507.28ms avg
- 60%: 504.13ms avg
- 80%: 503.89ms avg
- 100%: 515.73ms avg

### Stream Method
- 20%: 509.93ms avg
- 40%: 505.60ms avg
- 60%: 509.31ms avg
- 80%: 508.56ms avg
- 100%: 505.52ms avg

### Path Method
- 20%: 497.62ms avg
- 40%: 494.02ms avg
- 60%: 500.34ms avg
- 80%: 507.71ms avg
- 100%: 493.48ms avg

## Conclusion

The test results show that all three methods perform similarly, with the path method being slightly faster (about 2% faster than buffer and stream methods). Key findings:

1. **Performance**:
   - Path method is the fastest (498.63ms average)
   - Stream method is second (507.78ms average)
   - Buffer method is slowest (509.34ms average)
   - Differences between methods are small (1-2%)

2. **Memory Usage**:
   - All methods show very similar memory usage
   - Memory differences are negligible
   - External memory usage varies slightly but remains very small

3. **Consistency**:
   - Path method shows the most consistent performance
   - Stream method is slightly more consistent than buffer method
   - All methods maintain stable performance across iterations

The path method appears to be the most efficient approach because:
1. It lets Sharp handle the file reading internally
2. It avoids the overhead of creating streams or buffers
3. It can optimize the file access pattern
4. It shows the most consistent performance across iterations 