import type { EmbyConfig, MediaLibrary, MediaItem, MediaQueryParams, Season, Episode } from '@/types/emby'

export class EmbyApi {
  private config: EmbyConfig

  constructor(config: EmbyConfig) {
    this.config = config
  }

  static async authenticate(serverUrl: string, username: string, password: string): Promise<{ userId: string; accessToken: string }> {
    const endpoint = '/Users/AuthenticateByName'

    let result: any
    if (window.electronAPI) {
      const resp = await window.electronAPI.embyRequest({
        serverUrl,
        apiKey: '',
        endpoint,
        method: 'POST',
        body: { Username: username, Pw: password }
      })
      if (!resp.success) throw new EmbyApiError(0, resp.error || '登录失败')
      result = resp.data
    } else {
      const baseUrl = serverUrl.replace(/\/$/, '').replace(/\/emby$/, '')
      const url = `${baseUrl}/emby${endpoint}`
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Emby-Authorization': 'MediaBrowser Client="EyPlayer", Device="PC", DeviceId="eyplayer-001", Version="0.1.0"'
        },
        body: JSON.stringify({ Username: username, Pw: password })
      })
      if (!response.ok) throw new EmbyApiError(response.status, '登录失败')
      result = await response.json()
    }

    return { userId: result.User.Id, accessToken: result.AccessToken }
  }

  async testConnection(): Promise<boolean> {
    try {
      const result = await this.request('/System/Info')
      return result !== null
    } catch {
      return false
    }
  }

  async getServerInfo(): Promise<any> {
    return this.request('/System/Info')
  }

  async getLibraries(): Promise<MediaLibrary[]> {
    const response = await this.request<any>('/Library/VirtualFolders')
    const items = response || []
    return items.map((item: any) => ({
      id: item.ItemId || item.Id || item.id,
      name: item.Name || item.name || '未知',
      type: item.Type || item.type || '',
      collectionType: item.CollectionType || item.collectionType || ''
    }))
  }

  async getMediaItems(params?: MediaQueryParams): Promise<MediaItem[]> {
    const queryParams = new URLSearchParams()

    if (params?.parentId) queryParams.append('ParentId', params.parentId)
    queryParams.append('IncludeItemTypes', params?.includeItemTypes || 'Movie,Series,BoxSet')
    if (params?.sortBy) queryParams.append('SortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('SortOrder', params.sortOrder)
    if (params?.limit) queryParams.append('Limit', params.limit.toString())
    if (params?.startIndex) queryParams.append('StartIndex', params.startIndex.toString())
    if (params?.searchTerm) queryParams.append('SearchTerm', params.searchTerm)
    queryParams.append('Recursive', 'true')
    queryParams.append('Fields', 'Overview,Genres,People,MediaStreams')

    const queryString = queryParams.toString()
    const endpoint = `/Users/${this.config.userId}/Items${queryString ? `?${queryString}` : ''}`

    const response = await this.request<any>(endpoint)
    const items = response?.Items || []
    return items.map((item: any) => this.mapMediaItem(item))
  }

  async getMediaDetail(id: string): Promise<MediaItem | null> {
    const raw = await this.request<any>(`/Users/${this.config.userId}/Items/${id}?Fields=Overview,Genres,People,MediaStreams`)
    if (!raw) return null
    return this.mapMediaItem(raw)
  }

  private mapMediaItem(raw: any): MediaItem {
    const people = raw.People || []
    const directors = people.filter((p: any) => p.Type === 'Director').map((p: any) => p.Name)
    const actors = people.filter((p: any) => p.Type === 'Actor')
    const cast = actors.map((p: any) => p.Name)
    const baseUrl = this.config.serverUrl.replace(/\/$/, '').replace(/\/emby$/, '')
    const castInfo = actors.map((p: any) => ({
      id: p.Id || '',
      name: p.Name || '',
      role: p.Role || '',
      imageUrl: p.Id ? `${baseUrl}/emby/Items/${p.Id}/Images/Primary?width=100&height=100` : undefined
    }))

    const durationTicks = raw.RunTimeTicks || 0
    const durationMinutes = Math.round(durationTicks / 10_000_000 / 60)

    let quality: string | undefined
    let audio: string | undefined
    const streams = raw.MediaStreams || []
    const videoStream = streams.find((s: any) => s.Type === 'Video')
    if (videoStream?.Height) {
      if (videoStream.Height >= 2160) quality = '4K'
      else if (videoStream.Height >= 1080) quality = '1080p'
      else if (videoStream.Height >= 720) quality = '720p'
      else quality = `${videoStream.Height}p`
    }
    const audioStream = streams.find((s: any) => s.Type === 'Audio')
    if (audioStream?.Codec) {
      audio = audioStream.Codec.toUpperCase()
    }

    const userData = raw.UserData || {}

    return {
      id: raw.Id,
      title: raw.Name || '未知',
      type: raw.Type || 'Movie',
      year: raw.ProductionYear,
      rating: raw.CommunityRating,
      overview: raw.Overview,
      duration: durationMinutes,
      genres: raw.Genres || [],
      directors,
      cast,
      castInfo,
      premiereDate: raw.PremiereDate,
      officialRating: raw.OfficialRating,
      quality,
      audio,
      playedPercentage: userData.PlayedPercentage || 0,
      positionTicks: userData.PlaybackPositionTicks || 0,
      seriesName: raw.SeriesName || '',
      seriesId: raw.SeriesId || '',
      episodeNumber: raw.IndexNumber,
      seasonNumber: raw.ParentIndexNumber,
      poster: raw.Type === 'Episode' && raw.SeriesId
        ? `${this.config.serverUrl.replace(/\/$/, '').replace(/\/emby$/, '')}/emby/Items/${raw.SeriesId}/Images/Primary?width=300&height=450`
        : undefined,
      backdrop: raw.Type === 'Episode' && raw.SeriesId
        ? `${this.config.serverUrl.replace(/\/$/, '').replace(/\/emby$/, '')}/emby/Items/${raw.SeriesId}/Images/Backdrop?width=560&height=360`
        : undefined
    }
  }

  getPosterUrl(id: string, options?: { width?: number; height?: number }): string {
    const baseUrl = this.config.serverUrl.replace(/\/$/, '').replace(/\/emby$/, '')
    const params = new URLSearchParams()
    if (options?.width) params.append('width', options.width.toString())
    if (options?.height) params.append('height', options.height.toString())
    const queryString = params.toString()
    return `${baseUrl}/emby/Items/${id}/Images/Primary${queryString ? `?${queryString}` : ''}`
  }

  getBackdropUrl(id: string, options?: { width?: number; height?: number }): string {
    const baseUrl = this.config.serverUrl.replace(/\/$/, '').replace(/\/emby$/, '')
    const params = new URLSearchParams()
    if (options?.width) params.append('width', options.width.toString())
    if (options?.height) params.append('height', options.height.toString())
    const queryString = params.toString()
    return `${baseUrl}/emby/Items/${id}/Images/Backdrop${queryString ? `?${queryString}` : ''}`
  }

  getPlaybackUrl(id: string, playbackBaseUrl?: string): string {
    const baseUrl = (playbackBaseUrl || this.config.serverUrl).replace(/\/$/, '').replace(/\/emby$/, '')
    return `${baseUrl}/emby/Items/${id}/Download?api_key=${this.config.apiKey}`
  }

  async getResumeItems(limit = 20): Promise<MediaItem[]> {
    const response = await this.request<any>(`/Users/${this.config.userId}/Items/Resume?Limit=${limit}&Recursive=true&IncludeItemTypes=Movie,Episode,Series&Fields=Overview,Genres,People,MediaStreams`)
    const items = response?.Items || []
    return items.map((item: any) => this.mapMediaItem(item))
  }

  async getNextUp(seriesId?: string, limit = 20): Promise<MediaItem[]> {
    let endpoint = `/Shows/NextUp?UserId=${this.config.userId}&Limit=${limit}&Fields=Overview,Genres,People,MediaStreams`
    if (seriesId) endpoint += `&ParentId=${seriesId}`
    const response = await this.request<any>(endpoint)
    const items = response?.Items || []
    return items.map((item: any) => this.mapMediaItem(item))
  }

  async getSeasons(seriesId: string): Promise<Season[]> {
    const response = await this.request<any>(`/Shows/${seriesId}/Seasons?UserId=${this.config.userId}&Fields=Overview`)
    const items = response?.Items || []
    return items.map((item: any) => ({
      id: item.Id,
      name: item.Name || `第 ${item.IndexNumber || '?'} 季`,
      seasonNumber: item.IndexNumber,
      episodeCount: item.ChildCount || item.RecursiveItemCount || 0,
      indexNumber: item.IndexNumber
    }))
  }

  async getEpisodes(seriesId: string, seasonId: string): Promise<Episode[]> {
    const response = await this.request<any>(`/Shows/${seriesId}/Episodes?SeasonId=${seasonId}&UserId=${this.config.userId}&Fields=Overview,MediaStreams`)
    const items = response?.Items || []
    return items.map((item: any) => {
      const durationTicks = item.RunTimeTicks || 0
      const durationMinutes = Math.round(durationTicks / 10_000_000 / 60)
      const userData = item.UserData || {}
      return {
        id: item.Id,
        title: item.Name || `第 ${item.IndexNumber || '?'} 集`,
        seasonId,
        seasonNumber: item.ParentIndexNumber,
        episodeNumber: item.IndexNumber,
        overview: item.Overview,
        duration: durationMinutes,
        premiereDate: item.PremiereDate,
        watched: userData.Played || false,
        playedPercentage: userData.PlayedPercentage || 0
      }
    })
  }

  async getBoxSetChildren(boxSetId: string): Promise<MediaItem[]> {
    const response = await this.request<any>(
      `/Users/${this.config.userId}/Items?ParentId=${boxSetId}&Recursive=true&Fields=Overview,Genres,People,MediaStreams&IncludeItemTypes=Movie,Series,BoxSet`
    )
    const items = response?.Items || []
    return items.map((item: any) => this.mapMediaItem(item))
  }

  async searchMedia(query: string): Promise<MediaItem[]> {
    return this.getMediaItems({ searchTerm: query, limit: 50, includeItemTypes: 'Movie,Series,BoxSet' })
  }

  async updateProgress(id: string, positionTicks: number): Promise<void> {
    await this.request(`/Users/${this.config.userId}/Items/${id}/UserData`, {
      method: 'POST',
      body: { PlaybackPositionTicks: positionTicks }
    })
  }

  async markAsWatched(id: string): Promise<void> {
    await this.request(`/Users/${this.config.userId}/PlayedItems/${id}`, {
      method: 'POST'
    })
  }

  async markAsUnwatched(id: string): Promise<void> {
    await this.request(`/Users/${this.config.userId}/PlayedItems/${id}`, {
      method: 'DELETE'
    })
  }

  async addToFavorites(id: string): Promise<void> {
    await this.request(`/Users/${this.config.userId}/FavoriteItems/${id}`, {
      method: 'POST'
    })
  }

  async removeFromFavorites(id: string): Promise<void> {
    await this.request(`/Users/${this.config.userId}/FavoriteItems/${id}`, {
      method: 'DELETE'
    })
  }

  async reportPlayback(endpoint: string, body: any): Promise<void> {
    await this.request(endpoint, {
      method: 'POST',
      body
    })
  }

  private async request<T>(endpoint: string, options?: any): Promise<T | null> {
    if (window.electronAPI) {
      const result = await window.electronAPI.embyRequest({
        serverUrl: this.config.serverUrl,
        apiKey: this.config.apiKey,
        endpoint,
        method: options?.method,
        body: options?.body
      })

      if (!result.success) {
        throw new EmbyApiError(0, result.error || '请求失败')
      }

      return result.data as T
    }

    const baseUrl = this.config.serverUrl.replace(/\/$/, '').replace(/\/emby$/, '')
    const url = `${baseUrl}/emby${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Emby-Authorization': 'MediaBrowser Client="EyPlayer", Device="PC", DeviceId="eyplayer-001", Version="0.1.0"'
    }
    if (this.config.apiKey) headers['X-Emby-Token'] = this.config.apiKey
    const response = await fetch(url, {
      method: options?.method || 'GET',
      headers,
      body: options?.body ? JSON.stringify(options.body) : undefined
    })

    if (!response.ok) {
      throw new EmbyApiError(response.status, response.statusText)
    }

    const text = await response.text()
    if (!text) return null
    return JSON.parse(text)
  }
}

export class EmbyApiError extends Error {
  code: number

  constructor(code: number, message: string) {
    super(message)
    this.code = code
    this.name = 'EmbyApiError'
  }
}
