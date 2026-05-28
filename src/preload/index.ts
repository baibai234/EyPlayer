import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // 应用信息
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),

  // 窗口控制
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),

  // 文件对话框
  openFile: (options?: any) => ipcRenderer.invoke('dialog:open-file', options),
  openDirectory: () => ipcRenderer.invoke('dialog:open-directory'),

  // 播放器
  playerDetect: () => ipcRenderer.invoke('player:detect'),
  playerPlay: (url: string, options?: any) => ipcRenderer.invoke('player:play', url, options),
  reportProgress: (endpoint: string, body: any, serverUrl: string, apiKey: string) => ipcRenderer.invoke('player:report-progress', endpoint, body, serverUrl, apiKey),

  // STRM解析
  strmParse: (filePath: string) => ipcRenderer.invoke('strm:parse', filePath),

  // Emby API代理
  embyRequest: (config: any) => ipcRenderer.invoke('emby:request', config),

  // 文件缓存
  cacheWrite: (filePath: string, data: string) => ipcRenderer.invoke('cache:write', filePath, data),
  cacheRead: (filePath: string) => ipcRenderer.invoke('cache:read', filePath),
  cacheExists: (filePath: string) => ipcRenderer.invoke('cache:exists', filePath),
  cacheDelete: (filePath: string) => ipcRenderer.invoke('cache:delete', filePath),
  cacheClear: (dirPath: string) => ipcRenderer.invoke('cache:clear', dirPath),

  // 事件监听
  on: (channel: string, callback: (...args: any[]) => void) => {
    const handler = (_event: any, ...args: any[]) => callback(...args)
    ipcRenderer.on(channel, handler)
    return () => ipcRenderer.removeListener(channel, handler)
  },

  removeListener: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, callback)
  }
})
