# 🎵 MusicPlayer

A production-quality React Native music player built with Expo, powered by the [JioSaavn API](https://saavn.sumit.co). Spotify/JioSaavn-inspired design with real music streaming, background playback, and a clean architecture.

---

## ✨ Features

- 🔍 **Search** songs from JioSaavn (debounced, paginated)
- ▶️ **Full player** with album art (rotating disc), seek bar, play/pause/next/prev
- 🎵 **Mini player** persistent at the bottom, synced with full player
- 📋 **Queue management** - add, remove, auto-play next
- 💾 **Persistent storage** via MMKV - queue and last song restored on app restart
- 🔊 **Background playback** with lock screen controls
- 🌑 **Dark theme** — Spotify-inspired UI

---

## 🏗️ Architecture

```
src/
├── types/          → TypeScript interfaces (Song, Artist, Album, etc.)
├── services/
│   ├── api.ts           → Axios API layer (searchSongs, getSongById)
│   └── PlaybackService.ts → TrackPlayer background event handler
├── utils/
│   ├── helpers.ts   → formatTime, getHighestQualityImage, getHighestQualityUrl
│   └── storage.ts   → MMKV-backed persistence helpers
├── store/
│   └── playerStore.ts → Zustand global state (song, queue, position, etc.)
├── hooks/
│   └── usePlayer.ts → Unified hook bridging Zustand + TrackPlayer
├── navigation/
│   └── AppNavigator.tsx → React Navigation stack + MiniPlayer overlay
├── components/
│   ├── SongCard.tsx   → Reusable song list item with animated indicator
│   └── MiniPlayer.tsx → Persistent bottom player
└── screens/
    ├── HomeScreen.tsx   → Search + paginated song list
    ├── PlayerScreen.tsx → Full player with seek bar + animations
    └── QueueScreen.tsx  → Queue management
```

---

## 🗂️ State Management (Zustand)

All player state lives in `src/store/playerStore.ts`:

| State | Type | Description |
|---|---|---|
| `currentSong` | `Song \| null` | Currently playing song |
| `queue` | `Song[]` | Ordered queue of songs |
| `currentIndex` | `number` | Index of current song in queue |
| `isPlaying` | `boolean` | Playback status |
| `position` | `number` | Current seek position (seconds) |
| `duration` | `number` | Total track duration (seconds) |

State is shared across **HomeScreen**, **PlayerScreen**, **MiniPlayer**, and **QueueScreen** via Zustand selectors. MMKV persists `queue`, `currentSong`, and `currentIndex` automatically.

---

## 🎧 Playback System

Uses **react-native-track-player** for:
- Native background playback on iOS and Android
- Lock screen media controls (play/pause/next/prev)
- Automatic next song on queue end

**Flow:**
1. User taps song → `usePlayer.playSong()` called
2. Song added to Zustand queue
3. TrackPlayer loads URL (320kbps) and plays
4. `PlaybackService.ts` handles remote events (lock screen buttons)
5. Progress synced from TrackPlayer → Zustand store via `useProgress()`

---

## 💾 Storage (MMKV)

| Key | Data | Saved On |
|---|---|---|
| `player_queue` | `Song[]` as JSON | Queue change |
| `player_current_song` | `Song` as JSON | Song change |
| `player_current_index` | `number` | Index change |

Restored from MMKV on Zustand store initialization.

---

## 🚀 How to Run

### Prerequisites
- Node.js ≥ 18
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Android Studio or Xcode (for device/emulator)
- [EAS CLI](https://docs.expo.dev/eas/) for building

### Install dependencies

```bash
npm install
```

### Development Build (Required — Expo Go not supported)

`react-native-track-player` and `react-native-mmkv` require native code that Expo Go cannot run. You must use a **development build**:

```bash
# Android
npx expo run:android

# iOS
npx expo run:ios
```

Or with EAS:
```bash
eas build --profile development --platform android
```

### Start dev server

```bash
npx expo start --dev-client
```

---

## 📦 Tech Stack

| Package | Version | Purpose |
|---|---|---|
| `expo` | ~54 | Framework |
| `react-native` | 0.81 | Core |
| `typescript` | ~5.9 | Type safety |
| `zustand` | ^5 | Global state |
| `react-native-mmkv` | latest | Fast persistent storage |
| `react-native-track-player` | latest | Background audio |
| `axios` | latest | HTTP API calls |
| `@react-navigation/native` | latest | Navigation |
| `@react-navigation/native-stack` | latest | Stack navigator |
| `react-native-reanimated` | latest | Animations |
| `@react-native-community/slider` | latest | Seek bar |

---

## 🔌 API

Base URL: `https://saavn.sumit.co`

| Function | Endpoint | Description |
|---|---|---|
| `searchSongs(query, page, limit)` | `GET /api/search/songs` | Search songs |
| `getSongById(id)` | `GET /api/songs/{id}` | Get song details |
| `getSongSuggestions(id)` | `GET /api/songs/{id}/suggestions` | Similar songs |

Audio uses `downloadUrl` with `320kbps` quality. Images use `500x500` quality.
