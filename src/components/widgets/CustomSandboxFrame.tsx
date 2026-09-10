import React, { useRef, useState, useEffect, useCallback } from 'react';

export interface CustomSandboxFrameProps {
  html: string;
  css: string;
  js: string;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
  onRefreshTrigger?: number;
}

export const CustomSandboxFrame: React.FC<CustomSandboxFrameProps> = ({
  html,
  css,
  js,
  title,
  className,
  style,
  onRefreshTrigger,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);

  // Check if running inside Chrome extension
  const isExtension = React.useMemo(() => {
    try {
      const globalChrome = (window as unknown as { chrome?: { runtime?: { getURL: (path: string) => string } } })?.chrome;
      return Boolean(
        (globalChrome && typeof globalChrome.runtime?.getURL === 'function') ||
        window.location.protocol === 'chrome-extension:'
      );
    } catch {
      return false;
    }
  }, []);

  // Get extension URL or web root URL for sandbox.html
  const sandboxUrl = React.useMemo(() => {
    try {
      const globalChrome = (window as unknown as { chrome?: { runtime?: { getURL: (path: string) => string } } })?.chrome;
      if (globalChrome && typeof globalChrome.runtime?.getURL === 'function') {
        return globalChrome.runtime.getURL('sandbox.html');
      }
    } catch {
      // fallback
    }
    return '/sandbox.html';
  }, []);

  const sendPayload = useCallback(() => {
    if (!iframeRef.current?.contentWindow) return;
    const isDark = document.documentElement.classList.contains('dark');
    iframeRef.current.contentWindow.postMessage(
      {
        type: 'RENDER_WIDGET',
        html: html || '',
        css: css || '',
        js: js || '',
        theme: isDark ? 'dark' : 'light',
      },
      '*',
    );
  }, [html, css, js]);

  // Listen for sandbox readiness message
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'WIDGET_SANDBOX_READY') {
        if (!iframeRef.current || e.source === iframeRef.current.contentWindow) {
          setIsReady(true);
          sendPayload();
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [sendPayload]);

  // Dispatch payload whenever code updates or ready state changes
  useEffect(() => {
    if (isReady) {
      sendPayload();
    }
  }, [isReady, sendPayload, onRefreshTrigger]);

  // Backup timer in case onLoad or ready event was instantaneous
  useEffect(() => {
    const timer = setTimeout(() => {
      sendPayload();
    }, 150);
    return () => clearTimeout(timer);
  }, [sendPayload, onRefreshTrigger]);

  const handleIframeLoad = () => {
    setIsReady(true);
    sendPayload();
  };

  return (
    <iframe
      ref={iframeRef}
      src={sandboxUrl}
      onLoad={handleIframeLoad}
      title={title || 'Custom Widget Sandbox'}
      sandbox={isExtension ? undefined : "allow-scripts allow-forms allow-popups"}
      className={className || 'w-full h-full border-0 block'}
      style={style}
    />
  );
};
