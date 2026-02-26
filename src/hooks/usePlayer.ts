import TrackPlayer, {
    Capability,
    Event,
    State,
    usePlaybackState,
    useProgress,
} from 'react-native-track-player';
import { useCallback, useEffect } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { Song } from '../types';
import {
    getHighestQualityUrl,
    getHighestQualityImage,
    getPrimaryArtistName,
} from '../utils/helpers';

let isSetup = false;

export const setupPlayer = async (): Promise<void> => {
    if (isSetup) return;
    try {
        await TrackPlayer.setupPlayer({
            maxCacheSize: 1024 * 5,
        });
        await TrackPlayer.updateOptions({
            capabilities: [
                Capability.Play,
                Capability.Pause,
                Capability.SkipToNext,
                Capability.SkipToPrevious,
                Capability.Stop,
                Capability.SeekTo,
            ],
            compactCapabilities: [
                Capability.Play,
                Capability.Pause,
                Capability.SkipToNext,
            ],
        });
        isSetup = true;
    } catch (e) {
        console.warn('TrackPlayer setup error:', e);
    }
};

export const usePlayer = () => {
    const store = usePlayerStore();
    const playbackState = usePlaybackState();
    const progress = useProgress();

    // Sync position + duration from TrackPlayer to store
    useEffect(() => {
        store.setPosition(progress.position);
        store.setDuration(progress.duration);
    }, [progress.position, progress.duration]);

    // Sync isPlaying from TrackPlayer state
    useEffect(() => {
        const playing = playbackState.state === State.Playing;
        store.setIsPlaying(playing);
    }, [playbackState.state]);

    const playSong = useCallback(
        async (song: Song, queue?: Song[]) => {
            try {
                // Update queue in store
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

                // Load into TrackPlayer
                await TrackPlayer.reset();
                await TrackPlayer.add({
                    id: song.id,
                    url: getHighestQualityUrl(song.downloadUrl),
                    title: song.name,
                    artist: getPrimaryArtistName(song),
                    artwork: getHighestQualityImage(song.image),
                    duration: song.duration ?? 0,
                });
                await TrackPlayer.play();
                store.setIsPlaying(true);
            } catch (e) {
                console.warn('playSong error:', e);
            }
        },
        []
    );

    const togglePlay = useCallback(async () => {
        try {
            const state = await TrackPlayer.getState();
            if (state === State.Playing) {
                await TrackPlayer.pause();
                store.setIsPlaying(false);
            } else {
                await TrackPlayer.play();
                store.setIsPlaying(true);
            }
        } catch (e) {
            console.warn('togglePlay error:', e);
        }
    }, []);

    const seekTo = useCallback(async (position: number) => {
        try {
            await TrackPlayer.seekTo(position);
        } catch (e) {
            console.warn('seekTo error:', e);
        }
    }, []);

    const seekForward = useCallback(async (seconds = 10) => {
        try {
            const pos = await TrackPlayer.getPosition();
            const dur = await TrackPlayer.getDuration();
            await TrackPlayer.seekTo(Math.min(pos + seconds, dur));
        } catch (e) {
            console.warn('seekForward error:', e);
        }
    }, []);

    const seekBackward = useCallback(async (seconds = 10) => {
        try {
            const pos = await TrackPlayer.getPosition();
            await TrackPlayer.seekTo(Math.max(pos - seconds, 0));
        } catch (e) {
            console.warn('seekBackward error:', e);
        }
    }, []);

    const skipToNext = useCallback(async () => {
        const nextSong = store.playNext();
        if (!nextSong) return;
        try {
            await TrackPlayer.reset();
            await TrackPlayer.add({
                id: nextSong.id,
                url: getHighestQualityUrl(nextSong.downloadUrl),
                title: nextSong.name,
                artist: getPrimaryArtistName(nextSong),
                artwork: getHighestQualityImage(nextSong.image),
                duration: nextSong.duration ?? 0,
            });
            await TrackPlayer.play();
            store.setIsPlaying(true);
        } catch (e) {
            console.warn('skipToNext error:', e);
        }
    }, [store]);

    const skipToPrev = useCallback(async () => {
        const prevSong = store.playPrev();
        if (!prevSong) return;
        try {
            await TrackPlayer.reset();
            await TrackPlayer.add({
                id: prevSong.id,
                url: getHighestQualityUrl(prevSong.downloadUrl),
                title: prevSong.name,
                artist: getPrimaryArtistName(prevSong),
                artwork: getHighestQualityImage(prevSong.image),
                duration: prevSong.duration ?? 0,
            });
            await TrackPlayer.play();
            store.setIsPlaying(true);
        } catch (e) {
            console.warn('skipToPrev error:', e);
        }
    }, [store]);

    const shuffleQueue = useCallback(async () => {
        const { queue } = store;
        if (queue.length === 0) return;
        const shuffled = [...queue];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        await playSong(shuffled[0], shuffled);
    }, [store, playSong]);

    return {
        currentSong: store.currentSong,
        queue: store.queue,
        currentIndex: store.currentIndex,
        isPlaying: store.isPlaying,
        position: store.position,
        duration: store.duration,
        playSong,
        togglePlay,
        seekTo,
        seekForward,
        seekBackward,
        skipToNext,
        skipToPrev,
        shuffleQueue,
    };
};
