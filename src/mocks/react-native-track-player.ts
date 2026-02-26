import { useCallback } from 'react';

export enum Capability {
    Play = 0,
    Pause = 1,
    Stop = 2,
    Next = 3,
    Previous = 4,
    JumpForward = 5,
    JumpBackward = 6,
    SeekTo = 7,
    SkipToNext = 8,
    SkipToPrevious = 9,
}

export enum Event {
    PlaybackState = 'playback-state',
    PlaybackError = 'playback-error',
    RemotePlay = 'remote-play',
    RemotePause = 'remote-pause',
    RemoteStop = 'remote-stop',
    RemoteNext = 'remote-next',
    RemotePrevious = 'remote-previous',
    RemoteSeek = 'remote-seek',
    PlaybackQueueEnded = 'playback-queue-ended',
}

export enum State {
    None = 'none',
    Ready = 'ready',
    Playing = 'playing',
    Paused = 'paused',
    Stopped = 'stopped',
    Buffering = 'buffering',
    Connecting = 'connecting',
}

export const usePlaybackState = () => ({
    state: State.None,
});

export const useProgress = () => ({
    position: 0,
    duration: 0,
    buffered: 0,
});

const TrackPlayer = {
    setupPlayer: async () => { },
    updateOptions: async () => { },
    reset: async () => { },
    add: async () => { },
    play: async () => { },
    pause: async () => { },
    stop: async () => { },
    getState: async () => State.None,
    seekTo: async () => { },
    getPosition: async () => 0,
    getDuration: async () => 0,
    addEventListener: (event: string, listener: any) => {
        return { remove: () => { } };
    },
    registerPlaybackService: (factory: any) => { },
};

export default TrackPlayer;
