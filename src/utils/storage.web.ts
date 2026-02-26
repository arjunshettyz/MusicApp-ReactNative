// Web shim for MMKV storage — uses localStorage instead of react-native-mmkv
import { Song } from '../types';

const PREFIX = 'music-player-storage:';

const ls = {
    set: (key: string, value: string | number | boolean) => {
        try { localStorage.setItem(PREFIX + key, String(value)); } catch { }
    },
    getString: (key: string): string | undefined => {
        return localStorage.getItem(PREFIX + key) ?? undefined;
    },
    getNumber: (key: string): number | undefined => {
        const v = localStorage.getItem(PREFIX + key);
        if (v === null) return undefined;
        const n = Number(v);
        return isNaN(n) ? undefined : n;
    },
};

export const storage = ls;

const QUEUE_KEY = 'player_queue';
const CURRENT_SONG_KEY = 'player_current_song';
const CURRENT_INDEX_KEY = 'player_current_index';
const POSITION_KEY = 'player_position';
const FAVORITES_KEY = 'player_favorites';


export const saveQueue = (queue: Song[]): void => {
    ls.set(QUEUE_KEY, JSON.stringify(queue));
};

export const loadQueue = (): Song[] => {
    try {
        const raw = ls.getString(QUEUE_KEY);
        if (raw) return JSON.parse(raw) as Song[];
    } catch { }
    return [];
};

export const saveCurrentSong = (song: Song | null): void => {
    ls.set(CURRENT_SONG_KEY, song ? JSON.stringify(song) : '');
};

export const loadCurrentSong = (): Song | null => {
    try {
        const raw = ls.getString(CURRENT_SONG_KEY);
        if (raw) return JSON.parse(raw) as Song;
    } catch { }
    return null;
};

export const saveCurrentIndex = (index: number): void => {
    ls.set(CURRENT_INDEX_KEY, index);
};

export const loadCurrentIndex = (): number => {
    return ls.getNumber(CURRENT_INDEX_KEY) ?? 0;
};

export const savePosition = (position: number): void => {
    ls.set(POSITION_KEY, position);
};

export const loadPosition = (): number => {
    return ls.getNumber(POSITION_KEY) ?? 0;
};

export const saveFavorites = (favorites: Song[]): void => {
    ls.set(FAVORITES_KEY, JSON.stringify(favorites));
};

export const loadFavorites = (): Song[] => {
    try {
        const raw = ls.getString(FAVORITES_KEY);
        if (raw) return JSON.parse(raw) as Song[];
    } catch { }
    return [];
};
