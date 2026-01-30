import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("electronAPI", {
  sendMessage: (channel, data) => {
    const validChannels = ["toMain"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  onMessage: (channel, callback) => {
    const validChannels = ["fromMain"];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_event, data) => callback(data));
    }
  },
  hello: () => {
    console.log("Hello from preload!");
  }
});
