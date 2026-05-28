import type { PlayerType, PlayOptions } from '@/types/player'

export class PlayerService {
  private detectedPlayers: PlayerType[] = []

  async detectPlayers(): Promise<PlayerType[]> {
    if (window.electronAPI) {
      const players = await window.electronAPI.playerDetect()
      this.detectedPlayers = players as PlayerType[]
    } else {
      this.detectedPlayers = ['mpv', 'potplayer', 'vlc']
    }
    return this.detectedPlayers
  }

  getDetectedPlayers(): PlayerType[] {
    return this.detectedPlayers
  }

  isPlayerAvailable(type: PlayerType): boolean {
    return this.detectedPlayers.includes(type)
  }

  async play(url: string, playerType: PlayerType = 'mpv', options?: PlayOptions): Promise<void> {
    if (window.electronAPI) {
      const result = await window.electronAPI.playerPlay(url, {
        playerType,
        fullscreen: options?.fullscreen,
        hardwareDecoding: options?.hardwareDecoding,
        startTime: options?.startTime
      })

      if (!result.success) {
        throw new Error(result.error || '播放失败')
      }
    } else {
      console.log(`[Dev] Playing ${url} with ${playerType}`)
    }
  }

  async parseStrm(filePath: string): Promise<string | null> {
    if (window.electronAPI) {
      const result = await window.electronAPI.strmParse(filePath)
      if (result.success && result.url) {
        return result.url
      }
      return null
    }
    return filePath
  }
}

export const playerService = new PlayerService()
