import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('jingchuDesktop', {
  getInfo: () => ipcRenderer.invoke('desktop:get-info'),
  openControl: () => ipcRenderer.invoke('desktop:open-control'),
  openSceneDebug: (roleId) => ipcRenderer.invoke('desktop:open-scene-debug', roleId),
  openScreen: () => ipcRenderer.invoke('desktop:open-screen'),
})
