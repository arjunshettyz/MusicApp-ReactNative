import { create } from 'zustand';
import { Song } from '../types';
import {
    saveQueue,
    loadQueue,
    saveCurrentSong,
    loadCurrentSong,
    saveCurrentIndex,
    loadCurrentIndex,
    saveFavorites,
    loadFavorites,
} from '../utils/storage';

interface PlayerStore {
    // State
    currentSong: Song | null;
    queue: Song[];
    currentIndex: number;
    isPlaying: boolean;
    position: number;
    duration: number;
    favorites: Song[];
    isShuffled: boolean;

    // Queue actions
    setCurrentSong: (song: Song | null) => void;
    setQueue: (queue: Song[]) => void;
    addToQueue: (song: Song) => void;
    removeFromQueue: (index: number) => void;
    reorderQueue: (from: number, to: number) => void;
    setCurrentIndex: (index: number) => void;
    setIsPlaying: (playing: boolean) => void;
    setPosition: (position: number) => void;
    setDuration: (duration: number) => void;
    clearQueue: () => void;
    playNext: () => Song | null;
    playPrev: () => Song | null;
    toggleShuffle: () => void;

    // Favorites actions
    addToFavorites: (song: Song) => void;
    removeFromFavorites: (id: string) => void;
    isFavorite: (id: string) => boolean;
    toggleFavorite: (song: Song) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => {
    const persistedQueue = loadQueue();
    const persistedSong = loadCurrentSong();
    const persistedIndex = loadCurrentIndex();
    const persistedFavorites = loadFavorites();

    return {
        currentSong: persistedSong,
        queue: persistedQueue,
        currentIndex: persistedIndex,
        isPlaying: false,
        position: 0,
        duration: 0,
        favorites: persistedFavorites,
        isShuffled: false,

        toggleShuffle: () => set((s) => ({ isShuffled: !s.isShuffled })),

        setCurrentSong: (song) => {
            set({ currentSong: song });
            saveCurrentSong(song);
        },

        setQueue: (queue) => {
            set({ queue });
            saveQueue(queue);
        },

        addToQueue: (song) => {
            const { queue } = get();
            const exists = queue.some((s) => s.id === song.id);
            if (!exists) {
                const newQueue = [...queue, song];
                set({ queue: newQueue });
                saveQueue(newQueue);
            }
        },

        removeFromQueue: (index) => {
            const { queue, currentIndex } = get();
            const newQueue = queue.filter((_, i) => i !== index);
            let newIndex = currentIndex;
            if (index < currentIndex) newIndex = currentIndex - 1;
            else if (index === currentIndex) newIndex = Math.min(currentIndex, newQueue.length - 1);
            set({ queue: newQueue, currentIndex: newIndex });
            saveQueue(newQueue);
            saveCurrentIndex(newIndex);
        },

        reorderQueue: (from, to) => {
            const { queue } = get();
            const newQueue = [...queue];
            const [removed] = newQueue.splice(from, 1);
            newQueue.splice(to, 0, removed);
            set({ queue: newQueue });
            saveQueue(newQueue);
        },

        setCurrentIndex: (index) => {
            set({ currentIndex: index });
            saveCurrentIndex(index);
        },

        setIsPlaying: (playing) => set({ isPlaying: playing }),
        setPosition: (position) => set({ position }),
        setDuration: (duration) => set({ duration }),

        clearQueue: () => {
            set({ queue: [], currentIndex: 0, currentSong: null, isPlaying: false });
            saveQueue([]);
            saveCurrentSong(null);
            saveCurrentIndex(0);
        },

        playNext: () => {
            const { queue, currentIndex } = get();
            if (queue.length === 0) return null;
            const nextIndex = (currentIndex + 1) % queue.length;
            const nextSong = queue[nextIndex];
            set({ currentIndex: nextIndex, currentSong: nextSong });
            saveCurrentIndex(nextIndex);
            saveCurrentSong(nextSong);
            return nextSong;
        },

        playPrev: () => {
            const { queue, currentIndex } = get();
            if (queue.length === 0) return null;
            const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1;
            const prevSong = queue[prevIndex];
            set({ currentIndex: prevIndex, currentSong: prevSong });
            saveCurrentIndex(prevIndex);
            saveCurrentSong(prevSong);
            return prevSong;
        },

        addToFavorites: (song) => {
            const { favorites } = get();
            if (favorites.some((s) => s.id === song.id)) return;
            const newFavs = [...favorites, song];
            set({ favorites: newFavs });
            saveFavorites(newFavs);
        },

        removeFromFavorites: (id) => {
            const newFavs = get().favorites.filter((s) => s.id !== id);
            set({ favorites: newFavs });
            saveFavorites(newFavs);
        },

        isFavorite: (id) => get().favorites.some((s) => s.id === id),

        toggleFavorite: (song) => {
            const { isFavorite, addToFavorites, removeFromFavorites } = get();
            if (isFavorite(song.id)) {
                removeFromFavorites(song.id);
            } else {
                addToFavorites(song);
            }
        },
    };
});
