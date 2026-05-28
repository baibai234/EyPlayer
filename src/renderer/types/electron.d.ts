export {}

declare global {
  interface Window {
    electronAPI?: {
      // 应用信息
      getAppVersion: () => Promise<string>
      getPlatform: () => Promise<string>

      // 窗口控制
      minimizeWindow: () => Promise<void>
      maximizeWindow: () => Promise<void>
      closeWindow: () => Promise<void>

      // 文件对话框
      openFile: (options?: { filters?: { name: string; extensions: string[] }[] }) => Promise<{ canceled: boolean; filePaths: string[] }>
      openDirectory: () => Promise<{ canceled: boolean; filePaths: string[] }>

      // 播放器
      playerDetect: () => Promise<string[]>
      playerPlay: (url: string, options?: any) => Promise<{ success: boolean; pid?: number; error?: string }>
      reportProgress: (endpoint: string, body: any, serverUrl: string, apiKey: string) => Promise<{ success: boolean; error?: string }>

      // STRM解析
      strmParse: (filePath: string) => Promise<{ success: boolean; url?: string; type?: string; error?: string }>

      // Emby API代理
      embyRequest: (config: {
        serverUrl: string
        apiKey: string
        endpoint: string
        method?: string
        body?: any
      }) => Promise<{ success: boolean; data?: any; error?: string }>

      // 文件缓存
      cacheWrite: (filePath: string, data: string) => Promise<{ success: boolean; error?: string }>
      cacheRead: (filePath: string) => Promise<{ success: boolean; data?: string; exists?: boolean; error?: string }>
      cacheExists: (filePath: string) => Promise<boolean>
      cacheDelete: (filePath: string) => Promise<{ success: boolean; error?: string }>
      cacheClear: (dirPath: string) => Promise<{ success: boolean; error?: string }>

      // 事件
      on: (channel: string, callback: (...args: any[]) => void) => () => void
      removeListener: (channel: string, callback: (...args: any[]) => void) => void
    }
  }
}
