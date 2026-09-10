import React from 'react';
import { CustomWidgetDef } from '../../types';
import { CustomSandboxFrame } from './CustomSandboxFrame';

interface CustomRendererWidgetProps {
  customDef: CustomWidgetDef;
}

export const CustomRendererWidget: React.FC<CustomRendererWidgetProps> = React.memo(({ customDef }) => {
  const { html, css, js, title } = customDef;
  const contentHeight = Math.max(180, (customDef.height || 280) - 50);

  const frameStyle = React.useMemo(() => ({
    height: contentHeight,
    border: 'none',
    outline: 'none',
    boxShadow: 'none',
    background: 'transparent',
  }), [contentHeight]);

  return (
    <div
      className="w-full relative flex items-center justify-center bg-transparent border-0 outline-none p-0 m-0"
      style={{ minHeight: contentHeight }}
    >
      <CustomSandboxFrame
        html={html}
        css={css}
        js={js}
        title={title || 'Custom Widget'}
        className="w-full h-full block bg-transparent"
        style={frameStyle}
      />
    </div>
  );
});
