// src/preload/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

// Expose safe APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (channel: string, data: any) => {
    // whitelist channels for safety
    const validChannels = ['toMain'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },

  onMessage: (channel: string, callback: (data: any) => void) => {
    const validChannels = ['fromMain'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_event, data) => callback(data));
    }
  },

  hello: () => {
    console.log('Hello from preload!');
  }
});
