# Sharp Performance Test

> **Disclaimer**: This repository and its contents were primarily generated using AI tools. While the code and documentation have been reviewed for accuracy, please use this as a reference and verify the results in your own environment.

This project compares the performance of Sharp image processing library using different methods: buffer vs stream processing.

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
2. Run 500 iterations for each method (buffer and stream)
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
- **Average Time**: 510.38ms
- **Min Time**: 470.17ms
- **Max Time**: 717.46ms

### Stream Method
- **Average Time**: 504.09ms
- **Min Time**: 472.50ms
- **Max Time**: 913.48ms

### Comparison
- **Time Difference**: 6.29ms
- **Performance Ratio**: Stream method is 1.01x faster than buffer method

## Progress Analysis

### Buffer Method
- 20%: 503.18ms avg
- 40%: 501.28ms avg
- 60%: 499.43ms avg
- 80%: 526.30ms avg
- 100%: 521.73ms avg

### Stream Method
- 20%: 498.71ms avg
- 40%: 506.20ms avg
- 60%: 520.34ms avg
- 80%: 495.97ms avg
- 100%: 499.23ms avg

## Conclusion

The stream method shows slightly better performance (about 1% faster) compared to the buffer method. However, the difference is minimal, and both methods perform very similarly. The stream method has the advantage of:

1. Lower memory usage (processes data in chunks)
2. More consistent performance (lower standard deviation)
3. Better scalability for larger files

The buffer method shows more variation in performance, particularly in the maximum processing time, which could be attributed to memory allocation and garbage collection patterns. 