import React, { useMemo } from 'react';
import { CustomWidgetDef } from '../../types';

interface CustomRendererWidgetProps {
  customDef: CustomWidgetDef;
}

export const CustomRendererWidget: React.FC<CustomRendererWidgetProps> = ({ customDef }) => {
  const { html, css, js, title } = customDef;

  const srcDoc = useMemo(() => {
    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 10px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #e5e5e5;
      background: transparent;
      overflow-x: hidden;
    }
    /* Default scrollbar styling inside widget */
    ::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(150, 150, 150, 0.3);
      border-radius: 9999px;
    }
    /* User Custom CSS */
    ${css || ''}
  </style>
</head>
<body>
  ${html || '<div style="text-align:center;padding:20px;color:#888;">Widget kosong</div>'}

  <script>
    window.addEventListener('DOMContentLoaded', () => {
      try {
        ${js || ''}
      } catch (err) {
        console.error("Widget Error:", err);
      }
    });
    // In case DOM already loaded
    try {
      ${js || ''}
    } catch (err) {
      console.error("Widget Error:", err);
    }
  <\/script>
</body>
</html>`;
  }, [html, css, js]);

  return (
    <div
      className="w-full relative overflow-hidden rounded-lg bg-black/20 dark:bg-black/40 border border-black/5 dark:border-white/5"
      style={{ minHeight: Math.max(140, (customDef.height || 260) - 60) }}
    >
      <iframe
        srcDoc={srcDoc}
        title={title || 'Custom Widget'}
        sandbox="allow-scripts"
        className="w-full h-full min-h-[220px] border-0 block"
        style={{
          height: Math.max(160, (customDef.height || 260) - 60),
        }}
      />
    </div>
  );
};
