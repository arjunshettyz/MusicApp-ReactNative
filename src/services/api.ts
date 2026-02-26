import axios from 'axios';
import {
    SearchSongsResponse,
    SearchAlbumsResponse,
    SearchArtistsResponse,
    SearchPlaylistsResponse,
    SearchAllResponse,
    Song,
    Artist,
    AlbumData,
    Playlist,
} from '../types';

const api = axios.create({
    baseURL: 'https://saavn.sumit.co',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ── Search APIs ──────────────────────────────────────────────────────────────

export const searchAll = async (query: string): Promise<SearchAllResponse['data']> => {
    const response = await api.get<SearchAllResponse>('/api/search', { params: { query } });
    if (!response.data.success) throw new Error('Search failed');
    return response.data.data;
};

export const searchSongs = async (
    query: string,
    page: number = 0,
    limit: number = 20
): Promise<SearchSongsResponse['data']> => {
    const response = await api.get<SearchSongsResponse>('/api/search/songs', {
        params: { query, page, limit },
    });
    if (!response.data.success) throw new Error('Song search failed');
    return response.data.data;
};

export const searchAlbums = async (
    query: string,
    page: number = 0,
    limit: number = 20
): Promise<SearchAlbumsResponse['data']> => {
    const response = await api.get<SearchAlbumsResponse>('/api/search/albums', {
        params: { query, page, limit },
    });
    if (!response.data.success) throw new Error('Album search failed');
    return response.data.data;
};

export const searchArtists = async (
    query: string,
    page: number = 0,
    limit: number = 20
): Promise<SearchArtistsResponse['data']> => {
    const response = await api.get<SearchArtistsResponse>('/api/search/artists', {
        params: { query, page, limit },
    });
    if (!response.data.success) throw new Error('Artist search failed');
    return response.data.data;
};

export const searchPlaylists = async (
    query: string,
    page: number = 0,
    limit: number = 20
): Promise<SearchPlaylistsResponse['data']> => {
    const response = await api.get<SearchPlaylistsResponse>('/api/search/playlists', {
        params: { query, page, limit },
    });
    if (!response.data.success) throw new Error('Playlist search failed');
    return response.data.data;
};

// ── Songs APIs ───────────────────────────────────────────────────────────────

export const getSongById = async (id: string): Promise<Song | null> => {
    const response = await api.get<{ success: boolean; data: Song[] }>(`/api/songs/${id}`);
    if (!response.data.success || !response.data.data.length) return null;
    return response.data.data[0];
};

export const getSongSuggestions = async (
    id: string,
    limit: number = 10
): Promise<Song[]> => {
    const response = await api.get<{ success: boolean; data: Song[] }>(
        `/api/songs/${id}/suggestions`,
        { params: { limit } }
    );
    if (!response.data.success) return [];
    return response.data.data;
};

// ── Artists APIs ─────────────────────────────────────────────────────────────

export const getArtistById = async (id: string): Promise<Artist | null> => {
    const response = await api.get<{ success: boolean; data: Artist }>(`/api/artists/${id}`);
    if (!response.data.success) return null;
    return response.data.data;
};

export const getArtistSongs = async (
    id: string,
    page: number = 0,
    limit: number = 20
): Promise<Song[]> => {
    const response = await api.get<{ success: boolean; data: { songs: Song[] } }>(
        `/api/artists/${id}/songs`,
        { params: { page, limit } }
    );
    if (!response.data.success) return [];
    return response.data.data.songs;
};

export const getArtistAlbums = async (
    id: string,
    page: number = 0,
    limit: number = 20
): Promise<AlbumData[]> => {
    const response = await api.get<{ success: boolean; data: { albums: AlbumData[] } }>(
        `/api/artists/${id}/albums`,
        { params: { page, limit } }
    );
    if (!response.data.success) return [];
    return response.data.data.albums;
};

export const getAlbumById = async (id: string): Promise<AlbumData | null> => {
    const response = await api.get<{ success: boolean; data: AlbumData }>(`/api/albums`, {
        params: { id },
    });
    if (!response.data.success) return null;
    return response.data.data;
};

export default api;
