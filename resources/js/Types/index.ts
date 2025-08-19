// Export all types
export * from './Common';
export * from './User';
export * from './Patient';
export * from './Medical';
export * from './Financial';
export * from './WhatsApp';
export * from './Constants';

// Re-export for compatibility with Inertia
export type { PageProps } from '@inertiajs/core';

// Global app props interface
export interface AppProps {
  auth: {
    user: User;
  };
  flash?: {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
  };
  errors?: Record<string, string>;
}