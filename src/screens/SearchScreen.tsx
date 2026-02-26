import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Image,
    StatusBar,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Radius, Spacing, Typography } from '../theme';
import { searchSongs, searchArtists, searchAlbums, searchPlaylists } from '../services/api';
import { Song, Artist, AlbumData, Playlist } from '../types';
import { getHighestQualityImage, getPrimaryArtistName } from '../utils/helpers';
import { usePlayer } from '../hooks/usePlayer';
import SongContextMenu from '../components/SongContextMenu';

type FilterType = 'Songs' | 'Artists' | 'Albums' | 'Playlists' | 'Folders';
const FILTERS: FilterType[] = ['Songs', 'Artists', 'Albums', 'Playlists', 'Folders'];

const SearchScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { playSong, currentSong } = usePlayer();

    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState<FilterType>('Songs');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [contextSong, setContextSong] = useState<Song | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const doSearch = useCallback(async (q: string, currentFilter: FilterType) => {
        if (!q.trim()) { setResults([]); return; }
        if (currentFilter === 'Folders') { setResults([]); return; }
        setLoading(true);
        try {
            let data: any;
            if (currentFilter === 'Songs') data = await searchSongs(q, 0, 20);
            else if (currentFilter === 'Artists') data = await searchArtists(q, 0, 20);
            else if (currentFilter === 'Albums') data = await searchAlbums(q, 0, 20);
            else if (currentFilter === 'Playlists') data = await searchPlaylists(q, 0, 20);

            setResults(data?.results || []);
        } catch (error) {
            console.error('Search failed:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleChange = (text: string) => {
        setQuery(text);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => doSearch(text, filter), 350);
    };

    const handleFilterChange = (f: FilterType) => {
        setFilter(f);
        if (query.trim()) {
            doSearch(query, f);
        }
    };

    const handlePlay = async (song: Song) => {
        await playSong(song, results as Song[]);
        navigation.navigate('Player');
    };

    const renderEmpty = () => {
        if (loading) return null;
        if (query.length > 0 && results.length === 0) {
            return (
                <View style={styles.centered}>
                    <View style={[styles.emptyIconCircle, { backgroundColor: colors.card }]}>
                        <Ionicons name="search" size={40} color={colors.accent} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No results found</Text>
                    <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                        We couldn't find any {filter.toLowerCase()} matching "{query}"
                    </Text>
                </View>
            );
        }
        if (query.length === 0) {
            return (
                <View style={styles.centered}>
                    <Ionicons name="musical-notes-outline" size={80} color={colors.border} />
                    <Text style={[styles.emptyTitle, { color: colors.textPrimary, marginTop: 10 }]}>Search for music</Text>
                    <Text style={[styles.emptySub, { color: colors.textSecondary }]}>Find your favorite songs, artists or albums</Text>
                </View>
            );
        }
        return null;
    };

    const renderSong = ({ item }: { item: Song }) => {
        const img = getHighestQualityImage(item.image);
        const artist = getPrimaryArtistName(item);
        const isActive = currentSong?.id === item.id;
        return (
            <TouchableOpacity
                style={styles.songRow}
                onPress={() => handlePlay(item)}
                activeOpacity={0.75}
            >
                {img ? (
                    <Image source={{ uri: img }} style={styles.songArt} />
                ) : (
                    <View style={[styles.songArt, { backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }]}>
                        <Ionicons name="musical-note" size={18} color={colors.textMuted} />
                    </View>
                )}
                <View style={styles.songInfo}>
                    <Text style={[styles.songName, { color: isActive ? colors.accent : colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[styles.artistName, { color: colors.textSecondary }]} numberOfLines={1}>{artist}</Text>
                </View>
                <TouchableOpacity style={styles.moreBtn} onPress={() => setContextSong(item)}>
                    <Ionicons name="ellipsis-vertical" size={18} color={colors.textMuted} />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    const renderArtist = ({ item }: { item: Artist }) => {
        const img = getHighestQualityImage(item.image);
        return (
            <TouchableOpacity
                style={styles.resultRow}
                onPress={() => navigation.navigate('Artist', { id: item.id, name: item.name })}
                activeOpacity={0.75}
            >
                {img ? (
                    <Image source={{ uri: img }} style={styles.resultImg} />
                ) : (
                    <View style={[styles.resultImg, { backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }]}>
                        <Ionicons name="person" size={22} color={colors.textMuted} />
                    </View>
                )}
                <View style={styles.resultInfo}>
                    <Text style={[styles.resultName, { color: colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[styles.resultMeta, { color: colors.textSecondary }]}>Artist</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
        );
    };

    const renderAlbum = ({ item }: { item: AlbumData }) => {
        const img = getHighestQualityImage(item.image);
        const artist = item.artists?.primary?.map(a => a.name).join(', ') ?? 'Unknown Artist';
        return (
            <TouchableOpacity
                style={styles.resultRow}
                onPress={() => navigation.navigate('Album', { id: item.id, name: item.name })}
                activeOpacity={0.75}
            >
                {img ? (
                    <Image source={{ uri: img }} style={styles.resultImgSquare} />
                ) : (
                    <View style={[styles.resultImgSquare, { backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }]}>
                        <Ionicons name="disc-outline" size={22} color={colors.textMuted} />
                    </View>
                )}
                <View style={styles.resultInfo}>
                    <Text style={[styles.resultName, { color: colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[styles.resultMeta, { color: colors.textSecondary }]}>{artist}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
        );
    };

    const renderPlaylist = ({ item }: { item: Playlist }) => {
        const img = getHighestQualityImage(item.image);
        return (
            <TouchableOpacity
                style={styles.resultRow}
                activeOpacity={0.75}
            >
                {img ? (
                    <Image source={{ uri: img }} style={styles.resultImgSquare} />
                ) : (
                    <View style={[styles.resultImgSquare, { backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }]}>
                        <Ionicons name="list" size={22} color={colors.textMuted} />
                    </View>
                )}
                <View style={styles.resultInfo}>
                    <Text style={[styles.resultName, { color: colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[styles.resultMeta, { color: colors.textSecondary }]}>Playlist · {item.songCount} songs</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
        );
    };

    const renderItem = ({ item }: { item: any }) => {
        if (filter === 'Songs') return renderSong({ item });
        if (filter === 'Artists') return renderArtist({ item });
        if (filter === 'Albums') return renderAlbum({ item });
        if (filter === 'Playlists') return renderPlaylist({ item });
        return null;
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

            {/* Header / Search bar */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={[styles.searchBox, { backgroundColor: colors.card }]}>
                    <Ionicons name="search" size={18} color={colors.textSecondary} />
                    <TextInput
                        style={[styles.input, { color: colors.textPrimary }]}
                        placeholder={`Search ${filter.toLowerCase()}...`}
                        placeholderTextColor={colors.textMuted}
                        value={query}
                        onChangeText={handleChange}
                        autoFocus
                        returnKeyType="search"
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }} style={styles.clearBtn}>
                            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Filters */}
            <View style={styles.filtersScroll}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersContent}
                >
                    {FILTERS.map((f) => (
                        <TouchableOpacity
                            key={f}
                            style={[
                                styles.filterChip,
                                { borderColor: filter === f ? colors.accent : colors.border },
                                filter === f && { backgroundColor: colors.accent },
                            ]}
                            onPress={() => handleFilterChange(f)}
                        >
                            <Text style={[styles.filterText, { color: filter === f ? '#FFF' : colors.textSecondary }]}>{f}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.accent} />
                </View>
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item, i) => item.id || String(i)}
                    renderItem={renderItem}
                    ListEmptyComponent={renderEmpty}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: 12,
        gap: 12,
    },
    backBtn: { padding: 4 },
    searchBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        borderRadius: 22,
        paddingHorizontal: 16,
        gap: 10,
    },
    input: { flex: 1, height: '100%', ...Typography.body },
    clearBtn: { padding: 2 },
    filtersScroll: { maxHeight: 50, marginBottom: 8 },
    filtersContent: { paddingHorizontal: Spacing.lg, alignItems: 'center' },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
    },
    filterText: { ...Typography.captionBold },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingBottom: 100 },
    emptyIconCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    emptyTitle: { ...Typography.h3, textAlign: 'center', marginBottom: 8 },
    emptySub: { ...Typography.body, textAlign: 'center', opacity: 0.7 },
    listContent: { paddingBottom: 120, paddingTop: 4 },
    songRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: 12,
        gap: 12,
    },
    songArt: { width: 50, height: 50, borderRadius: Radius.sm },
    songInfo: { flex: 1 },
    songName: { ...Typography.bodyBold, marginBottom: 2 },
    artistName: { ...Typography.tiny },
    moreBtn: { padding: 8 },
    resultRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: 12,
        gap: 14,
    },
    resultImg: { width: 54, height: 54, borderRadius: 27 },
    resultImgSquare: { width: 54, height: 54, borderRadius: Radius.sm },
    resultInfo: { flex: 1 },
    resultName: { ...Typography.bodyBold, marginBottom: 3 },
    resultMeta: { ...Typography.caption },
});

export default SearchScreen;
