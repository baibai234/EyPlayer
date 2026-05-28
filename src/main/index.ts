import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join, dirname } from 'path'
import { existsSync, appendFileSync } from 'fs'
import { readFile, writeFile, mkdir, unlink } from 'fs/promises'
import { spawn } from 'child_process'
import http from 'http'
import https from 'https'
import net from 'net'

const logFile = join(process.execPath.replace(/[\\/][^\\/]+$/, ''), 'eyplayer-debug.log')
function log(msg: string) {
  try { appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`) } catch {}
}
process.on('uncaughtException', (err) => log(`CRASH: ${err.message}\n${err.stack}`))
process.on('unhandledRejection', (err: any) => log(`UNHANDLED: ${err?.message || err}\n${err?.stack || ''}`))

let mainWindow: BrowserWindow | null = null

function createWindow() {
  log('createWindow() called')
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    transparent: true,
    hasShadow: false,
    show: true,
    icon: join(__dirname, '../../resources/icon.ico'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../../dist/index.html'))
  }

  mainWindow.webContents.on('did-fail-load', (_e, code, desc) => {
    log(`LOAD FAILED: ${code} ${desc}`)
  })
  mainWindow.webContents.on('did-finish-load', () => {
    log('did-finish-load')
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window-maximized')
  })

  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window-unmaximized')
  })
}

app.whenReady().then(() => {
  log('app ready')
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
}).catch((err) => {
  log(`app ready ERROR: ${err.message}`)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// 应用信息
ipcMain.handle('get-app-version', () => app.getVersion())
ipcMain.handle('get-platform', () => process.platform)

// 窗口控制
ipcMain.handle('minimize-window', () => mainWindow?.minimize())
ipcMain.handle('maximize-window', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})
ipcMain.handle('close-window', () => mainWindow?.close())

// 文件选择对话框
ipcMain.handle('dialog:open-file', async (_event, options?: { filters?: { name: string; extensions: string[] }[] }) => {
  if (!mainWindow) return { canceled: true, filePaths: [] }
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: options?.filters || [{ name: '可执行文件', extensions: ['exe'] }]
  })
  return result
})

// 目录选择对话框
ipcMain.handle('dialog:open-directory', async () => {
  if (!mainWindow) return { canceled: true, filePaths: [] }
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  })
  return result
})

// 文件缓存操作
ipcMain.handle('cache:write', async (_event, filePath: string, data: string) => {
  try {
    await mkdir(dirname(filePath), { recursive: true })
    await writeFile(filePath, data, 'base64')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('cache:read', async (_event, filePath: string) => {
  try {
    if (!existsSync(filePath)) return { success: false, exists: false }
    const data = await readFile(filePath, 'base64')
    return { success: true, data }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('cache:exists', async (_event, filePath: string) => {
  return existsSync(filePath)
})

ipcMain.handle('cache:delete', async (_event, filePath: string) => {
  try {
    if (existsSync(filePath)) await unlink(filePath)
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('cache:clear', async (_event, dirPath: string) => {
  try {
    const { readdirSync, statSync, rmSync } = require('fs')
    const items = readdirSync(dirPath)
    for (const item of items) {
      const fullPath = join(dirPath, item)
      const stat = statSync(fullPath)
      if (stat.isDirectory()) {
        rmSync(fullPath, { recursive: true, force: true })
      } else {
        await unlink(fullPath)
      }
    }
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
})

// 播放器路径配置
const PLAYER_PATHS: Record<string, string[]> = {
  mpv: [
    'C:\\Program Files\\mpv\\mpv.exe',
    'C:\\Program Files (x86)\\mpv\\mpv.exe',
    `${process.env.LOCALAPPDATA}\\mpv\\mpv.exe`
  ],
  potplayer: [
    'C:\\Program Files\\DAUM\\PotPlayer\\PotPlayerMini64.exe',
    'C:\\Program Files (x86)\\DAUM\\PotPlayer\\PotPlayerMini.exe'
  ],
  vlc: [
    'C:\\Program Files\\VideoLAN\\VLC\\vlc.exe',
    'C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe'
  ]
}

// PATH环境变量中的可执行文件名
const PLAYER_PATH_EXES: Record<string, string> = {
  mpv: 'mpv.exe',
  vlc: 'vlc.exe'
}

// 在PATH环境变量中查找可执行文件
function findInPath(executable: string): string | null {
  const pathDirs = (process.env.PATH || '').split(';')
  for (const dir of pathDirs) {
    if (!dir) continue
    const fullPath = join(dir.trim(), executable)
    if (existsSync(fullPath)) return fullPath
  }
  return null
}

// 检测播放器路径
function findPlayerPath(playerType: string): string | null {
  const paths = PLAYER_PATHS[playerType] || []
  for (const p of paths) {
    if (existsSync(p)) return p
  }
  // 回退到PATH环境变量查找
  const pathExe = PLAYER_PATH_EXES[playerType]
  if (pathExe) return findInPath(pathExe)
  return null
}

// 播放器检测
ipcMain.handle('player:detect', () => {
  const detected: string[] = []
  for (const type of Object.keys(PLAYER_PATHS)) {
    if (findPlayerPath(type)) detected.push(type)
  }
  return detected
})

// mpv IPC 通信
let mpvSocketPath = ''
let mpvProgressTimer: ReturnType<typeof setInterval> | null = null
let mpvMediaId = ''

function sendMpvCommand(command: any[]): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!mpvSocketPath) { resolve(null); return }
    const client = net.createConnection(mpvSocketPath, () => {
      client.write(JSON.stringify({ command }) + '\n')
    })
    let data = ''
    client.on('data', (chunk) => {
      data += chunk.toString()
      try {
        const lines = data.split('\n')
        for (const line of lines) {
          if (line.trim()) {
            const parsed = JSON.parse(line)
            if (parsed.data !== undefined) {
              client.destroy()
              resolve(parsed.data)
              return
            }
          }
        }
      } catch {}
    })
    client.on('error', (err) => { client.destroy(); reject(err) })
    setTimeout(() => { client.destroy(); reject(new Error('mpv IPC timeout')) }, 3000)
  })
}

function startMpvProgressReporting(mediaId: string, embyConfig: any) {
  stopMpvProgressReporting()
  mpvMediaId = mediaId
  let lastReport = 0

  mpvProgressTimer = setInterval(async () => {
    try {
      const position = await sendMpvCommand(['get_property', 'time-pos'])
      const duration = await sendMpvCommand(['get_property', 'duration'])
      if (position != null && duration != null && duration > 0) {
        const positionTicks = Math.round(position * 10_000_000)
        const now = Date.now()
        // 每 10 秒上报一次
        if (now - lastReport >= 10000) {
          lastReport = now
          // 通过 renderer 进程上报
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('mpv-progress', { mediaId: mpvMediaId, positionTicks })
          }
        }
      }
    } catch {
      // mpv 可能已关闭
    }
  }, 3000)
}

function stopMpvProgressReporting() {
  if (mpvProgressTimer) {
    clearInterval(mpvProgressTimer)
    mpvProgressTimer = null
  }
  mpvMediaId = ''
}

// 播放进度上报到 Emby
ipcMain.handle('player:report-progress', async (_event, endpoint: string, body: any, serverUrl: string, apiKey: string) => {
  try {
    const baseUrl = serverUrl.replace(/\/$/, '').replace(/\/emby$/, '')
    const url = `${baseUrl}/emby${endpoint}`
    const response = await httpRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Emby-Authorization': 'MediaBrowser Client="EyPlayer", Device="PC", DeviceId="eyplayer-001", Version="0.1.0"',
        'X-Emby-Token': apiKey
      },
      body: JSON.stringify(body)
    })
    return { success: response.status >= 200 && response.status < 300 }
  } catch (err: any) {
    log(`[player] 进度上报失败: ${err.message}`)
    return { success: false, error: err.message }
  }
})

// 播放器启动
ipcMain.handle('player:play', async (_event, url: string, options?: any) => {
  const playerType = options?.playerType || 'mpv'
  log(`[player] 尝试启动播放器: ${playerType}, URL: ${url.slice(0, 100)}...`)

  // 优先使用自定义路径
  let playerPath: string | null = null
  if (options?.customPath && existsSync(options.customPath)) {
    playerPath = options.customPath
    log(`[player] 使用自定义路径: ${playerPath}`)
  } else {
    playerPath = findPlayerPath(playerType)
  }

  if (!playerPath) {
    const available = []
    for (const type of Object.keys(PLAYER_PATHS)) {
      if (findPlayerPath(type)) available.push(type)
    }
    const hint = available.length > 0
      ? `，检测到可用播放器: ${available.join(', ')}，请在设置中切换`
      : '，请安装 mpv、PotPlayer 或 VLC 后重试'
    throw new Error(`未找到播放器: ${playerType}${hint}`)
  }

  log(`[player] 找到播放器: ${playerPath}`)

  const args: string[] = [url]

  if (playerType === 'mpv') {
    if (options?.fullscreen) args.push('--fullscreen')
    if (options?.hardwareDecoding) args.push('--hwdec=auto')
    if (options?.startTime) args.push(`--start=${options.startTime}`)
    // mpv IPC 命名管道
    mpvSocketPath = `\\\\.\\pipe\\eyplayer-mpv-${Date.now()}`
    args.push(`--input-ipc-server=${mpvSocketPath}`)
    log(`[player] mpv IPC: ${mpvSocketPath}`)
  } else if (playerType === 'potplayer') {
    if (options?.fullscreen) args.push('/fullscreen')
  } else if (playerType === 'vlc') {
    if (options?.fullscreen) args.push('--fullscreen')
    if (options?.hardwareDecoding) args.push('--avcodec-hw=auto')
  }

  try {
    const proc = spawn(playerPath, args, { stdio: 'ignore' })
    proc.on('error', (err) => {
      log(`[player] 启动失败: ${err.message}`)
    })
    proc.on('exit', () => {
      log(`[player] 播放器已关闭`)
      stopMpvProgressReporting()
      mpvSocketPath = ''
    })
    proc.unref()
    log(`[player] 启动成功, PID: ${proc.pid}`)

    // mpv 启动后开始上报进度
    if (playerType === 'mpv' && options?.mediaId) {
      // 等待 mpv 启动并创建 IPC 管道
      setTimeout(() => {
        startMpvProgressReporting(options.mediaId, { serverUrl: options.serverUrl, apiKey: options.apiKey })
      }, 2000)
    }

    return { success: true, pid: proc.pid }
  } catch (err: any) {
    log(`[player] spawn 失败: ${err.message}`)
    throw new Error(`播放器启动失败: ${err.message}`)
  }
})

// STRM文件解析
ipcMain.handle('strm:parse', async (_event, filePath: string) => {
  try {
    const content = await readFile(filePath, 'utf-8')
    const url = content.trim()

    if (!url) throw new Error('STRM文件内容为空')

    return { success: true, url, type: url.startsWith('http') ? 'url' : 'file' }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// 补全URL协议
function normalizeUrl(url: string): string {
  if (!/^https?:\/\//i.test(url)) {
    url = 'http://' + url
  }
  return url
}

// 使用http模块发请求（避免Node.js fetch undici的terminated bug）
function httpRequest(url: string, options: { method?: string; headers?: Record<string, string>; body?: string }, maxRedirects = 5): Promise<{ status: number; statusText: string; body: string }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(normalizeUrl(url))
    const mod = parsed.protocol === 'https:' ? https : http
    const reqHeaders: Record<string, string> = {
      'Accept-Encoding': 'gzip, deflate, br',
      ...options.headers
    }
    const req = mod.request(parsed, {
      method: options.method || 'GET',
      headers: reqHeaders,
      timeout: 30000
    }, (res) => {
      // 处理302/301重定向
      if ((res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) && res.headers.location && maxRedirects > 0) {
        let redirectUrl = res.headers.location
        if (!redirectUrl.startsWith('http')) {
          redirectUrl = new URL(redirectUrl, parsed).toString()
        }
        log(`[http] ${res.statusCode} 重定向 -> ${redirectUrl}`)
        res.resume()
        httpRequest(redirectUrl, options, maxRedirects - 1).then(resolve).catch(reject)
        return
      }

      // 先收集原始数据，再尝试解压
      const chunks: Buffer[] = []
      res.on('data', (chunk: Buffer) => { chunks.push(chunk) })
      res.on('end', () => {
        const raw = Buffer.concat(chunks)
        const encoding = (res.headers['content-encoding'] || '').toLowerCase()
        log(`[http] Content-Encoding: "${encoding}", 数据大小: ${raw.length} bytes`)

        if (encoding && encoding !== 'identity') {
          const zlib = require('zlib')
          // 按编码类型依次尝试不同解压方式
          const attempts: (() => Buffer)[] = []
          if (encoding === 'gzip') {
            attempts.push(() => zlib.gunzipSync(raw))
          } else if (encoding === 'deflate') {
            // deflate 有两种格式：raw deflate 和 zlib-wrapped deflate
            attempts.push(() => zlib.inflateRawSync(raw))
            attempts.push(() => zlib.inflateSync(raw))
          } else if (encoding === 'br') {
            attempts.push(() => zlib.brotliDecompressSync(raw))
          }

          let decoded: Buffer | null = null
          for (const attempt of attempts) {
            try {
              decoded = attempt()
              break
            } catch { /* 继续尝试下一种 */ }
          }

          if (decoded) {
            resolve({ status: res.statusCode || 0, statusText: res.statusMessage || '', body: decoded.toString() })
          } else {
            log(`[http] 所有解压方式均失败，使用原始数据`)
            resolve({ status: res.statusCode || 0, statusText: res.statusMessage || '', body: raw.toString() })
          }
        } else {
          resolve({ status: res.statusCode || 0, statusText: res.statusMessage || '', body: raw.toString() })
        }
      })
      res.on('error', reject)
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('请求超时')) })
    if (options.body) req.write(options.body)
    req.end()
  })
}

// Emby API代理（避免CORS问题）
ipcMain.handle('emby:request', async (_event, config: any) => {
  try {
    const { serverUrl, apiKey, endpoint, method, body, headers: extraHeaders } = config
    const baseUrl = normalizeUrl(serverUrl).replace(/\/$/, '').replace(/\/emby$/, '')
    const url = `${baseUrl}/emby${endpoint}`
    log(`[emby] ${method || 'GET'} ${url}`)

    const bodyStr = body ? JSON.stringify(body) : undefined
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Emby-Authorization': 'MediaBrowser Client="EyPlayer", Device="PC", DeviceId="eyplayer-001", Version="0.1.0"',
      ...extraHeaders
    }
    if (apiKey) headers['X-Emby-Token'] = apiKey
    if (bodyStr) headers['Content-Length'] = Buffer.byteLength(bodyStr).toString()

    const response = await httpRequest(url, { method, headers, body: bodyStr })

    log(`[emby] Response: ${response.status} ${response.statusText}`)

    if (response.status < 200 || response.status >= 300) {
      log(`[emby] Error body: ${response.body.slice(0, 500)}`)
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    if (!response.body) return { success: true, data: null }
    const data = JSON.parse(response.body)
    return { success: true, data }
  } catch (error: any) {
    log(`[emby] ERROR: ${error.message}\n${error.stack}`)
    return { success: false, error: error.message }
  }
})
