import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Radius, Spacing, Typography } from '../theme';
import { Song, AlbumData } from '../types';
import { getHighestQualityImage, formatTime } from '../utils/helpers';
import { usePlayer } from '../hooks/usePlayer';
import { getAlbumById } from '../services/api';
import SongContextMenu from '../components/SongContextMenu';

const AlbumScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { playSong, currentSong } = usePlayer();

    const { id, name: initialName } = route.params ?? {};

    const [album, setAlbum] = useState<AlbumData | null>(null);
    const [loading, setLoading] = useState(true);
    const [contextSong, setContextSong] = useState<Song | null>(null);

    useEffect(() => {
        if (id) fetchAlbumDetails();
    }, [id]);

    const fetchAlbumDetails = async () => {
        setLoading(true);
        try {
            const data = await getAlbumById(id);
            if (data) setAlbum(data);
        } catch (error) {
            console.error('Failed to fetch album data:', error);
        } finally {
            setLoading(false);
        }
    };

    const albumImage = useMemo(() => {
        if (album?.image) return getHighestQualityImage(album.image);
        return '';
    }, [album]);

    const songs = album?.songs || [];
    const artistName = album?.artists?.primary?.map(a => a.name).join(', ') || 'Unknown Artist';

    const handlePlay = async (song: Song) => {
        await playSong(song, songs);
        navigation.navigate('Player');
    };

    const handlePlayAll = async () => {
        if (songs.length > 0) {
            await playSong(songs[0], songs);
            navigation.navigate('Player');
        }
    };

    const renderSong = ({ item, index }: { item: Song; index: number }) => {
        const isActive = currentSong?.id === item.id;
        return (
            <TouchableOpacity
                style={styles.songRow}
                onPress={() => handlePlay(item)}
                activeOpacity={0.7}
            >
                <View style={styles.songIndex}>
                    <Text style={[styles.indexText, { color: isActive ? colors.accent : colors.textMuted }]}>{index + 1}</Text>
                </View>
                <View style={styles.songInfo}>
                    <Text style={[styles.songName, { color: isActive ? colors.accent : colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[styles.songArtist, { color: colors.textSecondary }]} numberOfLines={1}>{album?.name}</Text>
                </View>
                <Text style={[styles.durationText, { color: colors.textMuted }]}>{formatTime(item.duration ?? 0)}</Text>
                <TouchableOpacity style={styles.moreBtn} onPress={() => setContextSong(item)}>
                    <Ionicons name="ellipsis-vertical" size={18} color={colors.textMuted} />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

            <FlatList
                data={songs}
                keyExtractor={(item) => item.id}
                renderItem={renderSong}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 130 }}
                ListHeaderComponent={
                    <View>
                        {/* Nav Header */}
                        <View style={styles.navHeader}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                                <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                            </TouchableOpacity>
                            <View style={{ flex: 1 }} />
                            <TouchableOpacity style={styles.moreHeaderBtn} onPress={() => {
                                if (songs.length > 0) setContextSong(songs[0]);
                            }}>
                                <Ionicons name="ellipsis-horizontal" size={24} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        {/* Album Header Body */}
                        <View style={styles.albumHeaderBody}>
                            <View style={styles.artShadowBox}>
                                {albumImage ? (
                                    <Image source={{ uri: albumImage }} style={[styles.albumArt, { borderRadius: Radius.md }]} />
                                ) : (
                                    <View style={[styles.albumArt, { backgroundColor: colors.card, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' }]}>
                                        <Ionicons name="disc-outline" size={80} color={colors.textMuted} />
                                    </View>
                                )}
                            </View>

                            <View style={styles.albumMetaBody}>
                                <Text style={[styles.albumNameTitle, { color: colors.textPrimary }]}>{album?.name || initialName}</Text>
                                <TouchableOpacity onPress={() => {
                                    if (album?.artists?.primary?.[0]) {
                                        navigation.navigate('Artist', { id: album.artists.primary[0].id, name: album.artists.primary[0].name });
                                    }
                                }}>
                                    <Text style={[styles.artistNameLink, { color: colors.accent }]}>{artistName}</Text>
                                </TouchableOpacity>
                                <Text style={[styles.albumStats, { color: colors.textSecondary }]}>
                                    Album  ·  {album?.year}  ·  {songs.length} songs
                                </Text>
                            </View>
                        </View>

                        {/* Controls */}
                        <View style={styles.controlsRow}>
                            <TouchableOpacity
                                style={[styles.playCircleBtn, { backgroundColor: colors.accent }]}
                                onPress={handlePlayAll}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="play" size={28} color="#FFF" />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.shuffleBtn, { borderColor: colors.border }]}>
                                <Ionicons name="shuffle" size={22} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                }
            />

            {contextSong && (
                <SongContextMenu
                    song={contextSong}
                    visible={!!contextSong}
                    onClose={() => setContextSong(null)}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    navHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: 12,
    },
    backBtn: { padding: 4 },
    moreHeaderBtn: { padding: 4 },
    albumHeaderBody: {
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingTop: 10,
        paddingBottom: 24,
    },
    artShadowBox: {
        width: 200,
        height: 200,
        marginBottom: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    albumArt: { width: '100%', height: '100%' },
    albumMetaBody: { alignItems: 'center', gap: 6 },
    albumNameTitle: { ...Typography.h1, fontSize: 24, textAlign: 'center' },
    artistNameLink: { ...Typography.bodyBold, fontSize: 16 },
    albumStats: { ...Typography.tiny, opacity: 0.7 },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 20,
    },
    playCircleBtn: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
    },
    shuffleBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    songRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: 10,
        gap: 12,
    },
    songIndex: { width: 30, alignItems: 'center' },
    indexText: { ...Typography.caption, fontSize: 13 },
    songInfo: { flex: 1 },
    songName: { ...Typography.bodyBold, marginBottom: 2, fontSize: 15 },
    songArtist: { ...Typography.tiny, opacity: 0.6 },
    durationText: { ...Typography.tiny, width: 40, textAlign: 'right', opacity: 0.6 },
    moreBtn: { padding: 8 },
});

export default AlbumScreen;
