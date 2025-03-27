#!/bin/zsh

# Exit on error
set -e

echo "Building project..."
npm run build

echo -e "\nRunning Buffer Test..."
time npm run test:buffer

echo -e "\nRunning Stream Test..."
time npm run test:stream

echo -e "\nRunning Path Test..."
time npm run test:path

echo -e "\nRunning Comparison Analysis..."
npm run compute:comparison

echo -e "\nAll tests completed successfully!" 