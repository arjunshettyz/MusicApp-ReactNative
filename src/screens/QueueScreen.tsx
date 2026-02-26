import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    FlatList,
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

const QueueScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { playSong } = usePlayer();
    const queue = usePlayerStore((s) => s.queue);
    const currentIndex = usePlayerStore((s) => s.currentIndex);
    const currentSong = usePlayerStore((s) => s.currentSong);
    const removeFromQueue = usePlayerStore((s) => s.removeFromQueue);
    const clearQueue = usePlayerStore((s) => s.clearQueue);

    const handleSongPress = async (song: Song, index: number) => {
        usePlayerStore.getState().setCurrentIndex(index);
        await playSong(song, queue);
    };

    const renderItem = ({ item, index }: { item: Song; index: number }) => {
        const isActive = index === currentIndex;
        const imageUrl = getHighestQualityImage(item.image);
        const artistName = getPrimaryArtistName(item);

        return (
            <TouchableOpacity
                style={[
                    styles.queueItem,
                    { borderBottomColor: colors.divider },
                    isActive && { backgroundColor: colors.accentLight },
                ]}
                onPress={() => handleSongPress(item, index)}
                activeOpacity={0.8}
            >
                <View style={styles.indexCol}>
                    {isActive ? (
                        <Ionicons name="volume-high" size={16} color={colors.accent} />
                    ) : (
                        <Text style={[styles.indexText, { color: colors.textMuted }]}>{index + 1}</Text>
                    )}
                </View>

                {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={[styles.art, { borderRadius: Radius.sm }]} />
                ) : (
                    <View style={[styles.art, { backgroundColor: colors.card, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' }]}>
                        <Ionicons name="musical-note" size={16} color={colors.textMuted} />
                    </View>
                )}

                <View style={styles.info}>
                    <Text style={[styles.songName, { color: isActive ? colors.accent : colors.textPrimary }]} numberOfLines={1}>
                        {item.name}
                    </Text>
                    <Text style={[styles.artistName, { color: colors.textSecondary }]} numberOfLines={1}>
                        {artistName}
                    </Text>
                </View>

                {item.duration && (
                    <Text style={[styles.duration, { color: colors.textMuted }]}>{formatTime(item.duration)}</Text>
                )}

                <TouchableOpacity
                    style={[styles.removeBtn, { backgroundColor: colors.bgSecondary }]}
                    onPress={() => removeFromQueue(index)}
                >
                    <Ionicons name="close" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Queue</Text>
                {queue.length > 0 && (
                    <TouchableOpacity onPress={clearQueue} style={[styles.clearBtn, { backgroundColor: 'rgba(255,85,85,0.1)' }]}>
                        <Text style={[styles.clearText, { color: colors.error }]}>Clear</Text>
                    </TouchableOpacity>
                )}
            </View>

            {currentSong && (
                <View style={[styles.nowPlayingBanner, { backgroundColor: colors.accentLight }]}>
                    <Ionicons name="volume-high" size={14} color={colors.accent} />
                    <Text style={[styles.nowPlayingText, { color: colors.accent }]} numberOfLines={1}>
                        {currentSong.name}
                    </Text>
                </View>
            )}

            {queue.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="musical-notes-outline" size={56} color={colors.border} />
                    <Text style={[styles.emptyText, { color: colors.textPrimary }]}>Queue is empty</Text>
                    <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Play some songs to build your queue</Text>
                    <TouchableOpacity style={[styles.browseBtn, { backgroundColor: colors.accent }]} onPress={() => navigation.goBack()}>
                        <Text style={[styles.browseBtnText, { color: '#FFF' }]}>Browse Songs</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={queue}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    showsVerticalScrollIndicator={false}
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
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    title: { ...Typography.h2, flex: 1, marginLeft: 4 },
    clearBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.sm },
    clearText: { ...Typography.captionBold },
    nowPlayingBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: Spacing.lg,
        paddingVertical: 8,
        marginHorizontal: Spacing.md,
        marginVertical: 8,
        borderRadius: Radius.md,
    },
    nowPlayingText: { ...Typography.captionBold, flex: 1 },
    queueItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        gap: 10,
    },
    indexCol: { width: 24, alignItems: 'center' },
    indexText: { ...Typography.caption },
    art: { width: 46, height: 46 },
    info: { flex: 1 },
    songName: { ...Typography.bodyBold, marginBottom: 2 },
    artistName: { ...Typography.caption },
    duration: { ...Typography.tiny, marginRight: 4 },
    removeBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingBottom: 80 },
    emptyText: { ...Typography.h3 },
    emptySubtext: { ...Typography.body, textAlign: 'center', paddingHorizontal: 40 },
    browseBtn: { marginTop: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
    browseBtnText: { fontWeight: '700', fontSize: 14 },
});

export default QueueScreen;
