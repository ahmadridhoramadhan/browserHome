import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Minus, X, Maximize2, Move } from 'lucide-react';
import { Position } from '../types';

interface WindowFrameProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  position: Position;
  zIndex: number;
  isMinimized: boolean;
  onPositionChange: (id: string, newPos: Position) => void;
  onFocus: (id: string) => void;
  onMinimizeToggle: (id: string) => void;
  onClose: (id: string) => void;
  children: React.ReactNode;
  className?: string;
  headerRightContent?: React.ReactNode;
  defaultWidth?: number;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  id,
  title,
  icon,
  position,
  zIndex,
  isMinimized,
  onPositionChange,
  onFocus,
  onMinimizeToggle,
  onClose,
  children,
  className = '',
  headerRightContent,
  defaultWidth = 360,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: position.x,
    posY: position.y,
  });
  const currentPosRef = useRef<Position>(position);
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    currentPosRef.current = position;
  }, [position]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag with primary mouse button
    if (e.button !== 0) return;
    // Don't drag if clicked on button or input
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('select')) {
      return;
    }

    e.preventDefault();
    onFocus(id);

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: currentPosRef.current.x,
      posY: currentPosRef.current.y,
    };

    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;

    // Viewport bounds constraint (keep at least 60px inside screen)
    const maxX = Math.max(window.innerWidth - 80, 200);
    const maxY = Math.max(window.innerHeight - 80, 200);

    const newX = Math.min(Math.max(-defaultWidth + 80, dragStartRef.current.posX + dx), maxX);
    const newY = Math.min(Math.max(60, dragStartRef.current.posY + dy), maxY);

    currentPosRef.current = { x: newX, y: newY };

    if (windowRef.current) {
      windowRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
    }
  }, [isDragging, defaultWidth]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    onPositionChange(id, currentPosRef.current);
  }, [id, isDragging, onPositionChange]);

  return (
    <div
      ref={windowRef}
      id={`window-${id}`}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        zIndex,
        width: defaultWidth,
        willChange: isDragging ? 'transform' : 'auto',
      }}
      onClick={() => onFocus(id)}
      className={`select-none rounded-xl transition-shadow duration-200 ${
        isDragging
          ? 'shadow-2xl ring-2 ring-blue-500/40 opacity-95 cursor-grabbing'
          : 'shadow-lg hover:shadow-xl'
      } ${className}`}
    >
      <div
        className="rounded-xl overflow-hidden backdrop-blur-md bg-white/80 dark:bg-neutral-900/85 border border-white/20 dark:border-neutral-700/50 flex flex-col text-neutral-800 dark:text-neutral-100 transition-colors duration-200"
      >
        {/* Windows style Titlebar */}
        <div
          id={`window-header-${id}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`h-10 px-3 flex items-center justify-between border-b border-black/5 dark:border-white/10 bg-neutral-100/70 dark:bg-neutral-800/70 cursor-grab active:cursor-grabbing transition-colors ${
            isDragging ? 'bg-neutral-200/80 dark:bg-neutral-700/80' : ''
          }`}
        >
          {/* Title & Icon */}
          <div className="flex items-center gap-2 overflow-hidden pointer-events-none">
            <span className="text-blue-500 dark:text-blue-400 flex items-center justify-center shrink-0">
              {icon}
            </span>
            <span className="font-semibold text-xs tracking-wide truncate">
              {title}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0 ml-2">
            {headerRightContent}
            
            {/* Minimize / Restore */}
            <button
              id={`window-minimize-btn-${id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMinimizeToggle(id);
              }}
              title={isMinimized ? 'Perbesar Widget' : 'Perkecil Widget'}
              className="w-6 h-6 rounded flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
            </button>

            {/* Close */}
            <button
              id={`window-close-btn-${id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose(id);
              }}
              title="Tutup Widget"
              className="w-6 h-6 rounded flex items-center justify-center text-neutral-500 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/20 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Window Content */}
        {!isMinimized && (
          <div id={`window-body-${id}`} className="p-3.5 flex-1 overflow-auto max-h-[75vh]">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
