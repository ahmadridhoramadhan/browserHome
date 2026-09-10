import React from 'react';
import { CustomWidgetDef } from '../../types';
import { CustomSandboxFrame } from './CustomSandboxFrame';

interface CustomRendererWidgetProps {
  customDef: CustomWidgetDef;
}

export const CustomRendererWidget: React.FC<CustomRendererWidgetProps> = ({ customDef }) => {
  const { html, css, js, title } = customDef;

  return (
    <div
      className="w-full relative overflow-hidden rounded-lg bg-black/20 dark:bg-black/40 border border-black/5 dark:border-white/5"
      style={{ minHeight: Math.max(140, (customDef.height || 260) - 60) }}
    >
      <CustomSandboxFrame
        html={html}
        css={css}
        js={js}
        title={title || 'Custom Widget'}
        className="w-full h-full min-h-[220px] border-0 block"
        style={{
          height: Math.max(160, (customDef.height || 260) - 60),
        }}
      />
    </div>
  );
};
