import process from 'node:process';

const mode = process.argv[2] || 'candidate';

function createPRNG(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function() {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateDatasets(count, size, seed) {
  const prng = createPRNG(seed);
  const datasets = [];
  for (let i = 0; i < count; i++) {
    const arr = new Int32Array(size);
    for (let j = 0; j < size; j++) {
      arr[j] = Math.floor(prng() * 1000000);
    }
    datasets.push(arr);
  }
  return datasets;
}

function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left, right) {
  const result = new Int32Array(left.length + right.length);
  let i = 0, j = 0, k = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result[k++] = left[i++];
    } else {
      result[k++] = right[j++];
    }
  }
  while (i < left.length) result[k++] = left[i++];
  while (j < right.length) result[k++] = right[j++];
  return result;
}

function quickSort(arr) {
  sortInPlace(arr, 0, arr.length - 1);
  return arr;
}

function sortInPlace(arr, low, high) {
  if (low < high) {
    const pi = partition(arr, low, high);
    sortInPlace(arr, low, pi - 1);
    sortInPlace(arr, pi + 1, high);
  }
}

function partition(arr, low, high) {
  const pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      i++;
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
  }
  const temp = arr[i + 1];
  arr[i + 1] = arr[high];
  arr[high] = temp;
  return i + 1;
}

function isSorted(arr) {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < arr[i - 1]) return false;
  }
  return true;
}

const N = 10000;
const REPS = 50;
const SEED = 42;

const originalDatasets = generateDatasets(REPS, N, SEED);

for (let i = 0; i < 5; i++) {
  const dummy = new Int32Array(originalDatasets[0]);
  if (mode === 'baseline') {
    mergeSort(dummy);
  } else {
    quickSort(dummy);
  }
}

let totalTimeNs = 0n;

if (global.gc) {
  global.gc();
}

const memBefore = process.memoryUsage().heapUsed;

for (let i = 0; i < REPS; i++) {
  const data = new Int32Array(originalDatasets[i]);
  const start = process.hrtime.bigint();
  let sorted;
  if (mode === 'baseline') {
    sorted = mergeSort(data);
  } else {
    sorted = quickSort(data);
  }
  const end = process.hrtime.bigint();
  
  if (!isSorted(sorted)) {
    console.error(JSON.stringify({ error: "Verification failed: array not sorted" }));
    process.exit(1);
  }
  
  totalTimeNs += (end - start);
}

const memAfter = process.memoryUsage().heapUsed;
const avgTimeMs = Number(totalTimeNs) / (REPS * 1_000_000);

const result = {
  metrics: {
    execution_time_ms: Number(avgTimeMs.toFixed(4)),
    heap_memory_allocated_bytes: Math.max(0, memAfter - memBefore)
  },
  metadata: {
    algorithm: mode === 'baseline' ? 'MergeSort' : 'QuickSort',
    n: N,
    reps: REPS,
    node_version: process.version
  }
};

console.log(JSON.stringify(result));
