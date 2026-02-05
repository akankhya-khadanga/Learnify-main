/// <reference types="vite/client" />

interface CWASAInstance {
  init: (config?: unknown) => void;
  playSiGMLURL: (url: string) => void;
  playSiGMLText: (text: string) => void;
  stopSiGML: () => void;
  getLogger: (name: string, level: number) => unknown;
}

declare global {
  interface Window {
    CWASA?: CWASAInstance;
    cwasa?: unknown;
    SiGMLURL?: unknown;
    AvatarConfig?: unknown;
    tuavatarLoaded?: boolean;
    playerAvailableToPlay?: boolean;
  }
}
