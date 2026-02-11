// src/types/electron.d.ts
export {};

declare global {
  interface Window {
    electronAPI?: {
      closeApp: () => void;
    };
  }
}
