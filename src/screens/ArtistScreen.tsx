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
import { Song, Artist, AlbumData } from '../types';
import { getHighestQualityImage, getPrimaryArtistName, formatTime } from '../utils/helpers';
import { usePlayer } from '../hooks/usePlayer';
import { getArtistById, getArtistSongs, getArtistAlbums } from '../services/api';
import SongContextMenu from '../components/SongContextMenu';

const ArtistScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { playSong, currentSong } = usePlayer();

    const { id, name: initialName, songs: initialSongs = [] } = route.params ?? {};

    const [artist, setArtist] = useState<Artist | null>(null);
    const [songs, setSongs] = useState<Song[]>(initialSongs);
    const [albums, setAlbums] = useState<AlbumData[]>([]);
    const [loading, setLoading] = useState(!!id);
    const [contextSong, setContextSong] = useState<Song | null>(null);

    useEffect(() => {
        if (id) {
            fetchArtistData();
        }
    }, [id]);

    const fetchArtistData = async () => {
        setLoading(true);
        try {
            const [details, topSongs, artistAlbums] = await Promise.all([
                getArtistById(id),
                getArtistSongs(id),
                getArtistAlbums(id)
            ]);
            if (details) setArtist(details);
            if (topSongs.length > 0) setSongs(topSongs);
            setAlbums(artistAlbums);
        } catch (error) {
            console.error('Failed to fetch artist data:', error);
        } finally {
            setLoading(false);
        }
    };

    const artistImage = useMemo(() => {
        if (artist?.image) return getHighestQualityImage(artist.image);
        if (songs.length > 0) return getHighestQualityImage(songs[0].image);
        return '';
    }, [artist, songs]);

    const artistName = artist?.name || initialName;
    const fanCount = artist?.fanCount ? parseInt(artist.fanCount).toLocaleString() : null;

    const handlePlay = async (song: Song) => {
        await playSong(song, songs);
        navigation.navigate('Player');
    };

    const handleShuffle = async () => {
        const shuffled = [...songs].sort(() => Math.random() - 0.5);
        if (shuffled.length > 0) {
            await playSong(shuffled[0], shuffled);
            navigation.navigate('Player');
        }
    };

    const handlePlayAll = async () => {
        if (songs.length > 0) {
            await playSong(songs[0], songs);
            navigation.navigate('Player');
        }
    };

    const renderSong = ({ item }: { item: Song }) => {
        const img = getHighestQualityImage(item.image);
        const isActive = currentSong?.id === item.id;
        return (
            <TouchableOpacity
                style={[styles.songRow, { borderBottomColor: colors.divider }]}
                onPress={() => handlePlay(item)}
                activeOpacity={0.75}
            >
                {img ? (
                    <Image source={{ uri: img }} style={[styles.songThumb, { borderRadius: Radius.sm }]} />
                ) : (
                    <View style={[styles.songThumb, { backgroundColor: colors.card, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' }]}>
                        <Ionicons name="musical-note" size={18} color={colors.textMuted} />
                    </View>
                )}
                <View style={styles.songInfo}>
                    <Text style={[styles.songName, { color: isActive ? colors.accent : colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[styles.songArtist, { color: colors.textSecondary }]} numberOfLines={1}>{getPrimaryArtistName(item)}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.playBtn, { backgroundColor: colors.accent }]}
                    onPress={() => handlePlay(item)}
                >
                    <Ionicons name="play" size={13} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.moreBtn} onPress={() => setContextSong(item)}>
                    <Ionicons name="ellipsis-vertical" size={18} color={colors.textMuted} />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    const renderAlbum = ({ item }: { item: AlbumData }) => {
        const img = getHighestQualityImage(item.image);
        return (
            <TouchableOpacity
                style={styles.albumCard}
                onPress={() => navigation.navigate('Album', { id: item.id, name: item.name })}
                activeOpacity={0.8}
            >
                {img ? (
                    <Image source={{ uri: img }} style={[styles.albumArt, { borderRadius: Radius.md }]} />
                ) : (
                    <View style={[styles.albumArt, { backgroundColor: colors.card, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' }]}>
                        <Ionicons name="disc-outline" size={32} color={colors.textMuted} />
                    </View>
                )}
                <Text style={[styles.albumName, { color: colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.albumYear, { color: colors.textSecondary }]}>{item.year}</Text>
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
                contentContainerStyle={{ paddingBottom: 120 }}
                ListHeaderComponent={
                    <View>
                        {/* Header */}
                        <View style={styles.navHeader}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                                <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
                            </TouchableOpacity>
                            <View style={{ flex: 1 }} />
                            <TouchableOpacity style={styles.moreHeaderBtn} onPress={() => {
                                if (songs.length > 0) setContextSong(songs[0]);
                            }}>
                                <Ionicons name="ellipsis-horizontal" size={22} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        {/* Artist art */}
                        <View style={styles.artWrap}>
                            <View style={styles.artShadowBox}>
                                {artistImage ? (
                                    <Image source={{ uri: artistImage }} style={[styles.artistArt, { borderRadius: Radius.xl }]} />
                                ) : (
                                    <View style={[styles.artistArt, { backgroundColor: colors.card, borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center' }]}>
                                        <Ionicons name="person" size={60} color={colors.textMuted} />
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Artist info */}
                        <View style={styles.artistInfo}>
                            <View style={styles.nameRow}>
                                <Text style={[styles.artistName, { color: colors.textPrimary }]}>{artistName}</Text>
                                {artist?.isVerified && <Ionicons name="checkmark-circle" size={20} color={colors.accent} />}
                            </View>
                            <Text style={[styles.artistStats, { color: colors.textSecondary }]}>
                                {fanCount ? `${fanCount} Fans  |  ` : ''}{songs.length} Top Songs
                            </Text>
                        </View>

                        {/* Shuffle + Play buttons */}
                        <View style={styles.buttonsRow}>
                            <TouchableOpacity
                                style={[styles.shuffleBtn, { backgroundColor: colors.accent }]}
                                onPress={handleShuffle}
                            >
                                <Ionicons name="shuffle" size={18} color="#FFF" />
                                <Text style={styles.shuffleBtnText}>Shuffle</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.playAllBtn, { borderColor: colors.border }]}
                                onPress={handlePlayAll}
                            >
                                <Ionicons name="play" size={18} color={colors.textPrimary} />
                                <Text style={[styles.playAllBtnText, { color: colors.textPrimary }]}>Play All</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Albums Horizontal List */}
                        {albums.length > 0 && (
                            <View style={styles.albumsSection}>
                                <View style={styles.sectionHeader}>
                                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Albums</Text>
                                </View>
                                <FlatList
                                    data={albums}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={(item) => item.id}
                                    renderItem={renderAlbum}
                                    contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
                                />
                            </View>
                        )}

                        {/* Songs header */}
                        <View style={[styles.sectionHeader, { borderBottomColor: colors.border, marginTop: 10 }]}>
                            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Popular Songs</Text>
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
    artWrap: { alignItems: 'center', paddingVertical: 16 },
    artShadowBox: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    artistArt: { width: 200, height: 200 },
    artistInfo: { alignItems: 'center', paddingHorizontal: Spacing.xl, marginBottom: 24 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
    artistName: { ...Typography.h1, fontSize: 28, textAlign: 'center' },
    artistStats: { ...Typography.caption, textAlign: 'center', fontSize: 13 },
    buttonsRow: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        gap: 12,
        marginBottom: 30,
    },
    shuffleBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: Radius.lg,
        gap: 8,
    },
    shuffleBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
    playAllBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: Radius.lg,
        borderWidth: 1.5,
        gap: 8,
    },
    playAllBtnText: { fontWeight: '700', fontSize: 16 },
    albumsSection: { marginBottom: 30 },
    albumCard: { width: 130, marginRight: 16 },
    albumArt: { width: 130, height: 130, marginBottom: 8 },
    albumName: { ...Typography.captionBold, fontSize: 14, marginBottom: 2 },
    albumYear: { ...Typography.tiny, fontSize: 12 },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: 14,
    },
    sectionTitle: { ...Typography.h3, fontSize: 19 },
    songRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        gap: 12,
    },
    songThumb: { width: 50, height: 50 },
    songInfo: { flex: 1 },
    songName: { ...Typography.bodyBold, marginBottom: 2 },
    songArtist: { ...Typography.caption },
    playBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    moreBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
});

export default ArtistScreen;
