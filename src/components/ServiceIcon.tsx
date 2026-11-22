import React, { useState } from 'react';
import {
  BatteryCharging,
  Camera,
  Cpu,
  Download,
  Droplets,
  Gauge,
  HardDrive,
  PlugZap,
  RefreshCw,
  ShieldCheck,
  Sliders,
  Smartphone,
  Terminal,
  Volume2,
  Wifi,
  Wrench,
} from 'lucide-react';

export function ServiceIcon({ iconKey, className = 'w-5 h-5' }: { iconKey: string; className?: string }) {
  switch (iconKey) {
    case 'smartphone':
      return <Smartphone className={className} />;
    case 'battery':
      return <BatteryCharging className={className} />;
    case 'plug':
      return <PlugZap className={className} />;
    case 'volume':
      return <Volume2 className={className} />;
    case 'camera':
      return <Camera className={className} />;
    case 'sliders':
      return <Sliders className={className} />;
    case 'droplets':
      return <Droplets className={className} />;
    case 'cpu':
      return <Cpu className={className} />;
    case 'download':
      return <Download className={className} />;
    case 'refresh':
      return <RefreshCw className={className} />;
    case 'terminal':
      return <Terminal className={className} />;
    case 'shield':
      return <ShieldCheck className={className} />;
    case 'wifi':
      return <Wifi className={className} />;
    case 'gauge':
      return <Gauge className={className} />;
    case 'hard-drive':
      return <HardDrive className={className} />;
    default:
      return <Wrench className={className} />;
  }
}

export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackTitle,
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 p-6 text-center ${className}`}
      >
        <Smartphone className="w-7 h-7 text-slate-400 dark:text-slate-500" />
        <span className="text-xs font-medium">{fallbackTitle}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
