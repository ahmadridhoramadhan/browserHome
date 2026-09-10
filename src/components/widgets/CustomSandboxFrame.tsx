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

const CustomSandboxFrameComponent: React.FC<CustomSandboxFrameProps> = ({
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

  // Check if running inside Chrome extension environment
  const isExtension = React.useMemo(() => {
    try {
      if (typeof window === 'undefined') return false;
      const globalChrome = (window as unknown as { chrome?: { runtime?: { getURL: (path: string) => string; id?: string } } })?.chrome;
      return Boolean(
        window.location.protocol === 'chrome-extension:' ||
        (globalChrome && Boolean(globalChrome.runtime?.id))
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

  const lastSentRef = useRef<{
    html: string;
    css: string;
    js: string;
    theme: string;
    trigger?: number;
  }>({
    html: '',
    css: '',
    js: '',
    theme: '',
  });

  const sendPayload = useCallback((force = false) => {
    if (!iframeRef.current?.contentWindow) return;
    const isDark = document.documentElement.classList.contains('dark');
    const theme = isDark ? 'dark' : 'light';

    const prev = lastSentRef.current;
    if (
      !force &&
      prev.html === html &&
      prev.css === css &&
      prev.js === js &&
      prev.theme === theme &&
      prev.trigger === onRefreshTrigger
    ) {
      return;
    }

    lastSentRef.current = {
      html: html || '',
      css: css || '',
      js: js || '',
      theme,
      trigger: onRefreshTrigger,
    };

    iframeRef.current.contentWindow.postMessage(
      {
        type: 'RENDER_WIDGET',
        html: html || '',
        css: css || '',
        js: js || '',
        theme,
        force,
      },
      '*',
    );
  }, [html, css, js, onRefreshTrigger]);

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
      className={className || 'w-full h-full border-0 block bg-transparent'}
      style={{
        background: 'transparent',
        ...style,
      }}
    />
  );
};

export const CustomSandboxFrame = React.memo(CustomSandboxFrameComponent);
