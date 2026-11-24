import {
  Apple,
  BatteryCharging,
  Building2,
  Cpu,
  HardDrive,
  Keyboard,
  Laptop,
  Monitor,
  Mouse,
  Printer,
  Server,
  ShieldCheck,
  Smartphone,
  Tablet,
  Wifi,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type { ServiceDto } from './types';

export type ServiceIcon = ServiceDto['icon'];

/** Same order as the OpenAPI enum. */
export const SERVICE_ICONS: readonly { name: ServiceIcon; Icon: LucideIcon }[] = [
  { name: 'laptop', Icon: Laptop },
  { name: 'apple', Icon: Apple },
  { name: 'monitor', Icon: Monitor },
  { name: 'hard-drive', Icon: HardDrive },
  { name: 'cpu', Icon: Cpu },
  { name: 'building-2', Icon: Building2 },
  { name: 'smartphone', Icon: Smartphone },
  { name: 'tablet', Icon: Tablet },
  { name: 'printer', Icon: Printer },
  { name: 'keyboard', Icon: Keyboard },
  { name: 'battery-charging', Icon: BatteryCharging },
  { name: 'server', Icon: Server },
  { name: 'wifi', Icon: Wifi },
  { name: 'mouse', Icon: Mouse },
  { name: 'shield-check', Icon: ShieldCheck },
  { name: 'wrench', Icon: Wrench },
];
