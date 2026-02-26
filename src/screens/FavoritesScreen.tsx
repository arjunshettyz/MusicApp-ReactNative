import React from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Radius, Spacing, Typography } from '../theme';
import { usePlayerStore } from '../store/playerStore';
import { usePlayer } from '../hooks/usePlayer';
import { getHighestQualityImage, getPrimaryArtistName, formatTime } from '../utils/helpers';
import { Song } from '../types';

const FavoritesScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { playSong } = usePlayer();
    const favorites = usePlayerStore((s) => s.favorites);
    const toggleFavorite = usePlayerStore((s) => s.toggleFavorite);
    const currentSong = usePlayerStore((s) => s.currentSong);

    const handlePlay = async (song: Song) => {
        await playSong(song, favorites);
        navigation.navigate('Player');
    };

    const renderItem = ({ item }: { item: Song }) => {
        const img = getHighestQualityImage(item.image);
        const artist = getPrimaryArtistName(item);
        const isActive = currentSong?.id === item.id;

        return (
            <TouchableOpacity
                style={[styles.row, { borderBottomColor: colors.divider }]}
                onPress={() => handlePlay(item)}
                activeOpacity={0.75}
            >
                {img ? (
                    <Image source={{ uri: img }} style={[styles.thumb, { borderRadius: Radius.sm }]} />
                ) : (
                    <View style={[styles.thumb, { backgroundColor: colors.card, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' }]}>
                        <Ionicons name="musical-note" size={18} color={colors.textMuted} />
                    </View>
                )}
                <View style={styles.info}>
                    <Text style={[styles.songName, { color: isActive ? colors.accent : colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[styles.artistName, { color: colors.textSecondary }]} numberOfLines={1}>
                        {artist}{item.duration ? `  ·  ${formatTime(item.duration)}` : ''}
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.playBtn, { backgroundColor: colors.accent }]}
                    onPress={() => handlePlay(item)}
                >
                    <Ionicons name="play" size={13} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.heartBtn} onPress={() => toggleFavorite(item)}>
                    <Ionicons name="heart" size={20} color={colors.heart} />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Favorites</Text>
                {favorites.length > 0 && (
                    <Text style={[styles.count, { color: colors.textSecondary }]}>{favorites.length} songs</Text>
                )}
            </View>

            {favorites.length === 0 ? (
                <View style={styles.centered}>
                    <Ionicons name="heart-outline" size={64} color={colors.border} />
                    <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No favorites yet</Text>
                    <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                        Tap ♥ on any song to save it here
                    </Text>
                    <TouchableOpacity
                        style={[styles.browseBtn, { backgroundColor: colors.accent }]}
                        onPress={() => navigation.navigate('Home')}
                    >
                        <Text style={{ color: '#FFF', fontWeight: '700' }}>Browse Songs</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={favorites}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 130 }}
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
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    title: { ...Typography.h2 },
    count: { ...Typography.caption },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        gap: 12,
    },
    thumb: { width: 50, height: 50 },
    info: { flex: 1 },
    songName: { ...Typography.bodyBold, marginBottom: 2 },
    artistName: { ...Typography.caption },
    playBtn: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
    heartBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingBottom: 80 },
    emptyTitle: { ...Typography.h3, fontSize: 18 },
    emptySubtitle: { ...Typography.body, textAlign: 'center', paddingHorizontal: 40 },
    browseBtn: { marginTop: 8, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 24 },
});

export default FavoritesScreen;
