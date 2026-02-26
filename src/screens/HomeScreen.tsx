import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
    ScrollView,
    Image,
    Dimensions,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Radius, Spacing, Typography } from '../theme';
import { searchSongs } from '../services/api';
import { Song } from '../types';
import SongCard from '../components/SongCard';
import SortModal, { SortOption } from '../components/SortModal';
import SongContextMenu from '../components/SongContextMenu';
import { usePlayer } from '../hooks/usePlayer';
import { usePlayerStore } from '../store/playerStore';
import { getHighestQualityImage, getPrimaryArtistName } from '../utils/helpers';

const LIMIT = 20;
const DEFAULT_QUERY = 'hindi hits';
const TABS = ['Suggested', 'Songs', 'Artists', 'Albums', 'Folders'];
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { playSong, currentSong } = usePlayer();

    const [activeTab, setActiveTab] = useState(0);
    const [songs, setSongs] = useState<Song[]>([]);
    const [query, setQuery] = useState('');
    const [activeQuery, setActiveQuery] = useState(DEFAULT_QUERY);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [sortOption, setSortOption] = useState<SortOption>('ascending');
    const [showSort, setShowSort] = useState(false);
    const [contextSong, setContextSong] = useState<Song | null>(null);

    const queue = usePlayerStore((s) => s.queue);
    const recentPlayed = React.useMemo(() => queue.slice(0, 8), [queue]);

    const fetchSongs = useCallback(async (q: string, p: number, append = false) => {
        if (append) setLoadingMore(true);
        else setLoading(true);
        setError(null);
        try {
            const data = await searchSongs(q, p, LIMIT);
            setSongs((prev) => append ? [...prev, ...data.results] : data.results);
            setTotal(data.total);
            setPage(p);
        } catch {
            setError('Failed to load songs. Check your connection.');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [LIMIT]);

    useEffect(() => { fetchSongs(DEFAULT_QUERY, 0); }, [fetchSongs]);

    const handleSearch = React.useCallback(() => navigation.navigate('Search'), [navigation]);

    const handleSongPress = useCallback(async (song: Song) => {
        await playSong(song, songs);
        navigation.navigate('Player');
    }, [songs, playSong, navigation]);

    const handleLoadMore = () => {
        if (loadingMore || loading) return;
        if ((page + 1) * LIMIT >= total) return;
        fetchSongs(activeQuery, page + 1, true);
    };

    const sortedSongs = React.useMemo(() => {
        return [...songs].sort((a, b) => {
            const artistA = getPrimaryArtistName(a).toLowerCase();
            const artistB = getPrimaryArtistName(b).toLowerCase();
            switch (sortOption) {
                case 'ascending': return a.name.localeCompare(b.name);
                case 'descending': return b.name.localeCompare(a.name);
                case 'artist': return artistA.localeCompare(artistB);
                case 'year': return (parseInt(b.year ?? '0', 10) || 0) - (parseInt(a.year ?? '0', 10) || 0);
                default: return 0;
            }
        });
    }, [songs, sortOption]);

    const artists = React.useMemo(() => {
        const artistMap = new Map<string, { id?: string; name: string; img: string; songs: Song[] }>();
        songs.forEach((s) => {
            const primaryArtists = s.artists?.primary || [];
            if (primaryArtists.length === 0) {
                const name = 'Unknown Artist';
                if (!artistMap.has(name)) artistMap.set(name, { name, img: getHighestQualityImage(s.image), songs: [] });
                artistMap.get(name)!.songs.push(s);
                return;
            }

            primaryArtists.forEach((a) => {
                const key = a.id || a.name;
                if (!artistMap.has(key)) {
                    artistMap.set(key, {
                        id: a.id,
                        name: a.name,
                        img: getHighestQualityImage(a.image && a.image.length > 0 ? a.image : s.image),
                        songs: []
                    });
                }
                artistMap.get(key)!.songs.push(s);
            });
        });
        return Array.from(artistMap.values()).slice(0, 40);
    }, [songs]);

    const albums = React.useMemo(() => {
        const albumMap = new Map<string, { id: string | null; name: string; img: string; artist: string; year: string | null; count: number }>();
        songs.forEach((s) => {
            const name = s.album?.name ?? 'Unknown Album';
            if (!albumMap.has(name)) {
                albumMap.set(name, {
                    id: s.album?.id || null,
                    name,
                    img: getHighestQualityImage(s.image),
                    artist: getPrimaryArtistName(s),
                    year: s.year,
                    count: 0
                });
            }
            albumMap.get(name)!.count += 1;
        });
        return Array.from(albumMap.values()).slice(0, 24);
    }, [songs]);

    const getSortLabel = () => {
        const map: Record<string, string> = {
            ascending: 'Ascending', descending: 'Descending', artist: 'Artist',
            album: 'Album', year: 'Year', date_added: 'Date Added',
            date_modified: 'Date Modified', composer: 'Composer',
        };
        return map[sortOption] ?? 'Sort';
    };
    const renderTabContent = () => {
        if (loading && songs.length === 0) {
            return <View style={styles.centered}><ActivityIndicator size="large" color={colors.accent} /></View>;
        }
        if (error) {
            return (
                <View style={styles.centered}>
                    <Ionicons name="wifi-outline" size={48} color={colors.border} />
                    <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
                    <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.accent }]} onPress={() => fetchSongs(activeQuery, 0)}>
                        <Text style={[styles.retryText, { color: colors.white }]}>Retry</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        switch (activeTab) {
            // ── Suggested ──
            case 0:
                return (
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
                        {recentPlayed.length > 0 && (
                            <>
                                <View style={styles.sectionHeader}>
                                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recently Played</Text>
                                    <TouchableOpacity onPress={() => setActiveTab(1)}>
                                        <Text style={[styles.seeAll, { color: colors.accent }]}>See All</Text>
                                    </TouchableOpacity>
                                </View>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.lg }}>
                                    {recentPlayed.map((song) => {
                                        const img = getHighestQualityImage(song.image);
                                        return (
                                            <TouchableOpacity key={song.id} style={styles.recentCard} onPress={() => handleSongPress(song)} activeOpacity={0.8}>
                                                {img ? (
                                                    <Image source={{ uri: img }} style={[styles.recentArt, { borderRadius: Radius.md, backgroundColor: colors.card }]} />
                                                ) : (
                                                    <View style={[styles.recentArt, { backgroundColor: colors.card, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' }]}>
                                                        <Ionicons name="musical-note" size={24} color={colors.textMuted} />
                                                    </View>
                                                )}
                                                <Text style={[styles.recentName, { color: colors.textPrimary }]} numberOfLines={2}>{song.name}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </>
                        )}

                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Artists</Text>
                            <TouchableOpacity onPress={() => setActiveTab(2)}>
                                <Text style={[styles.seeAll, { color: colors.accent }]}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.lg }}>
                            {artists.slice(0, 8).map((a) => (
                                <TouchableOpacity key={a.id || a.name} style={styles.artistCircleWrap}
                                    onPress={() => navigation.navigate('Artist', { id: a.id, name: a.name })}>
                                    {a.img ? (
                                        <Image source={{ uri: a.img }} style={[styles.artistCircle, { borderColor: colors.border }]} />
                                    ) : (
                                        <View style={[styles.artistCircle, { backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderColor: colors.border }]}>
                                            <Ionicons name="person" size={26} color={colors.textMuted} />
                                        </View>
                                    )}
                                    <Text style={[styles.artistCircleName, { color: colors.textPrimary }]} numberOfLines={1}>{a.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Most Played</Text>
                            <TouchableOpacity onPress={() => setActiveTab(1)}>
                                <Text style={[styles.seeAll, { color: colors.accent }]}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        {sortedSongs.slice(0, 8).map((song, index) => (
                            <SongCard key={song.id} song={song} onPress={handleSongPress} index={index} isActive={currentSong?.id === song.id} />
                        ))}
                    </ScrollView>
                );

            // ── Songs ──
            case 1:
                return (
                    <>
                        <View style={[styles.sortBar, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.songCount, { color: colors.textSecondary }]}>{total.toLocaleString()} songs</Text>
                            <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSort(true)}>
                                <Text style={[styles.sortLabel, { color: colors.accent }]}>{getSortLabel()}</Text>
                                <Ionicons name="swap-vertical-outline" size={16} color={colors.accent} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            key="songs-list"
                            data={sortedSongs}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item, index }) => (
                                <SongCard song={item} onPress={handleSongPress} index={index} isActive={currentSong?.id === item.id} />
                            )}
                            onEndReached={handleLoadMore}
                            onEndReachedThreshold={0.4}
                            ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.accent} style={{ padding: 16 }} /> : null}
                            contentContainerStyle={{ paddingBottom: 130, paddingTop: 4 }}
                            showsVerticalScrollIndicator={false}
                            initialNumToRender={10}
                            maxToRenderPerBatch={10}
                            windowSize={10}
                            removeClippedSubviews={Platform.OS === 'android'}
                        />
                    </>
                );

            // ── Artists ──
            case 2:
                return (
                    <>
                        <View style={[styles.sortBar, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.songCount, { color: colors.textSecondary }]}>{artists.length} artists</Text>
                            <TouchableOpacity style={styles.sortBtn}>
                                <Text style={[styles.sortLabel, { color: colors.accent }]}>Date Added</Text>
                                <Ionicons name="swap-vertical-outline" size={16} color={colors.accent} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            key="artists-list"
                            data={artists}
                            keyExtractor={(a) => a.id || a.name}
                            renderItem={({ item: a }) => (
                                <TouchableOpacity
                                    style={[styles.artistRow, { borderBottomColor: colors.divider }]}
                                    onPress={() => navigation.navigate('Artist', { id: a.id, name: a.name })}
                                    activeOpacity={0.75}
                                >
                                    {a.img ? (
                                        <Image source={{ uri: a.img }} style={styles.artistListImg} />
                                    ) : (
                                        <View style={[styles.artistListImg, { backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }]}>
                                            <Ionicons name="person" size={24} color={colors.textMuted} />
                                        </View>
                                    )}
                                    <View style={styles.artistListInfo}>
                                        <Text style={[styles.artistListName, { color: colors.textPrimary }]} numberOfLines={1}>{a.name}</Text>
                                        <Text style={[styles.artistListMeta, { color: colors.textSecondary }]}>
                                            {Array.from(new Set(a.songs.map(s => s.album?.name).filter(Boolean))).length} Album  |  {a.songs.length} Songs
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                                </TouchableOpacity>
                            )}
                            contentContainerStyle={{ paddingBottom: 130 }}
                            showsVerticalScrollIndicator={false}
                            initialNumToRender={10}
                            maxToRenderPerBatch={10}
                            windowSize={5}
                            removeClippedSubviews={Platform.OS === 'android'}
                        />
                    </>
                );

            // ── Albums ──
            case 3:
                return (
                    <>
                        <View style={styles.tabHeader}>
                            <Text style={[styles.tabSubCount, { color: colors.textPrimary }]}>{albums.length} albums</Text>
                            <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSort(true)}>
                                <Text style={[styles.sortLabel, { color: colors.accent }]}>{getSortLabel()}</Text>
                                <Ionicons name="swap-vertical-outline" size={16} color={colors.accent} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            key="albums-list"
                            data={albums}
                            keyExtractor={(a) => a.name}
                            numColumns={2}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.albumGridCard}
                                    onPress={() => navigation.navigate('Album', { id: (item as any).id, name: item.name })}
                                >
                                    <View style={styles.albumArtWrap}>
                                        {item.img ? (
                                            <Image source={{ uri: item.img }} style={[styles.albumGridArt, { borderRadius: Radius.md }]} />
                                        ) : (
                                            <View style={[styles.albumGridArt, { backgroundColor: colors.card, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' }]}>
                                                <Ionicons name="disc-outline" size={40} color={colors.textMuted} />
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.albumGridHeader}>
                                        <Text style={[styles.albumGridName, { color: colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
                                        <TouchableOpacity onPress={() => {
                                            const albumSongs = songs.filter(s => s.album?.name === item.name);
                                            if (albumSongs.length > 0) setContextSong(albumSongs[0]);
                                        }}>
                                            <Ionicons name="ellipsis-vertical" size={16} color={colors.textPrimary} />
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={[styles.albumGridArtist, { color: colors.textSecondary }]} numberOfLines={1}>
                                        {item.artist}{item.year ? `  |  ${item.year}` : ''}
                                    </Text>
                                    <Text style={[styles.albumGridCount, { color: colors.textSecondary }]}>{item.count} songs</Text>
                                </TouchableOpacity>
                            )}
                            contentContainerStyle={{ padding: 12, paddingBottom: 130 }}
                            showsVerticalScrollIndicator={false}
                            initialNumToRender={6}
                            maxToRenderPerBatch={6}
                            windowSize={5}
                            removeClippedSubviews={Platform.OS === 'android'}
                        />
                    </>
                );

            // ── Folders ──
            case 4:
                return (
                    <View style={styles.centered}>
                        <Ionicons name="folder-open-outline" size={60} color={colors.border} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Folders feature coming soon</Text>
                    </View>
                );

            default: return null;
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.logoRow}>
                    <Ionicons name="musical-note" size={24} color={colors.accent} />
                    <Text style={[styles.appName, { color: colors.textPrimary }]}>Mume</Text>
                </View>
                <TouchableOpacity onPress={handleSearch} style={styles.iconBtn}>
                    <Ionicons name="search-outline" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabsContent}
                >
                    {TABS.map((tab, i) => (
                        <TouchableOpacity
                            key={tab}
                            style={styles.tab}
                            onPress={() => setActiveTab(i)}
                        >
                            <Text style={[styles.tabText, { color: activeTab === i ? colors.accent : colors.textSecondary }]}>{tab}</Text>
                            {activeTab === i && <View style={[styles.tabUnderline, { backgroundColor: colors.accent }]} />}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Tab content */}
            <View style={{ flex: 1 }}>
                {renderTabContent()}
            </View>
            <SortModal visible={showSort} selected={sortOption} onChange={setSortOption} onClose={() => setShowSort(false)} />
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

const ALBUM_W = (SCREEN_WIDTH / 2) - 20;

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: 12,
    },
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    appName: { ...Typography.h2, fontSize: 20 },
    iconBtn: { padding: 4 },
    tabsContent: { paddingHorizontal: Spacing.md, alignItems: 'center' },
    tab: { paddingHorizontal: 14, paddingVertical: 14, position: 'relative' },
    tabText: { ...Typography.bodyBold, fontSize: 13 },
    tabUnderline: { position: 'absolute', bottom: 0, left: 14, right: 14, height: 3, borderRadius: 1.5 },
    tabHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: 14,
    },
    tabSubCount: { ...Typography.captionBold, opacity: 0.8 },
    sortBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: 10,
    },
    songCount: { ...Typography.captionBold, opacity: 0.7 },
    sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    sortLabel: { ...Typography.captionBold },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingBottom: 80 },
    emptyText: { ...Typography.body, opacity: 0.6 },
    errorText: { textAlign: 'center', paddingHorizontal: 32, ...Typography.body },
    retryBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 24, marginTop: 12 },
    retryText: { fontWeight: '700' },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        marginTop: 20,
        marginBottom: 10,
    },
    sectionTitle: { ...Typography.h3 },
    seeAll: { ...Typography.captionBold },
    recentCard: { width: 110, marginRight: 12 },
    recentArt: { width: 110, height: 110, marginBottom: 6 },
    recentName: { ...Typography.captionBold, textAlign: 'left' },
    artistCircleWrap: { width: 80, alignItems: 'center', marginRight: 16 },
    artistCircle: { width: 70, height: 70, borderRadius: 35, marginBottom: 6, borderWidth: 1 },
    artistCircleName: { ...Typography.captionBold, textAlign: 'center' },
    artistRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: 12,
        gap: 14,
    },
    artistListImg: { width: 54, height: 54, borderRadius: 27 },
    artistListInfo: { flex: 1 },
    artistListName: { ...Typography.bodyBold, marginBottom: 3 },
    artistListMeta: { ...Typography.caption },
    albumGridCard: {
        flex: 1,
        margin: 8,
        maxWidth: (SCREEN_WIDTH / 2) - 24,
    },
    albumArtWrap: {
        width: '100%',
        aspectRatio: 1,
        marginBottom: 8,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    albumGridArt: { width: '100%', height: '100%' },
    albumGridHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    albumGridName: { ...Typography.bodyBold, flex: 1, marginRight: 4 },
    albumGridArtist: { ...Typography.tiny, marginBottom: 2 },
    albumGridCount: { ...Typography.tiny, opacity: 0.7 },
});

export default HomeScreen;
