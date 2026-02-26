export interface ImageQuality {
    quality: string;
    url: string;
}

export interface DownloadUrl {
    quality: string;
    url: string;
}

export interface Artist {
    id: string;
    name: string;
    role?: string;
    type: string;
    image: ImageQuality[];
    url: string;
    followerCount?: number;
    fanCount?: string;
    isVerified?: boolean;
    dominantLanguage?: string;
    dominantType?: string;
    bio?: Array<{ text: string; title: string; sequence: number }>;
    dob?: string;
    fb?: string | null;
    twitter?: string | null;
    wiki?: string;
    availableLanguages?: string[];
    isRadioPresent?: boolean;
    topSongs?: Song[];
    topAlbums?: AlbumData[];
    singles?: AlbumData[];
    similarArtists?: Artist[];
}

export interface Album {
    id: string | null;
    name: string | null;
    url: string | null;
}

export interface AlbumData {
    id: string;
    name: string;
    description?: string;
    type: string;
    year?: number | string;
    playCount?: number | null;
    language?: string;
    explicitContent?: boolean;
    url: string;
    songCount?: number;
    artists?: Artists;
    image: ImageQuality[];
    songs?: Song[] | null;
}

export interface Artists {
    primary: Artist[];
    featured: Artist[];
    all: Artist[];
}

export interface Song {
    id: string;
    name: string;
    type: string;
    year: string | null;
    releaseDate: string | null;
    duration: number | null;
    label: string | null;
    explicitContent: boolean;
    playCount: number | null;
    language: string;
    hasLyrics: boolean;
    lyricsId: string | null;
    url: string;
    copyright: string | null;
    album: Album;
    artists: Artists;
    image: ImageQuality[];
    downloadUrl: DownloadUrl[];
}

export interface Playlist {
    id: string;
    name: string;
    type: string;
    image: ImageQuality[];
    url: string;
    songCount?: number;
    firstname?: string;
    followerCount?: number;
    lastUpdated?: string;
}

export interface SearchSongsResponse {
    success: boolean;
    data: {
        total: number;
        start: number;
        results: Song[];
    };
}

export interface SearchAlbumsResponse {
    success: boolean;
    data: {
        total: number;
        start: number;
        results: AlbumData[];
    };
}

export interface SearchArtistsResponse {
    success: boolean;
    data: {
        total: number;
        start: number;
        results: Artist[];
    };
}

export interface SearchPlaylistsResponse {
    success: boolean;
    data: {
        total: number;
        start: number;
        results: Playlist[];
    };
}

export interface SearchAllResponse {
    success: boolean;
    data: {
        songs: { results: Song[] };
        albums: { results: AlbumData[] };
        artists: { results: Artist[] };
        playlists: { results: Playlist[] };
        topQuery: { results: any[] };
    };
}

export interface PlayerState {
    currentSong: Song | null;
    queue: Song[];
    currentIndex: number;
    isPlaying: boolean;
    position: number;
    duration: number;
}
