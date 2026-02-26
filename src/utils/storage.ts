// react-native-mmkv: use require to avoid 'MMKV only refers to a type' TS error
// eslint-disable-next-line @typescript-eslint/no-var-requires
const MMKVModule = require('react-native-mmkv');
import { Song } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const storage: any = new MMKVModule.MMKV({
    id: 'music-player-storage',
});

const QUEUE_KEY = 'player_queue';
const CURRENT_SONG_KEY = 'player_current_song';
const CURRENT_INDEX_KEY = 'player_current_index';
const POSITION_KEY = 'player_position';
const FAVORITES_KEY = 'player_favorites';


export const saveQueue = (queue: Song[]): void => {
    try {
        storage.set(QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
        console.warn('Failed to save queue:', e);
    }
};

export const loadQueue = (): Song[] => {
    try {
        const raw = storage.getString(QUEUE_KEY);
        if (raw) return JSON.parse(raw) as Song[];
    } catch (e) {
        console.warn('Failed to load queue:', e);
    }
    return [];
};

export const saveCurrentSong = (song: Song | null): void => {
    try {
        storage.set(CURRENT_SONG_KEY, song ? JSON.stringify(song) : '');
    } catch (e) {
        console.warn('Failed to save current song:', e);
    }
};

export const loadCurrentSong = (): Song | null => {
    try {
        const raw = storage.getString(CURRENT_SONG_KEY);
        if (raw) return JSON.parse(raw) as Song;
    } catch (e) {
        console.warn('Failed to load current song:', e);
    }
    return null;
};

export const saveCurrentIndex = (index: number): void => {
    storage.set(CURRENT_INDEX_KEY, index);
};

export const loadCurrentIndex = (): number => {
    return storage.getNumber(CURRENT_INDEX_KEY) ?? 0;
};

export const savePosition = (position: number): void => {
    storage.set(POSITION_KEY, position);
};

export const loadPosition = (): number => {
    return storage.getNumber(POSITION_KEY) ?? 0;
};

export const saveFavorites = (favorites: Song[]): void => {
    try {
        storage.set(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (e) {
        console.warn('Failed to save favorites:', e);
    }
};

export const loadFavorites = (): Song[] => {
    try {
        const raw = storage.getString(FAVORITES_KEY);
        if (raw) return JSON.parse(raw) as Song[];
    } catch (e) {
        console.warn('Failed to load favorites:', e);
    }
    return [];
};
