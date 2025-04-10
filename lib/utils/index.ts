import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
};
export { EventBridge } from './event-bridge';
export { generateId } from './generate-id';
export type { IDGenerator } from './generate-id';

