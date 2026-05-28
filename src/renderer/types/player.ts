export type PlayerType = 'mpv' | 'potplayer' | 'vlc'

export interface PlayerConfig {
  type: PlayerType
  path: string
  args?: string[]
}

export interface PlayOptions {
  fullscreen?: boolean
  hardwareDecoding?: boolean
  subtitles?: string[]
  audioTrack?: number
  startTime?: number
}

export interface PlayProgress {
  currentTime: number
  duration: number
  percentage: number
}

export interface Player {
  name: string
  path: string
  isInstalled: boolean
  play(url: string, options?: PlayOptions): Promise<void>
  stop(): Promise<void>
  pause(): Promise<void>
  seek(time: number): Promise<void>
  getProgress(): Promise<PlayProgress>
}
