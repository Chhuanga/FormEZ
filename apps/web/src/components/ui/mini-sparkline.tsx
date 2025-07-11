'use client';

import React from 'react';

interface MiniSparklineProps {
  data: { date: string; count: number }[];
  className?: string;
}

export function MiniSparkline({ data, className = '' }: MiniSparklineProps) {
  // Get the last 7 days of data
  const last7Days = [...Array(7)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  // Map data to the last 7 days
  const chartData = last7Days.map(date => {
    const found = data.find(d => d.date === date);
    return found ? found.count : 0;
  });

  const maxValue = Math.max(...chartData, 1);
  const width = 60;
  const height = 20;

  // Create SVG path for the line
  const createPath = (points: number[]) => {
    if (points.length === 0) return '';
    
    const stepX = width / (points.length - 1);
    let path = '';
    
    points.forEach((point, index) => {
      const x = index * stepX;
      const y = height - (point / maxValue) * height;
      
      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });
    
    return path;
  };

  const path = createPath(chartData);
  const hasData = chartData.some(d => d > 0);

  if (!hasData) {
    return (
      <div className={`w-15 h-5 ${className}`}>
        <svg width={width} height={height} className="opacity-30">
          <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`w-15 h-5 ${className}`}>
      <svg width={width} height={height}>
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary opacity-80"
        />
        {/* Add dots for each data point */}
        {chartData.map((point, index) => {
          if (point === 0) return null;
          const x = index * (width / (chartData.length - 1));
          const y = height - (point / maxValue) * height;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="1"
              fill="currentColor"
              className="text-primary"
            />
          );
        })}
      </svg>
    </div>
  );
} 