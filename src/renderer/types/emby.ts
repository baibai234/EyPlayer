export interface EmbyConfig {
  serverUrl: string
  apiKey: string
  userId: string
}

export interface MediaLibrary {
  id: string
  name: string
  type: string
  collectionType: string
}

export interface Person {
  id: string
  name: string
  role?: string
  imageUrl?: string
}

export interface MediaItem {
  id: string
  title: string
  type: MediaType
  year?: number
  rating?: number
  poster?: string
  backdrop?: string
  overview?: string
  duration?: number
  genres?: string[]
  directors?: string[]
  cast?: string[]
  castInfo?: Person[]
  premiereDate?: string
  officialRating?: string
  quality?: string
  audio?: string
  playedPercentage?: number
  positionTicks?: number
  seriesName?: string
  seriesId?: string
  episodeNumber?: number
  seasonNumber?: number
}

export type MediaType = 'Movie' | 'Series' | 'Episode' | 'Audio' | 'Book' | 'BoxSet'

export interface Season {
  id: string
  name: string
  seasonNumber?: number
  episodeCount?: number
  indexNumber?: number
}

export interface Episode {
  id: string
  title: string
  seasonId: string
  seasonNumber?: number
  episodeNumber?: number
  overview?: string
  duration?: number
  premiereDate?: string
  watched?: boolean
  playedPercentage?: number
}

export interface MediaQueryParams {
  parentId?: string
  includeItemTypes?: string
  sortBy?: string
  sortOrder?: 'Ascending' | 'Descending'
  limit?: number
  startIndex?: number
  searchTerm?: string
}

export interface EmbyApiResponse<T> {
  Items: T[]
  TotalRecordCount: number
  StartIndex: number
}
