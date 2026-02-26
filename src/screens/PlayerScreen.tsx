import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Animated,
    PanResponder,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Radius, Spacing, Typography } from '../theme';
import { usePlayer } from '../hooks/usePlayer';
import { usePlayerStore } from '../store/playerStore';
import { getHighestQualityImage, getPrimaryArtistName, formatTime } from '../utils/helpers';
import SongContextMenu from '../components/SongContextMenu';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ART_SIZE = Math.min(SCREEN_WIDTH - Spacing.lg * 2, SCREEN_HEIGHT * 0.38);

const PlayerScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { togglePlay, seekTo, skipToNext, skipToPrev, seekForward, seekBackward } = usePlayer();
    const currentSong = usePlayerStore((s) => s.currentSong);
    const isPlaying = usePlayerStore((s) => s.isPlaying);
    const position = usePlayerStore((s) => s.position);
    const duration = usePlayerStore((s) => s.duration);

    const [seekValue, setSeekValue] = useState<number | null>(null);
    const [isSeeking, setIsSeeking] = useState(false);
    const [showLyrics, setShowLyrics] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    if (!currentSong) {
        return (
            <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
                <StatusBar barStyle={colors.statusBar} />
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-down" size={26} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.centered}>
                    <Ionicons name="musical-notes-outline" size={60} color={colors.border} />
                    <Text style={[styles.noSongText, { color: colors.textSecondary }]}>No song playing</Text>
                </View>
            </View>
        );
    }

    const displayPosition = seekValue !== null ? seekValue : position;
    const progress = duration > 0 ? Math.min(displayPosition / duration, 1) : 0;
    const imageUrl = getHighestQualityImage(currentSong.image);
    const artist = getPrimaryArtistName(currentSong);

    // Seek bar pan handling
    const [seekBarWidth, setSeekBarWidth] = useState(SCREEN_WIDTH - Spacing.lg * 2);

    const handleSeekRelease = async (val: number) => {
        setIsSeeking(false);
        setSeekValue(null);
        await seekTo(val);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-down" size={28} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerTitle}>
                    <Text style={[styles.nowPlaying, { color: colors.textSecondary }]}>Now Playing</Text>
                    <Text style={[styles.albumName, { color: colors.textPrimary }]} numberOfLines={1}>
                        {currentSong.album?.name ?? 'Unknown Album'}
                    </Text>
                </View>
                <TouchableOpacity style={styles.iconBtn} onPress={() => setShowMenu(true)}>
                    <Ionicons name="ellipsis-horizontal" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
            </View>

            {/* Album Art */}
            <View style={styles.artContainer}>
                {imageUrl ? (
                    <Image
                        source={{ uri: imageUrl }}
                        style={[styles.art, { borderRadius: 32 }]}
                    />
                ) : (
                    <View style={[styles.art, { backgroundColor: colors.card, borderRadius: 32, alignItems: 'center', justifyContent: 'center' }]}>
                        <Ionicons name="musical-notes" size={80} color={colors.textMuted} />
                    </View>
                )}
            </View>

            {/* Info */}
            <View style={styles.infoBox}>
                <Text style={[styles.songName, { color: colors.textPrimary }]} numberOfLines={1}>{currentSong.name}</Text>
                <Text style={[styles.artistName, { color: colors.textSecondary }]} numberOfLines={1}>{artist}</Text>
            </View>

            {/* Seek Bar */}
            <View style={styles.seekSection}>
                <View
                    style={[styles.seekBg, { backgroundColor: colors.bgTertiary }]}
                    onLayout={(e) => setSeekBarWidth(e.nativeEvent.layout.width)}
                    onStartShouldSetResponder={() => true}
                    onMoveShouldSetResponder={() => true}
                    onResponderGrant={(e) => {
                        setIsSeeking(true);
                        const ratio = e.nativeEvent.locationX / seekBarWidth;
                        setSeekValue(Math.max(0, Math.min(ratio * duration, duration)));
                    }}
                    onResponderMove={(e) => {
                        const ratio = e.nativeEvent.locationX / seekBarWidth;
                        setSeekValue(Math.max(0, Math.min(ratio * duration, duration)));
                    }}
                    onResponderRelease={(e) => {
                        const ratio = e.nativeEvent.locationX / seekBarWidth;
                        const val = Math.max(0, Math.min(ratio * duration, duration));
                        handleSeekRelease(val);
                    }}
                >
                    <View style={[styles.seekFill, { backgroundColor: colors.accent, width: `${progress * 100}%` }]} />
                    <View style={[styles.seekThumb, { backgroundColor: colors.accent, left: `${progress * 100}%` }]} />
                </View>
                <View style={styles.timeRow}>
                    <Text style={[styles.timeText, { color: colors.textSecondary }]}>{formatTime(displayPosition)}</Text>
                    <Text style={[styles.timeText, { color: colors.textSecondary }]}>{formatTime(duration)}</Text>
                </View>
            </View>

            {/* Main Controls */}
            <View style={styles.controlsRow}>
                <TouchableOpacity onPress={skipToPrev}>
                    <Ionicons name="play-skip-back" size={28} color={colors.textPrimary} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => seekBackward(10)}>
                    <MaterialCommunityIcons name="rewind-10" size={32} color={colors.textPrimary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.playBtn, { backgroundColor: colors.accent }]}
                    onPress={togglePlay}
                >
                    <Ionicons name={isPlaying ? "pause" : "play"} size={36} color="#FFF" style={!isPlaying ? { marginLeft: 4 } : {}} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => seekForward(10)}>
                    <MaterialCommunityIcons name="fast-forward-10" size={32} color={colors.textPrimary} />
                </TouchableOpacity>

                <TouchableOpacity onPress={skipToNext}>
                    <Ionicons name="play-skip-forward" size={28} color={colors.textPrimary} />
                </TouchableOpacity>
            </View>

            {/* Bottom Toolbar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.bottomIcon}>
                    <MaterialCommunityIcons name="speedometer-slow" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.bottomIcon}>
                    <Ionicons name="timer-outline" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.bottomIcon}>
                    <MaterialIcons name="cast" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.bottomIcon} onPress={() => setShowMenu(true)}>
                    <Ionicons name="ellipsis-vertical" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
            </View>

            {/* Lyrics Section */}
            <TouchableOpacity
                style={styles.lyricsSection}
                onPress={() => setShowLyrics(!showLyrics)}
                activeOpacity={0.9}
            >
                <Ionicons name="chevron-up" size={20} color={colors.textSecondary} />
                <Text style={[styles.lyricsLabel, { color: colors.textPrimary }]}>Lyrics</Text>
            </TouchableOpacity>

            {showMenu && (
                <SongContextMenu
                    song={currentSong}
                    visible={showMenu}
                    onClose={() => setShowMenu(false)}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    noSongText: { ...Typography.body },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: 8,
        marginBottom: 4,
    },
    backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { flex: 1, alignItems: 'center' },
    nowPlaying: { ...Typography.tiny, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 2 },
    albumName: { ...Typography.bodyBold, fontSize: 13 },
    iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    artContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.lg,
        marginVertical: 6,
    },
    art: {
        width: ART_SIZE,
        height: ART_SIZE,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    infoBox: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 14,
        paddingHorizontal: Spacing.xl,
    },
    songName: { ...Typography.h1, fontSize: 26, marginBottom: 6 },
    artistName: { ...Typography.body, fontSize: 16 },
    seekSection: {
        paddingHorizontal: Spacing.xl,
        marginBottom: 14,
    },
    seekBg: { height: 6, borderRadius: 3, position: 'relative', overflow: 'visible' },
    seekFill: { height: 6, borderRadius: 3, position: 'absolute', left: 0, top: 0, bottom: 0 },
    seekThumb: { width: 16, height: 16, borderRadius: 8, position: 'absolute', top: -5, marginLeft: -8 },
    timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
    timeText: { ...Typography.tiny, fontSize: 11 },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.xl,
        marginBottom: 20,
    },
    playBtn: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#FF8C00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
    },
    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.xl,
        marginBottom: 8,
    },
    bottomIcon: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    lyricsSection: {
        alignItems: 'center',
        marginTop: 'auto',
        paddingVertical: 10,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    lyricsLabel: { ...Typography.captionBold, marginTop: 2 },
});

export default PlayerScreen;
