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
      timeComplexity: algorithm === 'bubble' ? 'O(n²)' : 'O(n²)',
      spaceComplexity: 'O(1)'
    });
  }, [arraySize, algorithm]);

  // Initialize array on mount and size change
  useEffect(() => {
    generateArray();
  }, [generateArray]);

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

  const startSorting = () => {
    isPlayingRef.current = true;
    setIsPlaying(true);
    if (algorithm === 'bubble') {
      bubbleSort();
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
                  <SelectItem value="selection" disabled>Selection Sort (Coming Soon)</SelectItem>
                  <SelectItem value="insertion" disabled>Insertion Sort (Coming Soon)</SelectItem>
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
              Bubble Sort Algorithm
            </h3>
            <p className="text-muted-foreground">
              Bubble Sort repeatedly steps through the list, compares adjacent elements and swaps them if they're in the wrong order. 
              The pass through the list is repeated until the list is sorted. Watch as larger elements "bubble" to their correct positions!
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SortVisualizer;