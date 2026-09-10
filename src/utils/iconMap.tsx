import React from 'react';
import {
  Code,
  Sparkles,
  Terminal,
  Cpu,
  Flame,
  Globe,
  Music,
  Gamepad2,
  Calculator,
  Activity,
  Tv,
  Radio,
  BarChart3,
  Coffee,
  Heart,
  Compass,
  FileCode,
  Layers,
} from 'lucide-react';

export interface IconOption {
  id: string;
  name: string;
  icon: React.ReactNode;
}

export const AVAILABLE_CUSTOM_ICONS: IconOption[] = [
  { id: 'code', name: 'Code', icon: <Code className="w-4 h-4" /> },
  { id: 'sparkles', name: 'Sparkles', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'terminal', name: 'Terminal', icon: <Terminal className="w-4 h-4" /> },
  { id: 'cpu', name: 'CPU / Tech', icon: <Cpu className="w-4 h-4" /> },
  { id: 'flame', name: 'Flame', icon: <Flame className="w-4 h-4" /> },
  { id: 'calculator', name: 'Kalkulator', icon: <Calculator className="w-4 h-4" /> },
  { id: 'globe', name: 'Web / Globe', icon: <Globe className="w-4 h-4" /> },
  { id: 'music', name: 'Musik', icon: <Music className="w-4 h-4" /> },
  { id: 'gamepad', name: 'Game', icon: <Gamepad2 className="w-4 h-4" /> },
  { id: 'activity', name: 'Aktivitas', icon: <Activity className="w-4 h-4" /> },
  { id: 'barchart', name: 'Grafik', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'tv', name: 'Layar / Media', icon: <Tv className="w-4 h-4" /> },
  { id: 'radio', name: 'Radio / Audio', icon: <Radio className="w-4 h-4" /> },
  { id: 'coffee', name: 'Coffee', icon: <Coffee className="w-4 h-4" /> },
  { id: 'heart', name: 'Heart', icon: <Heart className="w-4 h-4" /> },
  { id: 'compass', name: 'Kompas', icon: <Compass className="w-4 h-4" /> },
];

export function getCustomWidgetIcon(iconId?: string, className = 'w-4 h-4'): React.ReactNode {
  switch (iconId) {
    case 'code':
      return <Code className={className} />;
    case 'sparkles':
      return <Sparkles className={className} />;
    case 'terminal':
      return <Terminal className={className} />;
    case 'cpu':
      return <Cpu className={className} />;
    case 'flame':
      return <Flame className={className} />;
    case 'calculator':
      return <Calculator className={className} />;
    case 'globe':
      return <Globe className={className} />;
    case 'music':
      return <Music className={className} />;
    case 'gamepad':
      return <Gamepad2 className={className} />;
    case 'activity':
      return <Activity className={className} />;
    case 'barchart':
      return <BarChart3 className={className} />;
    case 'tv':
      return <Tv className={className} />;
    case 'radio':
      return <Radio className={className} />;
    case 'coffee':
      return <Coffee className={className} />;
    case 'heart':
      return <Heart className={className} />;
    case 'compass':
      return <Compass className={className} />;
    default:
      return <FileCode className={className} />;
  }
}
