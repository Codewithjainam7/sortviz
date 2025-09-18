import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';

interface ArrayElement {
  value: number;
  id: number;
  state: 'default' | 'comparing' | 'swapping' | 'sorted';
}

interface SortingStats {
  comparisons: number;
  swaps: number;
  timeComplexity: string;
  spaceComplexity: string;
}

const SortVisualizer: React.FC = () => {
  const [array, setArray] = useState<ArrayElement[]>([]);
  const [arraySize, setArraySize] = useState<number>(20);
  const [speed, setSpeed] = useState<number>(50);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [algorithm, setAlgorithm] = useState<string>('bubble');
  const [stats, setStats] = useState<SortingStats>({
    comparisons: 0,
    swaps: 0,
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)'
  });

  const isPlayingRef = useRef(isPlaying);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Generate random array
  const generateArray = useCallback(() => {
    const newArray: ArrayElement[] = [];
    for (let i = 0; i < arraySize; i++) {
      newArray.push({
        value: Math.floor(Math.random() * 300) + 10,
        id: i,
        state: 'default'
      });
    }
    setArray(newArray);
    setStats({
      comparisons: 0,
      swaps: 0,
      timeComplexity: getTimeComplexity(algorithm),
      spaceComplexity: getSpaceComplexity(algorithm)
    });
  }, [arraySize, algorithm]);

  // Initialize array on mount and size change
  useEffect(() => {
    generateArray();
  }, [generateArray]);

  const getTimeComplexity = (algo: string): string => {
    switch (algo) {
      case 'bubble': return 'O(n²)';
      case 'selection': return 'O(n²)';
      case 'insertion': return 'O(n²)';
      case 'merge': return 'O(n log n)';
      default: return 'O(n²)';
    }
  };

  const getSpaceComplexity = (algo: string): string => {
    switch (algo) {
      case 'merge': return 'O(n)';
      default: return 'O(1)';
    }
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Bubble Sort Animation
  const bubbleSort = async () => {
    const arr = [...array];
    let comparisons = 0;
    let swaps = 0;
    
    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        if (!isPlayingRef.current) return;
        
        // Highlight comparing elements
        arr[j].state = 'comparing';
        arr[j + 1].state = 'comparing';
        comparisons++;
        
        setArray([...arr]);
        setStats(prev => ({ ...prev, comparisons }));
        
        await new Promise(resolve => setTimeout(resolve, 101 - speed));
        
        if (arr[j].value > arr[j + 1].value) {
          // Swap elements
          arr[j].state = 'swapping';
          arr[j + 1].state = 'swapping';
          setArray([...arr]);
          
          await new Promise(resolve => setTimeout(resolve, 101 - speed));
          
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          swaps++;
          setStats(prev => ({ ...prev, swaps }));
        }
        
        // Reset states
        arr[j].state = 'default';
        arr[j + 1].state = 'default';
        setArray([...arr]);
      }
      
      // Mark as sorted
      arr[arr.length - i - 1].state = 'sorted';
      setArray([...arr]);
    }
    
    // Mark first element as sorted
    if (arr.length > 0) {
      arr[0].state = 'sorted';
      setArray([...arr]);
    }
    
    setIsPlaying(false);
  };

  // Selection Sort Animation
  const selectionSort = async () => {
    const arr = [...array];
    let comparisons = 0;
    let swaps = 0;

    for (let i = 0; i < arr.length - 1; i++) {
      if (!isPlayingRef.current) return;
      
      let minIdx = i;
      arr[i].state = 'sorted';

      for (let j = i + 1; j < arr.length; j++) {
        if (!isPlayingRef.current) return;

        arr[j].state = 'comparing';
        arr[minIdx].state = 'comparing';
        comparisons++;

        setArray([...arr]);
        setStats(prev => ({ ...prev, comparisons }));
        await sleep(101 - speed);

        if (arr[j].value < arr[minIdx].value) {
          if (minIdx !== i) arr[minIdx].state = 'default';
          minIdx = j;
        } else {
          arr[j].state = 'default';
        }
      }

      if (minIdx !== i) {
        arr[i].state = 'swapping';
        arr[minIdx].state = 'swapping';
        setArray([...arr]);
        await sleep(101 - speed);

        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        swaps++;
        setStats(prev => ({ ...prev, swaps }));
      }

      arr[i].state = 'sorted';
      if (minIdx !== i) arr[minIdx].state = 'default';
      setArray([...arr]);
    }

    if (arr.length > 0) {
      arr[arr.length - 1].state = 'sorted';
      setArray([...arr]);
    }
    setIsPlaying(false);
  };

  // Insertion Sort Animation
  const insertionSort = async () => {
    const arr = [...array];
    let comparisons = 0;
    let swaps = 0;

    arr[0].state = 'sorted';
    setArray([...arr]);

    for (let i = 1; i < arr.length; i++) {
      if (!isPlayingRef.current) return;

      let key = arr[i];
      key.state = 'comparing';
      let j = i - 1;

      setArray([...arr]);
      await sleep(101 - speed);

      while (j >= 0 && arr[j].value > key.value) {
        if (!isPlayingRef.current) return;

        arr[j].state = 'comparing';
        comparisons++;
        setStats(prev => ({ ...prev, comparisons }));
        setArray([...arr]);
        await sleep(101 - speed);

        arr[j + 1] = arr[j];
        arr[j + 1].state = 'swapping';
        swaps++;
        setStats(prev => ({ ...prev, swaps }));
        setArray([...arr]);
        await sleep(101 - speed);

        arr[j].state = 'default';
        j--;
      }

      arr[j + 1] = key;
      arr[j + 1].state = 'sorted';
      
      for (let k = 0; k <= i; k++) {
        arr[k].state = 'sorted';
      }
      
      setArray([...arr]);
    }
    setIsPlaying(false);
  };

  // Merge Sort Animation
  const mergeSort = async () => {
    const arr = [...array];
    let comparisons = 0;
    let swaps = 0;

    const merge = async (left: number, mid: number, right: number) => {
      if (!isPlayingRef.current) return;

      const leftArr = arr.slice(left, mid + 1);
      const rightArr = arr.slice(mid + 1, right + 1);
      
      let i = 0, j = 0, k = left;

      while (i < leftArr.length && j < rightArr.length) {
        if (!isPlayingRef.current) return;

        arr[left + i].state = 'comparing';
        arr[mid + 1 + j].state = 'comparing';
        comparisons++;
        setStats(prev => ({ ...prev, comparisons }));
        setArray([...arr]);
        await sleep(101 - speed);

        if (leftArr[i].value <= rightArr[j].value) {
          arr[k] = leftArr[i];
          i++;
        } else {
          arr[k] = rightArr[j];
          j++;
        }
        
        arr[k].state = 'swapping';
        swaps++;
        setStats(prev => ({ ...prev, swaps }));
        setArray([...arr]);
        await sleep(101 - speed);
        
        arr[k].state = 'default';
        k++;
      }

      while (i < leftArr.length) {
        if (!isPlayingRef.current) return;
        arr[k] = leftArr[i];
        arr[k].state = 'swapping';
        setArray([...arr]);
        await sleep(101 - speed);
        arr[k].state = 'default';
        i++;
        k++;
      }

      while (j < rightArr.length) {
        if (!isPlayingRef.current) return;
        arr[k] = rightArr[j];
        arr[k].state = 'swapping';
        setArray([...arr]);
        await sleep(101 - speed);
        arr[k].state = 'default';
        j++;
        k++;
      }

      for (let idx = left; idx <= right; idx++) {
        arr[idx].state = 'sorted';
      }
      setArray([...arr]);
    };

    const mergeSortHelper = async (left: number, right: number) => {
      if (!isPlayingRef.current || left >= right) return;

      const mid = Math.floor((left + right) / 2);
      await mergeSortHelper(left, mid);
      await mergeSortHelper(mid + 1, right);
      await merge(left, mid, right);
    };

    await mergeSortHelper(0, arr.length - 1);
    setIsPlaying(false);
  };

  const startSorting = () => {
    isPlayingRef.current = true;
    setIsPlaying(true);
    switch (algorithm) {
      case 'bubble': bubbleSort(); break;
      case 'selection': selectionSort(); break;
      case 'insertion': insertionSort(); break;
      case 'merge': mergeSort(); break;
      default: bubbleSort();
    }
  };

  const stopSorting = () => {
    isPlayingRef.current = false;
    setIsPlaying(false);
  };

  const resetArray = () => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    generateArray();
  };

  const getBarHeight = (value: number): string => {
    const maxHeight = 280;
    const minHeight = 20;
    const normalizedHeight = ((value - 10) / 290) * (maxHeight - minHeight) + minHeight;
    return `${normalizedHeight}px`;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-primary">
            SortViz
          </h1>
          <p className="text-muted-foreground text-lg">
            Algorithm Visualization in Real-Time
          </p>
        </div>

        {/* Control Panel */}
        <Card className="control-panel">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            {/* Algorithm Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Algorithm</label>
              <Select value={algorithm} onValueChange={setAlgorithm} disabled={isPlaying}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bubble">Bubble Sort</SelectItem>
                  <SelectItem value="selection">Selection Sort</SelectItem>
                  <SelectItem value="insertion">Insertion Sort</SelectItem>
                  <SelectItem value="merge">Merge Sort</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Array Size */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Array Size: {arraySize}
              </label>
              <Slider
                value={[arraySize]}
                onValueChange={(value) => setArraySize(value[0])}
                min={5}
                max={50}
                step={1}
                disabled={isPlaying}
                className="w-full"
              />
            </div>

            {/* Speed Control */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Speed: {speed}%
              </label>
              <Slider
                value={[speed]}
                onValueChange={(value) => setSpeed(value[0])}
                min={1}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              <Button
                onClick={isPlaying ? stopSorting : startSorting}
                disabled={array.every(el => el.state === 'sorted')}
                className="btn-futuristic flex-1"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                onClick={resetArray}
                disabled={isPlaying}
                variant="outline"
                className="px-3"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats Display */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stats-display text-center">
            <div className="text-2xl font-bold text-primary">{stats.comparisons}</div>
            <div className="text-sm text-muted-foreground">Comparisons</div>
          </div>
          <div className="stats-display text-center">
            <div className="text-2xl font-bold text-primary">{stats.swaps}</div>
            <div className="text-sm text-muted-foreground">Swaps</div>
          </div>
          <div className="stats-display text-center">
            <div className="text-lg font-bold text-accent">{stats.timeComplexity}</div>
            <div className="text-sm text-muted-foreground">Time Complexity</div>
          </div>
          <div className="stats-display text-center">
            <div className="text-lg font-bold text-accent">{stats.spaceComplexity}</div>
            <div className="text-sm text-muted-foreground">Space Complexity</div>
          </div>
        </div>

        {/* Visualization */}
        <Card className="viz-container">
          <div className="flex items-end justify-center space-x-1 h-80">
            {array.map((element, index) => (
              <div
                key={`${element.id}-${index}`}
                className={`viz-bar ${element.state} rounded-t-sm`}
                style={{
                  height: getBarHeight(element.value),
                  width: `${Math.max(600 / arraySize, 8)}px`,
                }}
              >
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground">
                  {element.value}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Algorithm Info */}
        <Card className="p-6 bg-card/50">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
              <Zap className="w-5 h-5" />
              {algorithm === 'bubble' && 'Bubble Sort Algorithm'}
              {algorithm === 'selection' && 'Selection Sort Algorithm'}
              {algorithm === 'insertion' && 'Insertion Sort Algorithm'}
              {algorithm === 'merge' && 'Merge Sort Algorithm'}
            </h3>
            <p className="text-muted-foreground">
              {algorithm === 'bubble' && 'Bubble Sort repeatedly steps through the list, compares adjacent elements and swaps them if they\'re in the wrong order. Watch as larger elements "bubble" to their correct positions!'}
              {algorithm === 'selection' && 'Selection Sort finds the minimum element and places it at the beginning, then repeats for the remaining unsorted portion. Watch as it builds the sorted array from left to right!'}
              {algorithm === 'insertion' && 'Insertion Sort builds the sorted array one element at a time by inserting each element into its correct position. Watch as it maintains a sorted portion that grows with each iteration!'}
              {algorithm === 'merge' && 'Merge Sort uses divide-and-conquer to recursively split the array, then merges sorted subarrays back together. Watch the powerful O(n log n) performance in action!'}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SortVisualizer;