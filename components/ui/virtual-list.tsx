
'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';

interface VirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

export default function VirtualList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  overscan = 5,
  className = ''
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const startIndex = useMemo(() => {
    return Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  }, [scrollTop, itemHeight, overscan]);

  const endIndex = useMemo(() => {
    return Math.min(
      items.length - 1,
      Math.floor((scrollTop + height) / itemHeight) + overscan
    );
  }, [scrollTop, height, itemHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
    }));
  }, [items, startIndex, endIndex]);

  const totalHeight = items.length * itemHeight;

  const offsetY = startIndex * itemHeight;

  useEffect(() => {
    const scrollElement = scrollElementRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      setScrollTop(scrollElement.scrollTop);
    };

    scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map(({ item, index }) => (
            <div
              key={index}
              style={{ height: itemHeight }}
              className="flex items-center"
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Hook for virtual scrolling with dynamic heights
export function useVirtualScroll<T>({
  items,
  estimatedItemHeight = 50,
  containerHeight,
  overscan = 5,
}: {
  items: T[];
  estimatedItemHeight?: number;
  containerHeight: number;
  overscan?: number;
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const [itemHeights, setItemHeights] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate item positions
  const itemPositions = useMemo(() => {
    const positions: number[] = [];
    let position = 0;
    
    for (let i = 0; i < items.length; i++) {
      positions[i] = position;
      const height = itemHeights[i] || estimatedItemHeight;
      position += height;
    }
    
    return positions;
  }, [items.length, itemHeights, estimatedItemHeight]);

  const totalHeight = useMemo(() => {
    return itemPositions[items.length - 1] || 0;
  }, [itemPositions, items.length]);

  // Find visible range
  const visibleRange = useMemo(() => {
    let startIndex = 0;
    let endIndex = items.length - 1;

    // Binary search for start index
    let low = 0;
    let high = items.length - 1;
    
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const position = itemPositions[mid];
      
      if (position < scrollTop) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    
    startIndex = Math.max(0, high - overscan);
    
    // Find end index
    for (let i = startIndex; i < items.length; i++) {
      if (itemPositions[i] > scrollTop + containerHeight) {
        endIndex = i + overscan;
        break;
      }
    }
    
    endIndex = Math.min(items.length - 1, endIndex);
    
    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, itemPositions, items.length, overscan]);

  const measureItem = (index: number, height: number) => {
    setItemHeights(prev => {
      const newHeights = [...prev];
      newHeights[index] = height;
      return newHeights;
    });
  };

  const scrollToIndex = (index: number) => {
    if (containerRef.current && itemPositions[index] !== undefined) {
      containerRef.current.scrollTop = itemPositions[index];
    }
  };

  return {
    containerRef,
    scrollTop,
    setScrollTop,
    visibleRange,
    totalHeight,
    itemPositions,
    measureItem,
    scrollToIndex,
  };
}
