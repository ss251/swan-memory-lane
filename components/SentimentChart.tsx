'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSwanContext, DiaryEntry } from '@/lib/providers/SwanProvider';
import { formatDate, getSentimentColor } from '@/lib/utils';
import { LineChart, Smile, TrendingUp, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface Point {
  x: number;
  y: number;
  value: number;
  entry: DiaryEntry;
}

export function SentimentChart() {
  const { currentAgent, isLoading } = useSwanContext();
  const [points, setPoints] = useState<Point[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 200 });
  
  // Update chart dimensions when window resizes
  useEffect(() => {
    const updateDimensions = () => {
      if (chartContainerRef.current) {
        setDimensions({
          width: chartContainerRef.current.clientWidth,
          height: 200 // Fixed height
        });
      }
    };
    
    // Initial dimensions
    updateDimensions();
    
    // Add resize listener
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Chart dimensions
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = dimensions.width - margin.left - margin.right;
  const chartHeight = dimensions.height - margin.top - margin.bottom;
  
  useEffect(() => {
    if (!currentAgent || !currentAgent.diaryEntries.length || chartWidth <= 0) {
      setPoints([]);
      return;
    }
    
    // Sort entries by timestamp
    const sortedEntries = [...currentAgent.diaryEntries].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    // Map timestamps to x coordinates and sentiment to y coordinates
    const timestamps = sortedEntries.map(entry => new Date(entry.timestamp).getTime());
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    const timeRange = maxTime - minTime || 1; // Avoid division by zero
    
    const newPoints = sortedEntries.map(entry => {
      const x = margin.left + (new Date(entry.timestamp).getTime() - minTime) / timeRange * chartWidth;
      // Map sentiment from [-1, 1] to [chartHeight, 0]
      const y = margin.top + chartHeight - ((entry.sentiment + 1) / 2) * chartHeight;
      
      return {
        x,
        y,
        value: entry.sentiment,
        entry
      };
    });
    
    setPoints(newPoints);
  }, [currentAgent, chartHeight, chartWidth, margin.left, margin.top, dimensions.width]);
  
  // Create SVG path from points
  const createLinePath = (points: Point[]) => {
    if (points.length < 2) return '';
    
    return points.reduce((path, point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${path} ${command} ${point.x},${point.y}`;
    }, '');
  };
  
  const linePath = createLinePath(points);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!currentAgent) {
    return (
      <div className="p-6 text-center">
        <LineChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium">No Agent Selected</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Select an agent to view their sentiment chart.
        </p>
      </div>
    );
  }
  
  if (points.length < 2) {
    return (
      <div className="p-6 text-center">
        <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium">Not Enough Data</h3>
        <p className="text-sm text-muted-foreground mt-2">
          At least two diary entries are needed to generate a sentiment chart.
        </p>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <TrendingUp className="h-5 w-5 mr-2" />
        Sentiment Analysis
      </h2>
      
      <div ref={chartContainerRef} className="mt-2 relative w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
              <span className="text-xs text-muted-foreground">Positive</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-amber-500 mr-1"></div>
              <span className="text-xs text-muted-foreground">Neutral</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
              <span className="text-xs text-muted-foreground">Negative</span>
            </div>
          </div>
          
          <button 
            className="text-xs text-muted-foreground flex items-center"
            onClick={() => alert('Sentiment is calculated based on the emotional tone of diary entries.')}
          >
            <Info className="h-3 w-3 mr-1" />
            How is this calculated?
          </button>
        </div>
        
        <svg width="100%" height={dimensions.height} className="overflow-visible">
          {/* Y-axis grid lines with labels */}
          <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + chartHeight} 
                stroke="currentColor" strokeOpacity="0.2" />
          <line x1={margin.left} y1={margin.top + chartHeight/2} x2={margin.left + chartWidth} y2={margin.top + chartHeight/2} 
                stroke="currentColor" strokeOpacity="0.1" strokeDasharray="2,2" />
          <line x1={margin.left} y1={margin.top + chartHeight} x2={margin.left + chartWidth} y2={margin.top + chartHeight} 
                stroke="currentColor" strokeOpacity="0.2" />
          
          {/* Y-axis labels */}
          <text x={margin.left - 5} y={margin.top} textAnchor="end" fontSize="10" fill="currentColor" opacity="0.7">Positive</text>
          <text x={margin.left - 5} y={margin.top + chartHeight/2} textAnchor="end" fontSize="10" fill="currentColor" opacity="0.7">Neutral</text>
          <text x={margin.left - 5} y={margin.top + chartHeight} textAnchor="end" fontSize="10" fill="currentColor" opacity="0.7">Negative</text>
          
          {/* Line path */}
          <motion.path
            d={linePath}
            fill="none"
            stroke="url(#sentimentGradient)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="sentiment-path"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="sentimentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          
          {/* Data points */}
          {points.map((point, index) => {
            const sentimentColor = getSentimentColor(point.value);
            return (
              <g key={index}>
                <motion.circle
                  cx={point.x}
                  cy={point.y}
                  r={hoveredPoint === point ? 6 : 4}
                  fill={sentimentColor}
                  stroke="white"
                  strokeWidth={2}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  onMouseEnter={() => setHoveredPoint(point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            );
          })}
        </svg>
        
        {/* Time indicators */}
        <div className="flex justify-between px-2 sm:px-8 mt-2">
          <span className="text-xs text-muted-foreground">
            {points.length > 0 && formatDate(points[0].entry.timestamp)}
          </span>
          <span className="text-xs text-muted-foreground">
            {points.length > 0 && formatDate(points[points.length - 1].entry.timestamp)}
          </span>
        </div>
        
        {/* Tooltip */}
        {hoveredPoint && (
          <div 
            className="absolute bg-popover p-3 rounded-lg shadow-lg z-10 border border-border"
            style={{
              left: `${hoveredPoint.x}px`,
              top: `${hoveredPoint.y - 70}px`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="text-xs font-medium">{formatDate(hoveredPoint.entry.timestamp)}</div>
            <div className="text-sm font-semibold mt-1 flex items-center">
              <Smile className="h-4 w-4 mr-1" />
              Sentiment: {(hoveredPoint.value * 100).toFixed(0)}%
            </div>
            <div className="w-2 h-2 absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 bg-popover border-r border-b border-border"></div>
          </div>
        )}
      </div>
    </div>
  );
} 