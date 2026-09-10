import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Minus, X, Maximize2, Sparkles } from 'lucide-react';
import { Position } from '../types';

interface WindowFrameProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  position: Position;
  zIndex: number;
  isMinimized: boolean;
  isTransparent?: boolean;
  onPositionChange: (id: string, newPos: Position) => void;
  onFocus: (id: string) => void;
  onMinimizeToggle: (id: string) => void;
  onToggleTransparent?: (id: string) => void;
  onClose: (id: string) => void;
  children: React.ReactNode;
  className?: string;
  headerRightContent?: React.ReactNode;
  defaultWidth?: number;
  minY?: number;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  id,
  title,
  icon,
  position,
  zIndex,
  isMinimized,
  isTransparent = false,
  onPositionChange,
  onFocus,
  onMinimizeToggle,
  onToggleTransparent,
  onClose,
  children,
  className = '',
  headerRightContent,
  defaultWidth = 360,
  minY = 8,
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
    const newY = Math.min(Math.max(minY, dragStartRef.current.posY + dy), maxY);

    currentPosRef.current = { x: newX, y: newY };

    if (windowRef.current) {
      windowRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
    }
  }, [isDragging, defaultWidth, minY]);

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
        willChange: 'transform',
      }}
      onClick={() => onFocus(id)}
      className={`select-none rounded-xl group transition-shadow duration-200 ${
        isTransparent
          ? isDragging ? 'ring-1 ring-blue-400/40' : ''
          : isDragging
            ? 'shadow-2xl ring-2 ring-blue-500/40 cursor-grabbing'
            : 'shadow-lg hover:shadow-xl'
      } ${className}`}
    >
      <div
        className={`rounded-xl overflow-hidden flex flex-col transition-colors duration-200 ${
          isTransparent
            ? 'bg-transparent border-0 text-neutral-100 shadow-none'
            : 'bg-white/95 dark:bg-neutral-900/90 border border-black/5 dark:border-neutral-700/60 text-neutral-800 dark:text-neutral-100 shadow-sm'
        }`}
      >
        {/* Windows style Titlebar */}
        <div
          id={`window-header-${id}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`h-9 px-2.5 flex items-center justify-between cursor-grab active:cursor-grabbing transition-all ${
            isTransparent
              ? `${
                  isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 hover:opacity-100 focus-within:opacity-100'
                } bg-neutral-900/70 backdrop-blur-sm rounded-lg mx-1.5 mt-1 border border-white/15 text-white shadow-md`
              : `border-b border-black/5 dark:border-white/10 bg-neutral-100/75 dark:bg-neutral-800/75 ${
                  isDragging ? 'bg-neutral-200/80 dark:bg-neutral-700/80' : ''
                }`
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
            
            {/* Toggle Transparent / Glass mode */}
            {onToggleTransparent && (
              <button
                id={`window-transparent-btn-${id}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleTransparent(id);
                }}
                title={isTransparent ? 'Kembalikan Tampilan Jendela Normal' : 'Mode Transparan (Menyatu dengan Wallpaper)'}
                className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                  isTransparent
                    ? 'text-blue-400 bg-blue-500/25 hover:bg-blue-500/40'
                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-black/5 dark:hover:bg-white/10'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Minimize / Restore */}
            <button
              id={`window-minimize-btn-${id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMinimizeToggle(id);
              }}
              title={isMinimized ? 'Perbesar Widget' : 'Perkecil Widget'}
              className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                isTransparent
                  ? 'text-neutral-300 hover:text-white hover:bg-white/15'
                  : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-black/5 dark:hover:bg-white/10'
              }`}
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
              className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                isTransparent
                  ? 'text-neutral-300 hover:text-red-400 hover:bg-red-500/20'
                  : 'text-neutral-500 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/20'
              }`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Window Content */}
        {!isMinimized && (
          <div
            id={`window-body-${id}`}
            className={`flex-1 overflow-auto max-h-[75vh] ${
              isTransparent ? 'p-1' : 'p-3.5'
            } ${
              isDragging ? 'pointer-events-none select-none' : ''
            }`}
          >
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
