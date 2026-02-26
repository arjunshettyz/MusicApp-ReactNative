import TrackPlayer, { Event } from 'react-native-track-player';
import { usePlayerStore } from '../store/playerStore';
import {
    getHighestQualityUrl,
    getHighestQualityImage,
    getPrimaryArtistName,
} from '../utils/helpers';
import { Song } from '../types';

const loadAndPlay = async (song: Song | null): Promise<void> => {
    if (!song) return;
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
    usePlayerStore.getState().setIsPlaying(true);
};

async function PlaybackService(): Promise<void> {
    TrackPlayer.addEventListener(Event.RemotePlay, () => {
        TrackPlayer.play();
        usePlayerStore.getState().setIsPlaying(true);
    });

    TrackPlayer.addEventListener(Event.RemotePause, () => {
        TrackPlayer.pause();
        usePlayerStore.getState().setIsPlaying(false);
    });

    TrackPlayer.addEventListener(Event.RemoteStop, () => {
        TrackPlayer.stop();
        usePlayerStore.getState().setIsPlaying(false);
    });

    TrackPlayer.addEventListener(Event.RemoteNext, async () => {
        const nextSong = usePlayerStore.getState().playNext();
        await loadAndPlay(nextSong);
    });

    TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
        const prevSong = usePlayerStore.getState().playPrev();
        await loadAndPlay(prevSong);
    });

    TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async () => {
        const nextSong = usePlayerStore.getState().playNext();
        await loadAndPlay(nextSong);
    });
}

export default PlaybackService;
