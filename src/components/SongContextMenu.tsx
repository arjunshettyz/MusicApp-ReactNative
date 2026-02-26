import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Radius, Spacing, Typography } from '../theme';
import { Song } from '../types';
import { getHighestQualityImage, getPrimaryArtistName, formatTime } from '../utils/helpers';
import { usePlayerStore } from '../store/playerStore';
import { usePlayer } from '../hooks/usePlayer';

interface Props {
    song: Song;
    visible: boolean;
    onClose: () => void;
    onNavigateToArtist?: () => void;
}

const SongContextMenu: React.FC<Props> = ({ song, visible, onClose, onNavigateToArtist }) => {
    const { colors } = useTheme();
    const { playSong } = usePlayer();
    const toggleFavorite = usePlayerStore((s) => s.toggleFavorite);
    const isFavorite = usePlayerStore((s) => s.isFavorite);
    const addToQueue = usePlayerStore((s) => s.addToQueue);

    const img = getHighestQualityImage(song.image);
    const artist = getPrimaryArtistName(song);
    const fav = isFavorite(song.id);

    const actions = [
        {
            icon: 'play-forward-outline' as const,
            label: 'Play Next',
            onPress: () => {
                const store = usePlayerStore.getState();
                store.addToQueue(song); // Simplification: in a real app this might insert after current
                onClose();
            },
        },
        {
            icon: 'reader-outline' as const,
            label: 'Add to Playing Queue',
            onPress: () => { addToQueue(song); onClose(); },
        },
        {
            icon: 'add-circle-outline' as const,
            label: 'Add to Playlist',
            onPress: () => { onClose(); },
        },
        {
            icon: 'play-circle-outline' as const,
            label: 'Go to Album',
            onPress: () => { onClose(); },
        },
        {
            icon: 'person-outline' as const,
            label: 'Go to Artist',
            onPress: () => { onNavigateToArtist?.(); onClose(); },
        },
        {
            icon: 'information-circle-outline' as const,
            label: 'Details',
            onPress: () => { onClose(); },
        },
        {
            icon: 'call-outline' as const,
            label: 'Set as Ringtone',
            onPress: () => { onClose(); },
        },
        {
            icon: 'close-circle-outline' as const,
            label: 'Add to Blacklist',
            onPress: () => { onClose(); },
        },
        {
            icon: 'send-outline' as const,
            label: 'Share',
            onPress: () => { onClose(); },
        },
        {
            icon: 'trash-outline' as const,
            label: 'Delete from Device',
            onPress: () => { onClose(); },
        },
    ];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            />
            <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
                {/* Handle */}
                <View style={[styles.handle, { backgroundColor: colors.border }]} />

                {/* Song header */}
                <View style={[styles.songHeader, { borderBottomColor: colors.border }]}>
                    {img ? (
                        <Image source={{ uri: img }} style={[styles.songArt, { borderRadius: Radius.md }]} />
                    ) : (
                        <View style={[styles.songArt, { backgroundColor: colors.card, borderRadius: Radius.md }]} />
                    )}
                    <View style={styles.songMeta}>
                        <Text style={[styles.songName, { color: colors.textPrimary }]} numberOfLines={1}>
                            {song.name}
                        </Text>
                        <Text style={[styles.artistName, { color: colors.textSecondary }]} numberOfLines={1}>
                            {artist}{song.duration ? `  |  ${formatTime(song.duration)} mins` : ''}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => { toggleFavorite(song); }}>
                        <Ionicons
                            name={fav ? 'heart' : 'heart-outline'}
                            size={26}
                            color={fav ? colors.heart : colors.textPrimary}
                        />
                    </TouchableOpacity>
                </View>

                {/* Actions */}
                <ScrollView showsVerticalScrollIndicator={false}>
                    {actions.map((action) => (
                        <TouchableOpacity
                            key={action.label}
                            style={styles.action}
                            onPress={action.onPress}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={action.icon}
                                size={24}
                                color={colors.textPrimary}
                            />
                            <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>
                                {action.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingBottom: 40,
        maxHeight: '85%',
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    handle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 8,
    },
    songHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingVertical: 20,
        gap: 16,
    },
    songArt: { width: 64, height: 64 },
    songMeta: { flex: 1 },
    songName: { ...Typography.h2, fontSize: 18, marginBottom: 4 },
    artistName: { ...Typography.body, fontSize: 13 },
    action: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingVertical: 14,
        gap: 18,
    },
    actionLabel: { ...Typography.body, fontSize: 15, fontWeight: '500' },
});

export default SongContextMenu;
