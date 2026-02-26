// Web-compatible player hook using expo-av instead of react-native-track-player
import { useCallback, useRef, useEffect, useState } from 'react';
import { Audio } from 'expo-av';
import { usePlayerStore } from '../store/playerStore';
import { Song } from '../types';
import {
    getHighestQualityUrl,
    getPrimaryArtistName,
} from '../utils/helpers';

// Singleton sound instance for web
let soundRef: Audio.Sound | null = null;

export const setupPlayer = async (): Promise<void> => {
    // No setup needed for expo-av on web
};

export const usePlayer = () => {
    const store = usePlayerStore();
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Poll position while playing
    useEffect(() => {
        if (store.isPlaying) {
            intervalRef.current = setInterval(async () => {
                if (soundRef) {
                    const status = await soundRef.getStatusAsync();
                    if (status.isLoaded) {
                        setPosition(status.positionMillis / 1000);
                        setDuration((status.durationMillis ?? 0) / 1000);
                        store.setPosition(status.positionMillis / 1000);
                        store.setDuration((status.durationMillis ?? 0) / 1000);
                        // Auto-play next when done
                        if (status.didJustFinish) {
                            nextSongHandler();
                        }
                    }
                }
            }, 500);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [store.isPlaying]);

    const nextSongHandler = async () => {
        const nextSong = store.playNext();
        if (!nextSong) return;
        await loadAndPlay(nextSong);
    };

    const loadAndPlay = async (song: Song) => {
        try {
            if (soundRef) {
                await soundRef.stopAsync();
                await soundRef.unloadAsync();
                soundRef = null;
            }
            const { sound } = await Audio.Sound.createAsync(
                { uri: getHighestQualityUrl(song.downloadUrl) },
                { shouldPlay: true }
            );
            soundRef = sound;
            store.setIsPlaying(true);

            // Get initial duration
            const status = await sound.getStatusAsync();
            if (status.isLoaded) {
                setDuration((status.durationMillis ?? 0) / 1000);
                store.setDuration((status.durationMillis ?? 0) / 1000);
            }
        } catch (e) {
            console.warn('loadAndPlay error:', e);
        }
    };

    const playSong = useCallback(async (song: Song, queue?: Song[]) => {
        if (queue) {
            store.setQueue(queue);
            const idx = queue.findIndex((s) => s.id === song.id);
            store.setCurrentIndex(idx >= 0 ? idx : 0);
        } else {
            store.addToQueue(song);
            const newQueue = usePlayerStore.getState().queue;
            const idx = newQueue.findIndex((s) => s.id === song.id);
            store.setCurrentIndex(idx >= 0 ? idx : 0);
        }
        store.setCurrentSong(song);
        await loadAndPlay(song);
    }, []);

    const togglePlay = useCallback(async () => {
        if (!soundRef) return;
        try {
            const status = await soundRef.getStatusAsync();
            if (!status.isLoaded) return;
            if (status.isPlaying) {
                await soundRef.pauseAsync();
                store.setIsPlaying(false);
            } else {
                await soundRef.playAsync();
                store.setIsPlaying(true);
            }
        } catch (e) {
            console.warn('togglePlay error:', e);
        }
    }, []);

    const seekTo = useCallback(async (positionSeconds: number) => {
        if (!soundRef) return;
        try {
            await soundRef.setPositionAsync(positionSeconds * 1000);
            setPosition(positionSeconds);
            store.setPosition(positionSeconds);
        } catch (e) {
            console.warn('seekTo error:', e);
        }
    }, []);

    const skipToNext = useCallback(async () => {
        const nextSong = store.playNext();
        if (!nextSong) return;
        store.setCurrentSong(nextSong);
        await loadAndPlay(nextSong);
    }, [store]);

    const skipToPrev = useCallback(async () => {
        const prevSong = store.playPrev();
        if (!prevSong) return;
        store.setCurrentSong(prevSong);
        await loadAndPlay(prevSong);
    }, [store]);

    return {
        currentSong: store.currentSong,
        queue: store.queue,
        currentIndex: store.currentIndex,
        isPlaying: store.isPlaying,
        position,
        duration,
        playSong,
        togglePlay,
        seekTo,
        skipToNext,
        skipToPrev,
    };
};
